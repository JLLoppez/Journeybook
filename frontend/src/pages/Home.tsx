import { useState, useEffect, useRef } from 'react';
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
  { value: 500, suffix: '+', label: 'Destinations' },
  { value: 50, suffix: '+', label: 'Airlines' },
  { value: 2, suffix: 'M+', label: 'Travellers' },
  { value: 24, suffix: '/7', label: 'Support' },
];

const features = [
  { icon: '💰', title: 'Best Prices', desc: 'Live prices from Duffel API — always the best available fare on every route.' },
  { icon: '🤖', title: 'AI Trip Planning', desc: 'Claude AI crafts your full itinerary — flights, accommodation, activities and budget.' },
  { icon: '⚡', title: 'Instant Booking', desc: 'Confirmation in seconds. Manage everything from your dashboard.' },
];

const HEADLINE_WORDS = ['waiting', 'ready', 'yours', 'calling'];

// Animated counter hook
function useCounter(target: number, duration = 1500, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

// Intersection observer hook
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// Single stat with animated counter
function AnimatedStat({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCounter(value, 1200, active);
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
        {count}{suffix}
      </div>
      <div className="text-xs text-white/40 mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [originCode, setOriginCode] = useState('');
  const [originDisplay, setOriginDisplay] = useState('');
  const [destCode, setDestCode] = useState('');
  const [destDisplay, setDestDisplay] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState('');

  // Rotating headline word
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIndex(i => (i + 1) % HEADLINE_WORDS.length);
        setWordVisible(true);
      }, 350);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Stats counter trigger
  const { ref: statsRef, inView: statsInView } = useInView();

  // Scroll-reveal for sections
  const { ref: featuresRef, inView: featuresInView } = useInView(0.1);
  const { ref: destsRef, inView: destsInView } = useInView(0.1);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (originCode) params.set('origin', originCode);
    if (destCode) params.set('destination', destCode);
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ marginTop: '-64px', paddingTop: '64px' }}>
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        {/* Animated orbs */}
        <div className="absolute top-24 right-0 w-96 h-96 rounded-full opacity-[0.08] blur-3xl bg-sky-400 pointer-events-none"
          style={{ animation: 'orbFloat 8s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full opacity-[0.06] blur-3xl bg-indigo-500 pointer-events-none"
          style={{ animation: 'orbFloat 10s ease-in-out infinite reverse' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">

          {/* Badge */}
          <div className="flex justify-center mb-6 fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-sky-300 tracking-wide"
              style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)' }}>
              ✈ &nbsp;Powered by Duffel API &amp; Claude AI
            </span>
          </div>

          {/* Headline with rotating word */}
          <h1
            className="text-center text-white font-extrabold mb-5 fade-up stagger-1"
            style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.2rem, 7vw, 5rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
          >
            The world is{' '}
            <span
              className="text-gradient inline-block"
              style={{
                transition: 'opacity 0.35s ease, transform 0.35s ease',
                opacity: wordVisible ? 1 : 0,
                transform: wordVisible ? 'translateY(0)' : 'translateY(10px)',
                minWidth: '4ch',
              }}
            >
              {HEADLINE_WORDS[wordIndex]}
            </span>
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
                <CitySearch value={originDisplay} onChange={(d, code) => { setOriginDisplay(d); setOriginCode(code); }} placeholder="Cape Town..." dark />
              </div>
              <div>
                <label className="label-dark">To</label>
                <CitySearch value={destDisplay} onChange={(d, code) => { setDestDisplay(d); setDestCode(code); }} placeholder="Dubai, London..." dark />
              </div>
              <div>
                <label className="label-dark">Date</label>
                <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)} className="input-dark w-full" style={{ colorScheme: 'dark' }} />
              </div>
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleSearch}
                  className="w-full py-3 font-bold rounded-xl transition-all text-sm relative overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontFamily: 'Syne, sans-serif' }}
                >
                  <span className="relative z-10">Search Flights →</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Animated stats */}
          <div ref={statsRef} className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto fade-up stagger-4">
            {stats.map((s) => (
              <AnimatedStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} active={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Planner banner ─────────────────────────────── */}
      <section style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.05)' }} className="py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>🤖</div>
            <div>
              <p className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>New: AI Travel Planner</p>
              <p className="text-slate-500 text-xs">Describe your dream trip — Claude builds the full itinerary</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/planner')}
            className="px-5 py-2 text-white font-bold rounded-xl text-sm whitespace-nowrap flex-shrink-0 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', fontFamily: 'Syne, sans-serif' }}
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}>
              Popular Destinations
            </h2>
          </div>

          <div ref={destsRef} className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {destinations.map((d, i) => (
              <button
                key={d.code}
                onClick={() => navigate(`/flights?destination=${d.code}`)}
                className="group card p-3 sm:p-5 text-center border border-slate-100 hover:border-sky-200 hover:shadow-md"
                style={{
                  transition: 'all 0.3s ease',
                  opacity: destsInView ? 1 : 0,
                  transform: destsInView ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${i * 0.06}s`,
                }}
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-125 transition-transform duration-300">
                  {d.emoji}
                </div>
                <div className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-sky-600 transition-colors leading-tight"
                  style={{ fontFamily: 'Syne, sans-serif' }}>
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}>
              Travel smarter, not harder
            </h2>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card p-7 group hover:shadow-lg cursor-default"
                style={{
                  transition: 'all 0.4s ease',
                  opacity: featuresInView ? 1 : 0,
                  transform: featuresInView ? 'translateY(0)' : 'translateY(30px)',
                  transitionDelay: `${i * 0.12}s`,
                }}
              >
                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:bg-sky-100 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 hero-mesh relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl bg-sky-400 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
            Ready to take off?
          </h2>
          <p className="text-white/50 mb-8 text-sm sm:text-base leading-relaxed">
            Join thousands of travellers who book smarter with JourneyBook.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 bg-white text-sky-700 font-bold rounded-xl hover:bg-sky-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-sm sm:text-base"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/planner')}
              className="px-8 py-3.5 font-bold rounded-xl text-white text-sm sm:text-base transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'Syne, sans-serif' }}
            >
              Try AI Planner ✨
            </button>
          </div>
        </div>
      </section>

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        .label-dark {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
          font-family: 'Syne', sans-serif;
        }
      `}</style>
    </div>
  );
}
