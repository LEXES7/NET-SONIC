import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.arrayBuffer();
    const byteLength = body.byteLength;
    

    const delayMs = Math.min(20, byteLength / 1024 / 50);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
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

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};