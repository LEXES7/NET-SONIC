import { NextRequest, NextResponse } from 'next/server';

// Generate a chunk of random data
function generateRandomData(size: number): Buffer {
  const buffer = Buffer.alloc(size);
  
  // Fill with random data
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  
  return buffer;
}

// The key fix is here - using the correct parameter structure
export async function GET(
  request: NextRequest,
  { params }: { params: { size: string } }  // This is the correct format for Next.js 15.x
) {
  try {
    // Get the requested file size (limit to 10MB max)
    const requestedSize = Math.min(
      parseInt(params.size, 10) || 1024 * 1024,
      10 * 1024 * 1024 // 10 MB max
    );
    
    // Generate the data
    const data = generateRandomData(requestedSize);
    
    // Return the data with proper headers
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': requestedSize.toString(),
        'Cache-Control': 'no-store, no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in download handler:', error);
    return new NextResponse('Error generating download content', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';