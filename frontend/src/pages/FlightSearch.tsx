import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PlaneTakeoff, PlaneLanding, CalendarDays, BriefcaseBusiness, Clock3, Ticket } from 'lucide-react';
import { flightService } from '../services/api';

type FlightSearchParams = {
  origin: string;
  destination: string;
  departureDate: string;
  cabinClass: string;
};

const FlightSearch = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const [params, setParams] = useState<FlightSearchParams>({
    origin: query.get('origin') || (location.state as any)?.origin || '',
    destination: query.get('destination') || (location.state as any)?.destination || '',
    departureDate: '',
    cabinClass: 'economy',
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      origin: query.get('origin') || (location.state as any)?.origin || prev.origin,
      destination: query.get('destination') || (location.state as any)?.destination || prev.destination,
    }));
  }, [location.key]);

  const onChange = (key: keyof FlightSearchParams, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const onSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await flightService.search({
        origin: params.origin,
        destination: params.destination,
        date: params.departureDate,
        cabinClass: params.cabinClass,
      });

      const normalized =
        Array.isArray(data) ? data :
        Array.isArray(data?.flights) ? data.flights :
        Array.isArray(data?.data) ? data.data :
        Array.isArray(data?.results) ? data.results :
        [];

      setResults(normalized);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to search flights');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-3xl font-bold text-slate-800">Search Flights</h1>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <PlaneTakeoff className="h-4 w-4" />
                Origin
              </label>
              <input
                value={params.origin}
                onChange={(e) => onChange('origin', e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-slate-200 p-4 outline-none"
                placeholder="CPT"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <PlaneLanding className="h-4 w-4" />
                Destination
              </label>
              <input
                value={params.destination}
                onChange={(e) => onChange('destination', e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-slate-200 p-4 outline-none"
                placeholder="JNB"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <CalendarDays className="h-4 w-4" />
                Departure Date
              </label>
              <input
                type="date"
                value={params.departureDate}
                onChange={(e) => onChange('departureDate', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <BriefcaseBusiness className="h-4 w-4" />
                Class
              </label>
              <select
                value={params.cabinClass}
                onChange={(e) => onChange('cabinClass', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-4 outline-none"
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={onSearch}
            disabled={loading || !params.origin || !params.destination || !params.departureDate}
            className="mt-6 rounded-3xl bg-sky-600 px-6 py-4 text-xl font-semibold text-white"
          >
            {loading ? 'Searching...' : 'Search Flights'}
          </button>

          {error ? <p className="mt-4 text-red-600">{error}</p> : null}
        </div>

        <div className="mt-4 text-lg font-semibold text-slate-700">
          {loading ? 'Searching...' : `${results.length} flights found`}
        </div>

        <div className="mt-4 space-y-4">
          {!loading && results.length === 0 && !error ? (
            <div className="rounded-3xl bg-white p-6 text-slate-500 shadow-sm">
              No flights found yet for this route and date.
            </div>
          ) : null}

          {results.map((flight: any) => (
            <div key={flight._id || flight.id || flight.flightNumber} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {flight.origin?.code || params.origin} → {flight.destination?.code || params.destination}
                  </h3>
                  <p className="mt-1 text-slate-500">
                    {flight.origin?.city || ''} to {flight.destination?.city || ''}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-sky-700">
                    R{Number(flight.price || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">{flight.class || params.cabinClass}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Ticket className="h-4 w-4" />
                    Airline
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {flight.airline} {flight.flightNumber ? `· ${flight.flightNumber}` : ''}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <PlaneTakeoff className="h-4 w-4" />
                    Departure
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">{flight.departure?.time || '—'}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <PlaneLanding className="h-4 w-4" />
                    Arrival
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">{flight.arrival?.time || '—'}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    Duration
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">{flight.duration || '—'}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(flight.amenities || []).map((item: string) => (
                  <span
                    key={item}
                    className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;
