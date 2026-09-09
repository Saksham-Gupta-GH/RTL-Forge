import { NextResponse } from 'next/server';
import { getProject, updateProject, deleteProject } from '@/lib/db/projectRepository';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const { id } = await context.params;

    const project = await getProject(id);

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // If it's not public and you're not the owner, deny
    if (!project.isPublic && project.ownerSessionId !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { sessionId, data } = body;
    const { id } = await context.params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updated = await updateProject(id, sessionId, data);

    if (!updated) {
      return NextResponse.json({ error: 'Not found or Unauthorized' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const { id } = await context.params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await deleteProject(id, sessionId);

    if (!success) {
      return NextResponse.json({ error: 'Not found or Unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
