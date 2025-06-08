import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the body as an ArrayBuffer
  const body = await req.arrayBuffer();
  
  // Add a small random delay based on upload size to make it more realistic
  const delayMs = Math.min(50, body.byteLength / 1024 / 20); // scale delay based on size
  await new Promise(resolve => setTimeout(resolve, delayMs));
  
  // Simply acknowledge receipt - the client measures upload time
  return NextResponse.json({ 
    received: body.byteLength,
    success: true 
  });
}

// Required for Next.js to handle large uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};