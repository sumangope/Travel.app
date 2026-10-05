'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, BedDouble, ChevronDown, Heart, MapPin, Search, SlidersHorizontal, Sparkles, Star, Users } from 'lucide-react'
import data from '../mock_data.json'
import styles from './page.module.css'

type Hotel = (typeof data.hotels)[number]

const cities = ['All destinations', ...Array.from(new Set(data.hotels.map((hotel) => hotel.city)))]
const sortOptions = ['Recommended', 'Price: low to high', 'Guest rating']

export default function Home() {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('All destinations')
  const [sort, setSort] = useState('Recommended')
  const [favorites, setFavorites] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [maxPrice, setMaxPrice] = useState(12000)

  const hotels = useMemo(() => {
    const filtered = data.hotels.filter((hotel) => {
      const searchText = `${hotel.name} ${hotel.area} ${hotel.city}`.toLowerCase()
      return searchText.includes(query.toLowerCase()) && (city === 'All destinations' || hotel.city === city) && hotel.starting_price <= maxPrice
    })
    return [...filtered].sort((a, b) => sort === 'Price: low to high' ? a.starting_price - b.starting_price : sort === 'Guest rating' ? b.guest_rating - a.guest_rating : b.guest_rating * 2 + b.review_count / 1000 - (a.guest_rating * 2 + a.review_count / 1000))
  }, [city, maxPrice, query, sort])

  const toggleFavorite = (id: number) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return (
    <main>
      <nav className={styles.nav}>
        <a className={styles.logo} href="#top"><span className={styles.logoMark}><Sparkles size={16} /></span>travel<span className={styles.logoDot}>.</span>app</a>
        <div className={styles.navLinks}><a href="#stays">Stays</a><a href="#inspiration">Inspiration</a><a href="#about">About us</a></div>
        <button className={styles.accountButton}>List your property <ArrowRight size={15} /></button>
      </nav>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}><p className={styles.eyebrow}>Your next chapter starts here</p><h1>Stay somewhere<br /><em>worth remembering.</em></h1><p className={styles.heroText}>Handpicked hotels and stays for the curious traveler. Find a place that feels like part of the journey.</p></div>
        <div className={styles.heroGraphic} aria-hidden="true"><div className={styles.sun}></div><div className={styles.heroShape}></div><div className={styles.heroCard}><span>THAILAND</span><strong>Slow mornings.<br />Bright days.</strong></div></div>
      </section>

      <section className={styles.searchPanel} aria-label="Search stays">
        <div className={styles.searchField}><MapPin size={19} /><label><span>Where</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="City, area, or hotel" /></label></div>
        <div className={styles.searchField}><BedDouble size={19} /><label><span>Dates</span><button className={styles.fakeInput}>Dec 12 — Dec 16 <ChevronDown size={14} /></button></label></div>
        <div className={styles.searchField}><Users size={19} /><label><span>Guests</span><button className={styles.fakeInput}>2 guests, 1 room <ChevronDown size={14} /></button></label></div>
        <button className={styles.searchButton}><Search size={19} /> Search</button>
      </section>

      <section className={styles.content} id="stays">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Made for you</p><h2>Find your kind of stay</h2><p className={styles.muted}>Explore {data.hotels.length} stays across Thailand</p></div><div className={styles.controls}><select value={city} onChange={(event) => setCity(event.target.value)} aria-label="Destination">{cities.map((item) => <option key={item}>{item}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort hotels">{sortOptions.map((item) => <option key={item}>{item}</option>)}</select><button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16} /> Filters</button></div></div>
        {showFilters && <div className={styles.filterBar}><label>Maximum nightly price <strong>฿{maxPrice.toLocaleString()}</strong><input type="range" min="850" max="12000" step="100" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label></div>}
        {hotels.length ? <div className={styles.grid}>{hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} favorite={favorites.includes(hotel.id)} onFavorite={() => toggleFavorite(hotel.id)} />)}</div> : <div className={styles.empty}><Search size={25} /><h3>No stays found</h3><p>Try a different destination or adjust your filters.</p></div>}
      </section>

      <section className={styles.bottomBanner} id="inspiration"><div><p className={styles.eyebrow}>Travel differently</p><h2>Go where your<br /><em>curiosity leads.</em></h2></div><p>Whether you are chasing city lights or quiet mornings, we help you find stays with a little more soul.</p><button className={styles.outlineButton}>Our travel guide <ArrowRight size={16} /></button></section>
      <footer id="about"><span>© 2024 travel.app</span><span>Thoughtful stays for thoughtful travelers.</span><span>Made for the journey.</span></footer>
    </main>
  )
}

function HotelCard({ hotel, favorite, onFavorite }: { hotel: Hotel; favorite: boolean; onFavorite: () => void }) {
  return <article className={styles.card}><div className={styles.imageWrap}><Image src={hotel.photos[0]} alt={hotel.name} fill sizes="(max-width: 700px) 100vw, 33vw" /><button className={`${styles.favorite} ${favorite ? styles.favoriteActive : ''}`} onClick={onFavorite} aria-label={favorite ? `Remove ${hotel.name} from favorites` : `Save ${hotel.name}`}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button><span className={styles.cityTag}>{hotel.area}</span></div><div className={styles.cardBody}><div className={styles.cardTop}><div><h3>{hotel.name}</h3><p>{hotel.city}, Thailand</p></div><span className={styles.rating}><Star size={13} fill="currentColor" /> {hotel.guest_rating}</span></div><div className={styles.cardBottom}><span><strong>฿{hotel.starting_price.toLocaleString()}</strong> / night</span><span className={styles.reviews}>{hotel.review_count.toLocaleString()} reviews</span></div></div></article>
}
