import { NextRequest, NextResponse } from 'next/server';

const backendBaseUrl = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:8000'
).replace(/\/$/, '');

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // Call backend
    const backendResponse = await fetch(`${backendBaseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    // Return raw stream - DON'T parse as JSON
    return new NextResponse(backendResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Compilation failed' },
      { status: 500 }
    );
  }
}