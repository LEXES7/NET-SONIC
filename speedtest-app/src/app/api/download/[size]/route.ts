import { NextRequest, NextResponse } from 'next/server';

// Generate random data for download test
function generateRandomData(size: number): Buffer {
  const buffer = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  return buffer;
}

// Fix the parameter structure
export async function GET(
  request: NextRequest,
  { params }: { params: { size: string } }
) {
  try {
    // Get the requested size with a reasonable limit
    const requestedSize = Math.min(
      parseInt(params.size, 10) || 1024 * 1024,
      10 * 1024 * 1024 // 10 MB max
    );
    
    // Generate the test data
    const data = generateRandomData(requestedSize);
    
    // Return with appropriate headers
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': requestedSize.toString(),
        'Cache-Control': 'no-store, no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error generating download data:', error);
    return new NextResponse('Error generating download content', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';