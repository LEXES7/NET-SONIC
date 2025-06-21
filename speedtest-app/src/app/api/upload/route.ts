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
    const contentLength = request.headers.get('content-length');
    let size = 0;
    
    // Read the request body in chunks to avoid memory issues
    const reader = request.body?.getReader();
    if (reader) {
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          size += value.length;
        }
      }
    } else {
      // Fallback if reader not available
      const blob = await request.blob();
      size = blob.size;
    }
    
    // Add a small delay to simulate processing (helps with accuracy on fast networks)
    await new Promise(resolve => setTimeout(resolve, 50));

    // Return processed upload size
    return NextResponse.json({ 
      success: true,
      bytesReceived: size,
      contentLength: contentLength ? parseInt(contentLength, 10) : null,
      timestamp: Date.now() 
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return NextResponse.json(
      { error: 'Failed to process upload', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';