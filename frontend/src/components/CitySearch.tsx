import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        const data = await locationService.search(query);
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative">
      {label ? <label className="label">{label}</label> : null}
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="input-field"
        placeholder={placeholder || 'Search airport or city'}
      />

      {open && results.length > 0 ? (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
          {results.map((item) => {
            const display = `${item.city || item.airport}, ${item.country} (${item.code})`;
            return (
              <button
                key={`${item.code}-${item.airport}`}
                type="button"
                onClick={() => {
                  setQuery(display);
                  setOpen(false);
                  onChange(display, item.code);
                }}
                className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-800">{display}</div>
                <div className="text-sm text-slate-500">{item.airport}</div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
