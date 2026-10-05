'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Filter, MapPin, Menu, Search, SlidersHorizontal, Star, Wifi, X } from 'lucide-react'

type Hotel = {
  id: string | number
  name: string
  city: string
  area: string
  star_rating: number
  guest_rating: number
  amenities: string[]
  photos: string[]
  starting_price: number
}

const cities = ['Bangkok', 'Phuket', 'Pattaya']
const amenityOptions = ['Free WiFi', 'Swimming pool', 'Free breakfast', 'Gym', 'Beach access', 'Spa']
const formatPrice = (price: number) => `฿${price.toLocaleString('en-US')}`

function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[1.45] overflow-hidden bg-slate-100">
        <img src={hotel.photos[0]} alt={`${hotel.name} in ${hotel.city}`} className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700">{hotel.star_rating}-star hotel</span>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-lg font-bold tracking-tight text-slate-900">{hotel.name}</h2><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-3.5 text-[#0875d1]" /> {hotel.area}, {hotel.city}</p></div>
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-sm font-bold text-[#0875d1]"><Star className="size-3.5 fill-current" /> {hotel.guest_rating}</div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1"><Wifi className="size-3.5" /> Free WiFi</span>{hotel.amenities.includes('Swimming pool') && <span className="rounded-full bg-slate-50 px-2.5 py-1">Swimming pool</span>}{hotel.amenities.includes('Beach access') && <span className="rounded-full bg-slate-50 px-2.5 py-1">Beach access</span>}</div>
        <div className="flex items-end justify-between border-t border-slate-100 pt-3"><div><p className="text-xs text-slate-500">Starting from</p><p className="mt-0.5 text-xl font-bold text-slate-900">{formatPrice(hotel.starting_price)} <span className="text-xs font-medium text-slate-500">/ night</span></p></div><button className="rounded-xl bg-[#0875d1] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#075fae]">View rooms</button></div>
      </div>
    </article>
  )
}

export default function Page() {
  const [city, setCity] = useState('Bangkok')
  const [destination, setDestination] = useState('Bangkok')
  const [allHotels, setAllHotels] = useState<Hotel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    fetch(`/api/hotels?city=${encodeURIComponent(city)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load hotels')
        return response.json() as Promise<Hotel[]>
      })
      .then(setAllHotels)
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setAllHotels([])
      })
      .finally(() => setIsLoading(false))
    return () => controller.abort()
  }, [city])
  const [maxPrice, setMaxPrice] = useState(12000)
  const [stars, setStars] = useState<number[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [sort, setSort] = useState('recommended')
  const [mobileFilters, setMobileFilters] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  const hotels = useMemo(() => {
    return allHotels.filter((hotel) => hotel.city.toLowerCase() === city.toLowerCase() && hotel.starting_price <= maxPrice && (stars.length === 0 || stars.includes(hotel.star_rating)) && amenities.every((amenity) => hotel.amenities.includes(amenity))).sort((a, b) => sort === 'price' ? a.starting_price - b.starting_price : sort === 'rating' ? b.guest_rating - a.guest_rating : 0)
  }, [amenities, city, maxPrice, sort, stars])

  function runSearch(event: React.FormEvent) {
    event.preventDefault()
    const matchedCity = cities.find((item) => item.toLowerCase() === destination.trim().toLowerCase())
    if (matchedCity) setCity(matchedCity)
  }

  const toggle = (list: string[], value: string, setter: (next: string[]) => void) => setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])

  const filters = <div className="flex flex-col gap-7">
    <div><div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-slate-900">Price range</h2><span className="text-sm font-semibold text-[#0875d1]">฿{maxPrice.toLocaleString()}</span></div><input aria-label="Maximum price" type="range" min="850" max="12000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[#0875d1]" /><div className="mt-2 flex justify-between text-xs text-slate-400"><span>฿850</span><span>฿12,000+</span></div></div>
    <div><h2 className="mb-3 font-bold text-slate-900">Star rating</h2><div className="flex flex-wrap gap-2">{[5, 4, 3, 2].map((star) => <button key={star} onClick={() => toggle(stars, star.toString(), (next) => setStars(next.map(Number)))} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${stars.includes(star) ? 'border-[#0875d1] bg-blue-50 text-[#0875d1]' : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}>{star} <Star className="mb-0.5 inline size-3.5 fill-current" /></button>)}</div></div>
    <div><h2 className="mb-3 font-bold text-slate-900">Amenities</h2><div className="flex flex-col gap-3">{amenityOptions.map((amenity) => <label key={amenity} className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"><input type="checkbox" checked={amenities.includes(amenity)} onChange={() => toggle(amenities, amenity, setAmenities)} className="size-4 rounded border-slate-300 accent-[#0875d1]" />{amenity}</label>)}</div></div>
  </div>

  return <div className="min-h-screen overflow-x-hidden bg-[#f7fbff] text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-5 sm:py-5 lg:px-8"><a href="#" className="flex items-center gap-2.5 text-xl font-bold tracking-tight"><span className="flex size-9 items-center justify-center rounded-xl bg-[#0875d1] text-lg text-white">S</span>StayEasy</a><nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex"><a className="text-[#0875d1]" href="#results">Home</a><a href="#bookings" className="hover:text-[#0875d1]">My Bookings</a></nav><div className="flex items-center gap-2"><button className="min-h-11 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-[#0875d1] hover:text-[#0875d1]">Login</button><button type="button" aria-label="Toggle navigation menu" aria-expanded={mobileMenu} onClick={() => setMobileMenu((open) => !open)} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden">{mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}</button></div></div>{mobileMenu && <nav className="flex flex-col gap-1 border-t border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600 md:hidden"><a className="rounded-xl px-3 py-3 text-[#0875d1]" href="#results" onClick={() => setMobileMenu(false)}>Home</a><a className="rounded-xl px-3 py-3 hover:bg-slate-50" href="#bookings" onClick={() => setMobileMenu(false)}>My Bookings</a></nav>}</header>
    <main id="results" className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
      <form onSubmit={runSearch} className="rounded-3xl bg-[#eaf5ff] p-4 ring-1 ring-blue-100 sm:p-5"><div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto]"><label className="flex min-h-14 flex-col justify-center rounded-2xl bg-white px-4 ring-1 ring-blue-100 focus-within:ring-2 focus-within:ring-[#0875d1]"><span className="text-xs font-semibold text-slate-500">Destination</span><input value={destination} onChange={(e) => setDestination(e.target.value)} list="city-options" className="bg-transparent text-sm font-bold outline-none" /><datalist id="city-options">{cities.map((item) => <option key={item}>{item}</option>)}</datalist></label><div className="grid grid-cols-2 gap-3 md:contents"><label className="flex min-h-14 flex-col justify-center rounded-2xl bg-white px-4 ring-1 ring-blue-100"><span className="text-xs font-semibold text-slate-500">Check-in</span><input type="date" className="bg-transparent text-base font-bold outline-none" /></label><label className="flex min-h-14 flex-col justify-center rounded-2xl bg-white px-4 ring-1 ring-blue-100"><span className="text-xs font-semibold text-slate-500">Check-out</span><input type="date" className="bg-transparent text-base font-bold outline-none" /></label></div><label className="relative flex min-h-14 flex-col justify-center rounded-2xl bg-white px-4 ring-1 ring-blue-100"><span className="text-xs font-semibold text-slate-500">Guests & rooms</span><select className="appearance-none bg-transparent text-base font-bold outline-none"><option>2 guests, 1 room</option><option>1 guest, 1 room</option><option>4 guests, 2 rooms</option></select><ChevronDown className="pointer-events-none absolute right-4 bottom-4 size-4 text-slate-400" /></label><button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0875d1] px-6 md:min-h-14 md:w-auto text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-[#075fae]"><Search className="size-4" /> Search</button></div></form>
      <div className="mt-10 flex items-end justify-between gap-4"><div><p className="mb-2 text-sm font-bold uppercase tracking-[.16em] text-[#0875d1]">StayEasy stays</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Hotels in {city}</h1><p className="mt-2 text-slate-500">{hotels.length} properties found for your stay</p></div><button onClick={() => setMobileFilters(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold md:hidden"><SlidersHorizontal className="size-4" /> Filters</button></div>
      <div className="mt-8 grid gap-8 md:grid-cols-[250px_1fr]">
        <aside className="hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 md:block"><div className="mb-6 flex items-center gap-2"><Filter className="size-4 text-[#0875d1]" /><h2 className="text-lg font-bold">Filter by</h2></div>{filters}</aside>
        <section><div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">Showing stays with the best available rates</p><label className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-slate-600 sm:w-auto">Sort by<select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800 outline-none"><option value="recommended">Recommended</option><option value="price">Lowest price</option><option value="rating">Guest rating</option></select></label></div>{hotels.length ? <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">{hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}</div> : <div className="rounded-3xl bg-white p-12 text-center ring-1 ring-slate-200"><h2 className="text-xl font-bold">No stays match these filters</h2><p className="mt-2 text-sm text-slate-500">Try widening your price range or removing an amenity.</p></div>}</section>
      </div>
    </main>
    {mobileFilters && <div className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" onClick={() => setMobileFilters(false)}><aside className="absolute inset-y-0 right-0 w-[min(88vw,360px)] overflow-y-auto bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="mb-7 flex items-center justify-between"><h2 className="text-xl font-bold">Filter by</h2><button onClick={() => setMobileFilters(false)} aria-label="Close filters" className="rounded-lg p-2 hover:bg-slate-100"><X className="size-5" /></button></div>{filters}</aside></div>}
    <footer className="mt-10 bg-[#062c4e] text-blue-100"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8"><p className="font-bold text-white">StayEasy</p><nav className="flex flex-col gap-3 sm:flex-row sm:gap-6"><a href="#" className="hover:text-white">About</a><a href="#" className="hover:text-white">Help center</a><a href="#" className="hover:text-white">Terms & privacy</a></nav><p className="text-blue-200/60">© 2025 StayEasy</p></div></footer>
  </div>
}
