import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to get IP and ISP info from a reliable service
    const response = await fetch('https://ipinfo.io/json', {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch IP info: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return only what we need
    return NextResponse.json({
      ip: data.ip,
      isp: data.org || 'Unknown',
      location: data.city && data.country ? `${data.city}, ${data.country}` : 'Unknown',
      region: data.region || 'Unknown',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching ISP info:', error);
    
    // Return fallback data if we couldn't get real info
    return NextResponse.json({
      ip: '0.0.0.0',
      isp: 'Unknown',
      location: 'Unknown',
      region: 'Unknown',
      timestamp: Date.now()
    });
  }
}

export const dynamic = 'force-dynamic';