import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
  }

  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
    console.log('Geocoding URL:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': 'PuskodalKopassus/1.0 (contact: admin@puskodal.id)'
      }
    });

    console.log('Nominatim Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nominatim Error:', errorText);
      return NextResponse.json({ error: `Nominatim error: ${response.status}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Geocode proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
