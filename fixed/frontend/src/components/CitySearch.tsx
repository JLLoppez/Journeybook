import { useEffect, useRef, useState } from 'react';
import { locationService } from '../services/api';

type LocationItem = {
  city: string;
  country: string;
  airport: string;
  code: string;
  type?: string;
};

interface CitySearchProps {
  value: string;
  onChange: (display: string, code: string) => void;
  placeholder?: string;
  label?: string;
  dark?: boolean;
}

export default function CitySearch({ value, onChange, placeholder, label, dark }: CitySearchProps) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes (e.g. when URL params pre-fill)
  useEffect(() => {
    if (value && value !== query) setQuery(value);
  }, [value]);

  // Close dropdown on outside click — BUG FIX
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await locationService.search(query);
        setResults(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(t);
  }, [query]);

  const inputClass = dark ? 'input-dark' : 'input-field';

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className={dark ? 'label-dark' : 'label'}>{label}</label>}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className={inputClass}
          placeholder={placeholder || 'Search city or airport'}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className={`w-4 h-4 rounded-full border-2 border-t-transparent animate-spin ${dark ? 'border-white/40' : 'border-sky-400'}`} />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl slide-down">
          {results.map((item) => {
            const display = `${item.city || item.airport}, ${item.country} (${item.code})`;
            return (
              <button
                key={`${item.code}-${item.airport}`}
                type="button"
                onMouseDown={(e) => {
                  // Use mousedown (before blur) to prevent dropdown close race condition
                  e.preventDefault();
                  setQuery(display);
                  setOpen(false);
                  onChange(display, item.code);
                }}
                className="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-sky-50 transition-colors"
              >
                <span className="mt-0.5 text-slate-400 text-sm flex-shrink-0">✈</span>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{item.city || item.airport}</div>
                  <div className="text-xs text-slate-400">{item.airport} · {item.country} · <span className="font-bold text-sky-600">{item.code}</span></div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
