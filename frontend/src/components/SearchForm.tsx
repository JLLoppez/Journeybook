import { useState } from 'react';
import { PlaneTakeoff, PlaneLanding, CalendarDays, BriefcaseBusiness, Search } from 'lucide-react';
import CitySearch from './CitySearch';
import type { FlightSearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: FlightSearchParams) => void;
  loading?: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [originCode, setOriginCode] = useState('');
  const [destCode, setDestCode] = useState('');
  const [date, setDate] = useState('');
  const [flightClass, setFlightClass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: FlightSearchParams = {};
    if (originCode) params.origin = originCode;
    if (destCode) params.destination = destCode;
    if (date) params.date = date;
    if (flightClass) params.class = flightClass;
    onSearch(params);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h3 className="text-lg font-bold text-slate-800 mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
        Find your flight
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div>
          <label className="label flex items-center gap-2">
            <PlaneTakeoff className="h-4 w-4" />
            From
          </label>
          <CitySearch
            value=""
            onChange={(_display, code) => setOriginCode(code)}
            placeholder="e.g. Cape Town"
            label=""
          />
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <PlaneLanding className="h-4 w-4" />
            To
          </label>
          <CitySearch
            value=""
            onChange={(_display, code) => setDestCode(code)}
            placeholder="e.g. Dubai"
            label=""
          />
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Departure Date
          </label>
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4" />
            Class
          </label>
          <select
            className="input-field"
            value={flightClass}
            onChange={e => setFlightClass(e.target.value)}
          >
            <option value="">All classes</option>
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base flex items-center gap-2">
        <Search className="h-4 w-4" />
        {loading ? 'Searching...' : 'Search Flights'}
      </button>
    </form>
  );
}
