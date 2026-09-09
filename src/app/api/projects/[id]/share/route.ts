import { NextResponse } from 'next/server';
import { generateShareToken } from '@/lib/db/projectRepository';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { sessionId } = body;
    const { id } = await context.params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await generateShareToken(id, sessionId);

    if (!token) {
      return NextResponse.json({ error: 'Not found or Unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating share link:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
