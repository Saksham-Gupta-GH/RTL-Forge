import { NextResponse } from 'next/server';
import { listProjects, createProject } from '@/lib/db/projectRepository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await listProjects(sessionId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error listing projects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, name, description } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await createProject({
      name,
      description,
      ownerSessionId: sessionId
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
