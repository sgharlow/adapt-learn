import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { PathsData } from '@/types';

export async function GET() {
  try {
    const pathsFile = join(process.cwd(), 'content', 'paths', 'index.json');
    const data = readFileSync(pathsFile, 'utf-8');
    const pathsData: PathsData = JSON.parse(data);

    return NextResponse.json(pathsData);
  } catch (error) {
    console.error('Error loading paths:', error);
    return NextResponse.json(
      { error: 'Failed to load learning paths' },
      { status: 500 }
    );
  }
}
