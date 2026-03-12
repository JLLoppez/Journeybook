import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import BookingCard from '../components/BookingCard';
import type { Booking } from '../types';
import toast from 'react-hot-toast';
import { format, isAfter } from 'date-fns';

type TabType = 'upcoming' | 'past' | 'saved' | 'history';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>('upcoming');

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getUserBookings();
      setBookings(data.bookings || data || []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking? This action cannot be undone.')) return;
    try {
      await bookingService.cancel(id);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to cancel'); }
  };

  const now = new Date();

  const upcoming = bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    const depDate = b.flight?.departure?.date ? new Date(b.flight.departure.date) : null;
    return depDate ? isAfter(depDate, now) : true;
  });

  const past = bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    const depDate = b.flight?.departure?.date ? new Date(b.flight.departure.date) : null;
    return depDate ? !isAfter(depDate, now) : false;
  });

  const saved = bookings.filter(b => b.savedItinerary);
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((s, b) => s + (b.totalPrice || 0), 0);

  const nextTrip = upcoming.sort((a, b) => {
    const da = a.flight?.departure?.date ? new Date(a.flight.departure.date).getTime() : Infinity;
    const db = b.flight?.departure?.date ? new Date(b.flight.departure.date).getTime() : Infinity;
    return da - db;
  })[0];

  const TABS: { id: TabType; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { id: 'past', label: 'Past Trips', count: past.length },
    { id: 'saved', label: 'Saved Plans', count: saved.length },
    { id: 'history', label: 'All Bookings', count: bookings.length },
  ];

  const activeBookings = { upcoming, past, saved, history: bookings }[tab];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your trips and travel plans</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/planner')}
            className="btn-outline text-sm py-2"
          >
            ✨ AI Planner
          </button>
          <button
            onClick={() => navigate('/flights')}
            className="btn-primary text-sm py-2"
          >
            + Book Flight
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Trips', value: bookings.filter(b => b.status !== 'cancelled').length, icon: '✈', color: 'text-sky-600' },
          { label: 'Upcoming', value: upcoming.length, icon: '📅', color: 'text-green-600' },
          { label: 'Past Trips', value: past.length, icon: '🗺️', color: 'text-purple-600' },
          { label: 'Total Spent', value: `R${totalSpent.toLocaleString()}`, icon: '💳', color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className={`text-xl sm:text-2xl font-extrabold ${s.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>
              {s.value}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Next trip banner */}
      {nextTrip && nextTrip.flight && (
        <div
          className="rounded-2xl p-5 mb-8 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)' }}
        >
          <div className="absolute top-0 right-0 text-8xl opacity-5 pointer-events-none leading-none">✈</div>
          <div className="text-xs text-white/50 tracking-widest uppercase mb-1">Next Trip</div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>
                {nextTrip.flight.origin?.code} → {nextTrip.flight.destination?.code}
              </div>
              <div className="text-white/70 text-sm">
                {nextTrip.flight.destination?.city} · {nextTrip.flight.departure?.date
                  ? format(new Date(nextTrip.flight.departure.date), 'EEEE, dd MMM yyyy')
                  : 'Date TBC'}
              </div>
              <div className="text-white/50 text-xs mt-1">
                {nextTrip.flight.airline} · {nextTrip.bookingReference}
              </div>
            </div>
            <button
              onClick={() => navigate(`/bookings/${nextTrip._id}`)}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm whitespace-nowrap"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              View Details →
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              tab === t.id ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.id ? 'bg-sky-100 text-sky-600' : 'bg-slate-200 text-slate-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-3xl animate-float">✈</div>
          <p className="text-slate-400 text-sm">Loading your trips...</p>
        </div>
      )}

      {!loading && activeBookings.length === 0 && (
        <div className="text-center py-20">
          {tab === 'upcoming' && (
            <>
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No upcoming trips</h3>
              <p className="text-slate-400 mb-6 text-sm">Time to plan your next adventure!</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/planner')} className="btn-outline">✨ AI Planner</button>
                <button onClick={() => navigate('/flights')} className="btn-primary">Search Flights</button>
              </div>
            </>
          )}
          {tab === 'past' && (
            <>
              <div className="text-5xl mb-4">📷</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No past trips yet</h3>
              <p className="text-slate-400 text-sm">Your travel history will appear here</p>
            </>
          )}
          {tab === 'saved' && (
            <>
              <div className="text-5xl mb-4">💾</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No saved itineraries</h3>
              <p className="text-slate-400 mb-5 text-sm">Generate a trip plan with our AI and save it here</p>
              <button onClick={() => navigate('/planner')} className="btn-primary">✨ Try AI Planner</button>
            </>
          )}
          {tab === 'history' && (
            <>
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No bookings yet</h3>
              <button onClick={() => navigate('/flights')} className="btn-primary mt-4">Book Your First Flight</button>
            </>
          )}
        </div>
      )}

      {!loading && activeBookings.length > 0 && (
        <>
          {tab === 'saved' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {saved.map((b) => (
                <div key={b._id} className="card p-5 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate(`/bookings/${b._id}`)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {b.flight?.origin?.code} → {b.flight?.destination?.code}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{b.bookingReference}</div>
                    </div>
                    <span className="badge bg-purple-100 text-purple-700">Saved Plan</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    Itinerary saved for {b.flight?.destination?.city}
                  </div>
                  <div className="mt-3 text-xs text-sky-600 font-semibold">View itinerary →</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeBookings.map((b) => (
                <BookingCard key={b._id} booking={b} onCancel={b.status === 'confirmed' ? handleCancel : undefined} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
