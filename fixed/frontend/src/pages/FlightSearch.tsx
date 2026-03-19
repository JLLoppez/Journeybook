import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlaneTakeoff, PlaneLanding, CalendarDays, Users, Clock, ChevronRight, ArrowRight, Wifi, Briefcase } from 'lucide-react';
import { flightService, bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CitySearch from '../components/CitySearch';
import toast from 'react-hot-toast';

type SearchParams = {
  origin: string;
  originDisplay: string;
  destination: string;
  destinationDisplay: string;
  departureDate: string;
  cabinClass: string;
  passengers: number;
};

const CLASS_LABELS: Record<string, string> = {
  economy: 'Economy',
  business: 'Business',
  first: 'First Class',
};

const CLASS_BADGE: Record<string, string> = {
  economy: 'badge-economy',
  business: 'badge-business',
  first: 'badge-first',
};

export default function FlightSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const query = new URLSearchParams(location.search);

  const [params, setParams] = useState<SearchParams>({
    origin: query.get('origin') || '',
    originDisplay: query.get('origin') || '',
    destination: query.get('destination') || '',
    destinationDisplay: query.get('destination') || '',
    departureDate: '',
    cabinClass: 'economy',
    passengers: 1,
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingFlight, setBookingFlight] = useState<any | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({ email: '', phone: '' });
  const [searched, setSearched] = useState(false);

  // Sync URL params on navigation
  useEffect(() => {
    const o = query.get('origin') || '';
    const d = query.get('destination') || '';
    if (o || d) {
      setParams(prev => ({
        ...prev,
        origin: o || prev.origin,
        originDisplay: o || prev.originDisplay,
        destination: d || prev.destination,
        destinationDisplay: d || prev.destinationDisplay,
      }));
    }
  }, [location.key]);

  // Today's min date for date input
  const today = new Date().toISOString().split('T')[0];

  const onSearch = async () => {
    if (!params.origin || !params.destination || !params.departureDate) {
      toast.error('Please fill in origin, destination, and date');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSearched(true);
      const data = await flightService.search({
        origin: params.origin,
        destination: params.destination,
        date: params.departureDate,
        cabinClass: params.cabinClass,
      });
      const normalized =
        Array.isArray(data) ? data :
        Array.isArray(data?.flights) ? data.flights :
        Array.isArray(data?.data) ? data.data : [];
      setResults(normalized);
      if (normalized.length === 0) {
        toast('No flights found for this route and date', { icon: '🔍' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to search flights';
      setError(msg);
      toast.error(msg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (flight: any) => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a flight');
      navigate('/login');
      return;
    }
    setBookingFlight(flight);
    setBookingId(flight._id || flight.id);
  };

  const confirmBooking = async () => {
    if (!bookingId || !bookingFlight) return;
    if (!bookingForm.email) { toast.error('Please enter your contact email'); return; }
    setBookingLoading(true);
    try {
      const res = await bookingService.create({
        flightId: bookingId,
        passengers: params.passengers,
        class: params.cabinClass,
        contactEmail: bookingForm.email,
        contactPhone: bookingForm.phone,
      });
      toast.success(`Booking confirmed! Ref: ${res.booking?.bookingReference}`);
      setBookingFlight(null);
      setBookingId(null);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search panel */}
      <div className="hero-bg py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-white font-extrabold text-2xl sm:text-3xl mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            Search Flights
          </h1>

          <div className="card p-5 sm:p-6 bg-white/[0.03] border-white/10 backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Origin */}
              <div>
                <label className="label-dark">From</label>
                <CitySearch
                  value={params.originDisplay}
                  onChange={(display, code) => setParams(p => ({ ...p, origin: code, originDisplay: display }))}
                  placeholder="Cape Town, Dubai..."
                  dark
                />
              </div>

              {/* Destination */}
              <div>
                <label className="label-dark">To</label>
                <CitySearch
                  value={params.destinationDisplay}
                  onChange={(display, code) => setParams(p => ({ ...p, destination: code, destinationDisplay: display }))}
                  placeholder="London, Nairobi..."
                  dark
                />
              </div>

              {/* Date */}
              <div>
                <label className="label-dark">Departure</label>
                <input
                  type="date"
                  min={today}
                  value={params.departureDate}
                  onChange={e => setParams(p => ({ ...p, departureDate: e.target.value }))}
                  className="input-dark w-full"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* Class + Passengers */}
              <div>
                <label className="label-dark">Class · Passengers</label>
                <div className="flex gap-2">
                  <select
                    value={params.cabinClass}
                    onChange={e => setParams(p => ({ ...p, cabinClass: e.target.value }))}
                    className="input-dark flex-1"
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={params.passengers}
                    onChange={e => setParams(p => ({ ...p, passengers: parseInt(e.target.value) || 1 }))}
                    className="input-dark w-16 text-center"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={onSearch}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-150 shadow-lg hover:shadow-sky-500/30 flex items-center justify-center gap-2 text-sm"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <PlaneTakeoff className="w-4 h-4" />
                  Search Flights
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Result count */}
        {searched && !loading && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-slate-600 font-semibold">
              {results.length > 0
                ? <><span className="text-slate-900 font-extrabold">{results.length}</span> flight{results.length !== 1 ? 's' : ''} found</>
                : 'No flights found'}
            </p>
            {results.length > 0 && (
              <p className="text-xs text-slate-400">
                {params.origin} → {params.destination} · {params.departureDate}
              </p>
            )}
          </div>
        )}

        {/* Skeleton loader */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="skeleton h-6 w-48 rounded-lg" />
                  <div className="skeleton h-8 w-24 rounded-lg" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1,2,3,4].map(j => <div key={j} className="skeleton h-16 rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="card p-6 border-red-100 bg-red-50">
            <p className="text-red-600 font-semibold">{error}</p>
            <button onClick={onSearch} className="mt-3 text-sm text-red-500 hover:underline">Try again</button>
          </div>
        )}

        {/* Empty state */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              No flights found
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Try different dates or check that your airport codes are correct (e.g. CPT, JNB, DXB).
            </p>
          </div>
        )}

        {/* Flight cards */}
        {!loading && results.length > 0 && (
          <div className="space-y-4 fade-in">
            {results.map((flight: any, index: number) => (
              <div
                key={flight._id || flight.id || flight.flightNumber || index}
                className="card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Top bar — colored by class */}
                <div className={`h-1 ${flight.class === 'first' ? 'bg-gradient-to-r from-violet-500 to-purple-600' : flight.class === 'business' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-sky-500 to-blue-600'}`} />

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                      {/* Airline logo placeholder */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                        ✈
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{flight.airline}</p>
                        <p className="text-xs text-slate-400">{flight.flightNumber}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                        R{Number(flight.price || 0).toLocaleString()}
                      </p>
                      <span className={CLASS_BADGE[flight.class] || 'badge-economy'}>
                        {CLASS_LABELS[flight.class] || flight.class}
                      </span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-4 mb-5">
                    <div>
                      <p className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {flight.origin?.code || params.origin}
                      </p>
                      <p className="text-xs text-slate-500">{flight.origin?.city || ''}</p>
                      <p className="text-lg font-bold text-slate-700 mt-0.5">{flight.departure?.time || '—'}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-xs text-slate-400">{flight.duration || '—'}</p>
                      <div className="flex w-full items-center gap-1">
                        <div className="flex-1 h-px bg-slate-200" />
                        <ArrowRight className="w-4 h-4 text-sky-500" />
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                      <p className="text-xs text-slate-400">
                        {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {flight.destination?.code || params.destination}
                      </p>
                      <p className="text-xs text-slate-500">{flight.destination?.city || ''}</p>
                      <p className="text-lg font-bold text-slate-700 mt-0.5">{flight.arrival?.time || '—'}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Users className="w-3.5 h-3.5" />
                        {flight.availableSeats} seats left
                      </span>
                      {(flight.amenities || []).slice(0, 2).map((a: string) => (
                        <span key={a} className="flex items-center gap-1 text-xs text-slate-400">
                          <Briefcase className="w-3.5 h-3.5" />
                          {a}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleBook(flight)}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-sky-500/25"
                      style={{ fontFamily: 'Syne, sans-serif' }}
                    >
                      Book
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking modal */}
      {bookingFlight && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) { setBookingFlight(null); setBookingId(null); } }}
        >
          <div className="card w-full max-w-md p-6 slide-down">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Confirm Booking
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {bookingFlight.origin?.code} → {bookingFlight.destination?.code} · R{Number(bookingFlight.price).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => { setBookingFlight(null); setBookingId(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Contact Email *</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@email.com"
                  value={bookingForm.email}
                  onChange={e => setBookingForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+27 ..."
                  value={bookingForm.phone}
                  onChange={e => setBookingForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Passengers</span>
                  <span className="font-semibold">{params.passengers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class</span>
                  <span className="font-semibold capitalize">{params.cabinClass}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="font-extrabold text-sky-600" style={{ fontFamily: 'Syne, sans-serif' }}>
                    R{(Number(bookingFlight.price) * params.passengers).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={confirmBooking}
                disabled={bookingLoading}
                className="btn-primary w-full justify-center py-3.5"
              >
                {bookingLoading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing...</>
                ) : 'Confirm Booking →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
