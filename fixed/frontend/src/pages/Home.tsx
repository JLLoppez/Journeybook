import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CitySearch from '../components/CitySearch';

const destinations = [
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', emoji: '🌍' },
  { code: 'ZNZ', city: 'Zanzibar', country: 'Tanzania', emoji: '🏝️' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', emoji: '🌆' },
  { code: 'LHR', city: 'London', country: 'UK', emoji: '🎡' },
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', emoji: '🦁' },
  { code: 'SYD', city: 'Sydney', country: 'Australia', emoji: '🦘' },
];

const stats = [
  { value: '500+', label: 'Destinations' },
  { value: '50+', label: 'Airlines' },
  { value: '2M+', label: 'Travellers' },
  { value: '24/7', label: 'Support' },
];

const features = [
  {
    icon: '💰',
    title: 'Best Prices',
    desc: 'Live prices from Duffel API — always the best available fare on every route.',
  },
  {
    icon: '🤖',
    title: 'AI Trip Planning',
    desc: 'Claude AI crafts your full itinerary — flights, accommodation, activities and budget.',
  },
  {
    icon: '⚡',
    title: 'Instant Booking',
    desc: 'Confirmation in seconds. Manage everything from your dashboard.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [originCode, setOriginCode] = useState('');
  const [originDisplay, setOriginDisplay] = useState('');
  const [destCode, setDestCode] = useState('');
  const [destDisplay, setDestDisplay] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (originCode) params.set('origin', originCode);
    if (destCode) params.set('destination', destCode);
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ marginTop: '-64px', paddingTop: '64px' }}
      >
        {/* Background mesh */}
        <div className="absolute inset-0 hero-mesh" />
        {/* Grid texture */}
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        {/* Orbs */}
        <div className="absolute top-24 right-0 w-96 h-96 rounded-full opacity-[0.08] blur-3xl bg-sky-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-[0.06] blur-3xl bg-indigo-500 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">

          {/* Badge */}
          <div className="flex justify-center mb-6 fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-sky-300 tracking-wide"
              style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)' }}>
              ✈ &nbsp;Powered by Duffel API &amp; Claude AI
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-center text-white font-extrabold mb-5 fade-up stagger-1"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2.2rem, 7vw, 5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            The world is{' '}
            <span className="text-gradient">waiting for you</span>
          </h1>

          <p className="text-center text-white/60 text-sm sm:text-lg max-w-xl mx-auto mb-10 fade-up stagger-2 px-2 leading-relaxed">
            Search live flights, book instantly, and let AI plan your perfect trip — all in one place.
          </p>

          {/* Search card */}
          <div
            className="max-w-3xl mx-auto rounded-2xl p-4 sm:p-5 fade-up stagger-3"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="label-dark">From</label>
                <CitySearch
                  value={originDisplay}
                  onChange={(d, code) => { setOriginDisplay(d); setOriginCode(code); }}
                  placeholder="Cape Town..."
                  dark
                />
              </div>
              <div>
                <label className="label-dark">To</label>
                <CitySearch
                  value={destDisplay}
                  onChange={(d, code) => { setDestDisplay(d); setDestCode(code); }}
                  placeholder="Dubai, London..."
                  dark
                />
              </div>
              <div>
                <label className="label-dark">Date</label>
                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="input-dark w-full"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleSearch}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-sky-500/30 text-sm"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  Search Flights →
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto fade-up stagger-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-2xl sm:text-3xl font-extrabold text-white"
                  style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
                >
                  {s.value}
                </div>
                <div className="text-xs text-white/40 mt-1 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Planner banner ─────────────────────────────── */}
      <section style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.05)' }} className="py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center text-lg flex-shrink-0">🤖</div>
            <div>
              <p className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>New: AI Travel Planner</p>
              <p className="text-slate-500 text-xs">Describe your dream trip — Claude builds the full itinerary</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/planner')}
            className="px-5 py-2 bg-sky-500 text-white font-bold rounded-xl text-sm hover:bg-sky-400 transition-colors whitespace-nowrap flex-shrink-0"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Try AI Planner ✨
          </button>
        </div>
      </section>

      {/* ── Popular destinations ──────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-label mb-2">Explore</p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-slate-900"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}
            >
              Popular Destinations
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {destinations.map((d) => (
              <button
                key={d.code}
                onClick={() => navigate(`/flights?destination=${d.code}`)}
                className="group card-hover p-3 sm:p-5 text-center border border-slate-100 hover:border-sky-200"
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-200">
                  {d.emoji}
                </div>
                <div
                  className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-sky-600 transition-colors leading-tight"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {d.city}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{d.code}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-2">Why JourneyBook</p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-slate-900"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}
            >
              Travel smarter, not harder
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card p-7 group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-200">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 hero-mesh relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center px-4">
          <h2
            className="text-2xl sm:text-4xl font-extrabold text-white mb-4"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
          >
            Ready to take off?
          </h2>
          <p className="text-white/50 mb-8 text-sm sm:text-base leading-relaxed">
            Join thousands of travellers who book smarter with JourneyBook.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 bg-white text-sky-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-xl text-sm sm:text-base"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/planner')}
              className="px-8 py-3.5 font-bold rounded-xl text-white text-sm sm:text-base transition-all"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              Try AI Planner ✨
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
