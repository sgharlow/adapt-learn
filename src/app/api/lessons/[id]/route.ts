import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Lesson } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessonPath = join(process.cwd(), 'content', 'lessons', `${id}.json`);
    const data = readFileSync(lessonPath, 'utf-8');
    const lesson: Lesson = JSON.parse(data);

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error loading lesson:', error);
    return NextResponse.json(
      { error: 'Lesson not found' },
      { status: 404 }
    );
  }
}
