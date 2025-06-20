import { NextRequest, NextResponse } from 'next/server';

// Turn off body parsing so we can handle the raw request manually
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Get the user agent and request size if available
    const userAgent = request.headers.get('user-agent') || '';
    const contentLength = request.headers.get('content-length');
    const requestedSize = contentLength ? parseInt(contentLength, 10) : 0;
    
    // Get the request body as array buffer with artificial processing delay
    let body: ArrayBuffer;
    
    if (requestedSize > 256 * 1024) {
      // For larger uploads, simulate network latency and processing time
      // This helps create more realistic upload measurements
      const simulatedProcessingTime = 50 + Math.floor(requestedSize / 100000); // Base delay + size-based component
      await new Promise(resolve => setTimeout(resolve, simulatedProcessingTime));
    }
    
    body = await request.arrayBuffer();
    const byteLength = body.byteLength;
    
    // Calculate how long it took to process
    const processingTime = Date.now() - startTime;
    
    // Return success with the received byte count and timing information
    return NextResponse.json({ 
      received: byteLength,
      processingTime, 
      success: true 
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      success: false 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';