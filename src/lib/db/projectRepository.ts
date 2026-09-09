import dbConnect from './mongodb';
import { ProjectModel } from './models';
import { Project } from '../domain/types';
import { nanoid } from 'nanoid';

export async function getProject(id: string): Promise<Project | null> {
  await dbConnect();
  const doc = await ProjectModel.findOne({ id }).lean();
  if (!doc) return null;
  // Exclude _id and __v
  const { _id, __v, ...project } = doc as any;
  return project as Project;
}

export async function listProjects(ownerSessionId: string): Promise<Pick<Project, 'id' | 'name' | 'updatedAt'>[]> {
  await dbConnect();
  const docs = await ProjectModel.find({ ownerSessionId }).select('id name updatedAt').sort({ updatedAt: -1 }).lean();
  return docs.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    updatedAt: doc.updatedAt,
  }));
}

export async function createProject(data: Partial<Project> & { ownerSessionId: string }): Promise<Project> {
  await dbConnect();
  const newProject = new ProjectModel({
    id: nanoid(),
    name: data.name || 'Untitled Project',
    description: data.description || '',
    circuit: data.circuit || { nodes: [], connections: [] },
    componentDefinitions: data.componentDefinitions || [],
    simulationSettings: data.simulationSettings || { clockSpeedHz: 1 },
    testbenches: data.testbenches || [],
    isPublic: data.isPublic || false,
    ownerSessionId: data.ownerSessionId,
  });
  const saved = await newProject.save();
  const { _id, __v, ...project } = saved.toObject();
  return project as Project;
}

export async function updateProject(id: string, ownerSessionId: string, data: Partial<Project>): Promise<Project | null> {
  await dbConnect();
  const updated = await ProjectModel.findOneAndUpdate(
    { id, ownerSessionId },
    { $set: data },
    { new: true }
  ).lean();
  
  if (!updated) return null;
  const { _id, __v, ...project } = updated as any;
  return project as Project;
}

export async function deleteProject(id: string, ownerSessionId: string): Promise<boolean> {
  await dbConnect();
  const result = await ProjectModel.deleteOne({ id, ownerSessionId });
  return result.deletedCount === 1;
}

export async function generateShareToken(id: string, ownerSessionId: string): Promise<string | null> {
  await dbConnect();
  const token = nanoid(10);
  const updated = await ProjectModel.findOneAndUpdate(
    { id, ownerSessionId },
    { $set: { shareToken: token, isPublic: true } },
    { new: true }
  );
  if (!updated) return null;
  return token;
}
