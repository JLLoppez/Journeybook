import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { FlightSearchParams } from '../types';
import CitySearch from '../components/CitySearch';

const destinations = [
  { code: 'JNB', city: 'Johannesburg', emoji: '🌍' },
  { code: 'ZNZ', city: 'Zanzibar', emoji: '🏝️' },
  { code: 'DXB', city: 'Dubai', emoji: '🌆' },
  { code: 'LHR', city: 'London', emoji: '🎡' },
  { code: 'NBO', city: 'Nairobi', emoji: '🦁' },
  { code: 'SYD', city: 'Sydney', emoji: '🦘' },
];

const stats = [
  { value: '500+', label: 'Destinations' },
  { value: '50+', label: 'Airlines' },
  { value: '2M+', label: 'Travellers' },
  { value: '24/7', label: 'Support' },
];

export default function Home() {
  const navigate = useNavigate();
  const [originCode, setOriginCode] = useState('');
  const [destCode, setDestCode] = useState('');

  const handleQuickSearch = (params: Partial<FlightSearchParams>) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([,v]) => v));
    const query = new URLSearchParams(clean as Record<string,string>).toString();
    navigate(`/flights${query ? `?${query}` : ''}`);
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section
        className="relative"
        style={{
          marginTop: '-64px',
          paddingTop: '64px',
          background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 60%, #0369a1 100%)',
        }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.15) 40px,rgba(255,255,255,.15) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.15) 40px,rgba(255,255,255,.15) 41px)',
          }}
        />
        {/* Ambient orbs */}
        <div className="absolute top-16 right-8 w-48 h-48 sm:w-72 sm:h-72 rounded-full opacity-10 blur-3xl bg-sky-400 animate-float pointer-events-none" />
        <div className="absolute bottom-8 left-4 w-32 h-32 sm:w-48 sm:h-48 rounded-full opacity-10 blur-2xl bg-blue-300 animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 sm:pt-20 sm:pb-20">
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sky-300 text-xs sm:text-sm font-semibold fade-up">
              ✈ Trusted by 2 million travellers
            </span>
          </div>

          {/* Headline – fixed to not overflow */}
          <h1
            className="text-center text-white font-extrabold leading-tight mb-4 fade-up stagger-1"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2rem, 7vw, 4.5rem)',
              wordBreak: 'break-word',
            }}
          >
            The world is waiting
            <br />
            <span style={{ color: '#38bdf8' }}>for you</span>
          </h1>

          <p className="text-center text-white/70 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 fade-up stagger-2 px-2">
            Search and book flights to hundreds of destinations. Simple, fast, and always the best price.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto fade-up stagger-3">
            <div
              className="rounded-2xl p-3 flex flex-col sm:flex-row gap-2 items-end"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <div className="flex-1 min-w-0">
                <CitySearch
                  value=""
                  onChange={(_display, code) => setOriginCode(code)}
                  placeholder="From — Cape Town"
                  dark
                />
              </div>
              <span className="hidden sm:flex items-center text-white/30 text-lg pb-2.5 px-1">→</span>
              <div className="flex-1 min-w-0">
                <CitySearch
                  value=""
                  onChange={(_display, code) => setDestCode(code)}
                  placeholder="To — Dubai, London..."
                  dark
                />
              </div>
              <button
                onClick={() => handleQuickSearch({ origin: originCode, destination: destCode })}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-all shadow-lg whitespace-nowrap text-sm flex-shrink-0"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Search →
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto fade-up stagger-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl sm:text-2xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Planner CTA banner */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                New: AI Travel Planner
              </div>
              <div className="text-slate-400 text-xs">Tell us your dream trip and we'll plan everything</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/planner')}
            className="px-5 py-2 bg-sky-500 text-white font-bold rounded-xl text-sm hover:bg-sky-400 transition-colors whitespace-nowrap"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Try AI Planner ✨
          </button>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-widest text-sky-600 uppercase">Explore</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Popular Destinations
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {destinations.map((d) => (
              <button
                key={d.code}
                onClick={() => handleQuickSearch({ destination: d.code })}
                className="group card p-3 sm:p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-slate-100 hover:border-sky-200"
              >
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{d.emoji}</div>
                <div className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-sky-600 transition-colors leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {d.city}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{d.code}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 text-center mb-10" style={{ fontFamily: 'Syne, sans-serif' }}>
            Why JourneyBook?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '💰', title: 'Best Prices', desc: 'Compare hundreds of airlines for the best deal on every route.' },
              { icon: '🤖', title: 'AI Trip Planning', desc: 'Our AI plans your entire trip – flights, hotels, activities and more.' },
              { icon: '⚡', title: 'Instant Booking', desc: 'Confirmation in seconds. No waiting, no uncertainty.' },
            ].map((f) => (
              <div key={f.title} className="card p-6 text-center group hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-sky-600 to-blue-800">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
            Ready to take off?
          </h2>
          <p className="text-white/70 mb-7 text-sm sm:text-base">
            Join millions of travellers who trust JourneyBook for every trip.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3.5 bg-white text-sky-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-lg text-sm sm:text-base"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/planner')}
              className="px-7 py-3.5 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm sm:text-base"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Try AI Planner ✨
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
