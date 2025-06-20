import { NextRequest, NextResponse } from 'next/server';

// Generate a chunk of random data
function generateRandomChunk(size: number): Buffer {
  const buffer = Buffer.alloc(size);
  
  // Fill with a pattern that's hard to compress
  for (let i = 0; i < size; i++) {
    buffer[i] = (i * 41) % 256;
  }
  
  return buffer;
}

// Pre-generate some common chunks for performance
const chunkCache: Record<number, Buffer> = {};
const commonChunkSizes = [64 * 1024, 128 * 1024, 256 * 1024, 512 * 1024, 1024 * 1024];

// Initialize cache in Node.js environment
if (typeof process !== 'undefined') {
  commonChunkSizes.forEach(size => {
    chunkCache[size] = generateRandomChunk(size);
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { size: string } }
) {
  try {
    // Get the requested file size (guard against very large values)
    const requestedSize = Math.min(
      parseInt(params.size, 10) || 1024 * 1024,
      10 * 1024 * 1024 // 10 MB max for better calibration
    );
    
    // Use cached chunk or generate a new one
    let data: Buffer;
    if (chunkCache[requestedSize]) {
      data = chunkCache[requestedSize];
    } else {
      data = generateRandomChunk(requestedSize);
      
      // Cache if reasonable size
      if (requestedSize <= 1024 * 1024) {
        chunkCache[requestedSize] = data;
      }
    }
    
    // Return the data with proper headers
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': requestedSize.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error in download handler:', error);
    return new NextResponse('Error generating download content', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';