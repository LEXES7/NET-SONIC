import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Get the body as an ArrayBuffer
    const body = await req.arrayBuffer();
    const byteLength = body.byteLength;
    
    // Add a small random delay based on upload size to make it more realistic
    // but not too much to avoid affecting measurements
    const delayMs = Math.min(20, byteLength / 1024 / 50);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    // Acknowledge receipt with exact byte count for verification
    return NextResponse.json({ 
      received: byteLength,
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

// Required for Next.js to handle large uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};