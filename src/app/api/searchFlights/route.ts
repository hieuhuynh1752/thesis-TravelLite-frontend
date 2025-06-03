import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  // 1) Read query params
  const url = new URL(request.url);
  const departure = url.searchParams.get('departure');
  const arrival = url.searchParams.get('arrival');
  const outbound_date = url.searchParams.get('outbound_date');

  // 2) Validate
  if (!departure || !arrival || !outbound_date) {
    return NextResponse.json(
      { error: 'departure, arrival, and outbound_date are required' },
      { status: 400 },
    );
  }

  // 3) Check that outbound_date is in YYYY-MM-DD form
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(outbound_date)) {
    return NextResponse.json(
      { error: 'outbound_date must be in YYYY-MM-DD format' },
      { status: 400 },
    );
  }

  const params = {
    api_key: process.env.NEXT_PUBLIC_SERPAPI_API_KEY,
    engine: 'google_flights',
    departure_id: departure.toUpperCase(),
    arrival_id: arrival.toUpperCase(),
    outbound_date, // e.g. "2025-06-03"
    hl: 'en',
    currency: 'EUR',
    type: '2', // one-way
    stops: '1',
  };

  try {
    const response = await axios.get('https://serpapi.com/search', {
      params,
      timeout: 10000,
    });
    const data = response.data;

    // 6) Confirm we got some coordinates back
    if (
      !data.airports ||
      !Array.isArray(data.airports) ||
      data.airports.length === 0 ||
      !Array.isArray(data.airports[0].departure) ||
      data.airports[0].departure.length === 0 ||
      !Array.isArray(data.airports[0].arrival) ||
      data.airports[0].arrival.length === 0
    ) {
      return NextResponse.json(
        { error: 'SerpAPI did not return airport coordinates.' },
        { status: 500 },
      );
    }

    // 7) Return the SerpAPI JSON directly
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('SerpAPI request failed:', err.message || err);

    if (axios.isAxiosError(err) && err.response) {
      return NextResponse.json(
        { error: err.response.data || err.message },
        { status: err.response.status },
      );
    }
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
