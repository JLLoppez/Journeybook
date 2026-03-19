import { useRef, useState, useEffect } from 'react';
import { useCurrency, type Currency } from '../context/CurrencyContext';

export default function CurrencySelector() {
  const { currency, currencies, setCurrency, loading } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-all text-sm font-semibold text-slate-700"
        style={{ fontFamily: 'Syne, sans-serif' }}
        disabled={loading}
      >
        <span>{currency.flag}</span>
        <span>{currency.code}</span>
        <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-64 rounded-2xl border border-slate-200 bg-white shadow-2xl slide-down overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setCurrency(c); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-sky-50 transition-colors ${
                  currency.code === c.code ? 'bg-sky-50 text-sky-700' : 'text-slate-700'
                }`}
              >
                <span className="text-lg">{c.flag}</span>
                <div>
                  <div className="font-semibold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{c.code}</div>
                  <div className="text-xs text-slate-400">{c.name}</div>
                </div>
                {currency.code === c.code && <span className="ml-auto text-sky-500 text-xs">✓</span>}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">No currencies found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
