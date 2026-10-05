import { NextResponse } from 'next/server'

const hotelColumns = 'id,name,slug,city,area,address,star_rating,guest_rating,review_count,description,amenities,photos,check_in_time,check_out_time,currency,starting_price'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')?.trim()
  const query = new URLSearchParams({
    select: hotelColumns,
    order: 'starting_price.asc',
  })

  if (city) query.set('city', `ilike.${city}`)

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/hotels?${query.toString()}`, {
    headers: {
      apikey: process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '',
      Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? ''}`,
    },
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Unable to load hotels.' }, { status: 502 })
  }

  return NextResponse.json(await response.json())
}
