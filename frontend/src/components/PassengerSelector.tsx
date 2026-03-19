import { useRef, useState, useEffect } from 'react';
import { Users } from 'lucide-react';

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerSelectorProps {
  value: PassengerCounts;
  onChange: (counts: PassengerCounts) => void;
  dark?: boolean;
}

const TYPES = [
  {
    key: 'adults' as const,
    label: 'Adults',
    sub: 'Age 12+',
    min: 1,
    max: 9,
  },
  {
    key: 'children' as const,
    label: 'Children',
    sub: 'Age 2–11',
    min: 0,
    max: 8,
  },
  {
    key: 'infants' as const,
    label: 'Infants',
    sub: 'Under 2 · lap',
    min: 0,
    max: 4,
  },
];

export default function PassengerSelector({ value, onChange, dark }: PassengerSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const total = value.adults + value.children + value.infants;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const update = (key: keyof PassengerCounts, delta: number) => {
    const type = TYPES.find(t => t.key === key)!;
    const next = Math.max(type.min, Math.min(type.max, value[key] + delta));

    // Infants can't exceed adults
    if (key === 'infants' && next > value.adults) return;

    // Total cap of 9
    const newTotal = total - value[key] + next;
    if (newTotal > 9) return;

    onChange({ ...value, [key]: next });
  };

  const summaryText = () => {
    const parts = [`${value.adults} Adult${value.adults !== 1 ? 's' : ''}`];
    if (value.children > 0) parts.push(`${value.children} Child${value.children !== 1 ? 'ren' : ''}`);
    if (value.infants > 0) parts.push(`${value.infants} Infant${value.infants !== 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  const triggerClass = dark
    ? 'input-dark w-full text-left flex items-center gap-2 cursor-pointer'
    : 'input-field w-full text-left flex items-center gap-2 cursor-pointer';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={triggerClass}
      >
        <Users className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-white/40' : 'text-slate-400'}`} />
        <span className={`text-sm truncate ${dark ? 'text-white' : 'text-slate-800'}`}>
          {summaryText()}
        </span>
        <span className={`ml-auto text-xs flex-shrink-0 ${dark ? 'text-white/30' : 'text-slate-400'}`}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl slide-down overflow-hidden">
          <div className="p-4 space-y-1">
            {TYPES.map((type) => (
              <div key={type.key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{type.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{type.sub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => update(type.key, -1)}
                    disabled={value[type.key] <= type.min}
                    className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg
                               hover:border-sky-400 hover:text-sky-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-bold text-slate-800 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {value[type.key]}
                  </span>
                  <button
                    type="button"
                    onClick={() => update(type.key, 1)}
                    disabled={
                      value[type.key] >= type.max ||
                      total >= 9 ||
                      (type.key === 'infants' && value[type.key] >= value.adults)
                    }
                    className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg
                               hover:border-sky-400 hover:text-sky-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Rules footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-400 leading-relaxed">
              Max 9 passengers · Infants must not exceed adults · Infants travel on lap
            </p>
          </div>

          <div className="px-4 pb-4 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-all"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Done · {total} Passenger{total !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
