import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to get IP and ISP info from a reliable service
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NET-SONIC Speedtest'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      isp: data.org || data.isp || 'Unknown ISP',
      ip: data.ip,
      city: data.city,
      country: data.country_name,
      // Return other useful information as well
      region: data.region,
      timezone: data.timezone
    });
  } catch (error) {
    console.error('Failed to fetch ISP info:', error);
    
    // Fall back to another API if the first one fails
    try {
      const fallbackResponse = await fetch('https://ip-api.com/json/?fields=query,isp,org,country,city', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NET-SONIC Speedtest'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return NextResponse.json({
          isp: fallbackData.isp || fallbackData.org || 'Unknown ISP',
          ip: fallbackData.query,
          city: fallbackData.city,
          country: fallbackData.country
        });
      }
    } catch (fallbackError) {
      console.error('Fallback ISP API failed:', fallbackError);
    }
    
    // If all fails, return a generic response
    return NextResponse.json({ isp: 'Unknown ISP', error: 'Could not determine ISP' }, { status: 200 });
  }
}