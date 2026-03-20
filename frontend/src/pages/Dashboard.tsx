import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import BookingCard from '../components/BookingCard';
import type { Booking } from '../types';
import toast from 'react-hot-toast';
import { format, isAfter } from 'date-fns';
import { Plane, Calendar, Map, CreditCard, Sparkles, Plus, Inbox, Camera, Save, ClipboardList } from 'lucide-react';

type TabType = 'upcoming' | 'past' | 'all';

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
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking? This cannot be undone.')) return;
    try {
      await bookingService.cancel(id);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const now = new Date();
  const active = bookings.filter(b => b.status !== 'cancelled');
  const upcoming = active.filter(b => {
    const d = b.flight?.departure?.date ? new Date(b.flight.departure.date) : null;
    return d ? isAfter(d, now) : true;
  });
  const past = active.filter(b => {
    const d = b.flight?.departure?.date ? new Date(b.flight.departure.date) : null;
    return d ? !isAfter(d, now) : false;
  });
  const totalSpent = active.reduce((s, b) => s + (b.totalPrice || 0), 0);
  const nextTrip = [...upcoming].sort((a, b) => {
    const da = a.flight?.departure?.date ? new Date(a.flight.departure.date).getTime() : Infinity;
    const db = b.flight?.departure?.date ? new Date(b.flight.departure.date).getTime() : Infinity;
    return da - db;
  })[0];

  const TABS = [
    { id: 'upcoming' as TabType, label: 'Upcoming', count: upcoming.length },
    { id: 'past' as TabType, label: 'Past Trips', count: past.length },
    { id: 'all' as TabType, label: 'All Bookings', count: bookings.length },
  ];

  const shown = tab === 'upcoming' ? upcoming : tab === 'past' ? past : bookings;

  const stats = [
    { label: 'Total Trips', value: active.length, icon: <Plane className="w-5 h-5" />, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Upcoming', value: upcoming.length, icon: <Calendar className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Past Trips', value: past.length, icon: <Map className="w-5 h-5" />, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Total Spent', value: 'R' + totalSpent.toLocaleString(), icon: <CreditCard className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your trips and travel plans</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/planner')} className="btn-outline text-sm py-2.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> AI Planner
          </button>
          <button onClick={() => navigate('/flights')} className="btn-primary text-sm py-2.5 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Book Flight
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={'w-9 h-9 rounded-xl ' + s.bg + ' flex items-center justify-center mb-3 ' + s.color}>
              {s.icon}
            </div>
            <div className={'text-xl sm:text-2xl font-extrabold ' + s.color} style={{ fontFamily: 'Syne, sans-serif' }}>
              {s.value}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Next trip banner */}
      {nextTrip?.flight && (
        <div
          className="rounded-2xl p-5 sm:p-6 mb-8 text-white relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #080d1a 0%, #0c3a5c 100%)' }}
          onClick={() => navigate('/bookings/' + nextTrip._id)}
        >
          <div className="absolute inset-0 grid-texture pointer-events-none" />
          <div className="absolute -right-6 -top-6 opacity-[0.04] pointer-events-none select-none">
            <Plane className="w-32 h-32" />
          </div>
          <div className="relative">
            <p className="text-xs text-white/40 tracking-widest uppercase mb-2">Next Trip</p>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
                  {nextTrip.flight.origin?.code} → {nextTrip.flight.destination?.code}
                </div>
                <div className="text-white/60 text-sm mt-1">
                  {nextTrip.flight.destination?.city} · {nextTrip.flight.departure?.date
                    ? format(new Date(nextTrip.flight.departure.date), 'EEEE, dd MMM yyyy')
                    : 'Date TBC'}
                </div>
                <div className="text-white/40 text-xs mt-1">
                  {nextTrip.flight.airline} · Ref: {nextTrip.bookingReference}
                </div>
              </div>
              <span className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                View Details →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl overflow-x-auto scroll-hide">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ' + (tab === t.id ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
            style={{ fontFamily: 'Syne, sans-serif' }}>
            {t.label}
            {t.count > 0 && (
              <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (tab === t.id ? 'bg-sky-100 text-sky-600' : 'bg-slate-200 text-slate-500')}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
              <div className="skeleton h-12 w-full rounded-xl" />
              <div className="flex justify-between pt-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!loading && shown.length === 0 && (
        <div className="card p-16 text-center">
          <div className="flex justify-center mb-5 text-slate-300">
            {tab === 'upcoming' ? <Map className="w-16 h-16" /> : tab === 'past' ? <Camera className="w-16 h-16" /> : <ClipboardList className="w-16 h-16" />}
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            {tab === 'upcoming' ? 'No upcoming trips' : tab === 'past' ? 'No past trips yet' : 'No bookings yet'}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {tab === 'upcoming' ? 'Time to plan your next adventure!' : tab === 'past' ? 'Your travel history will appear here' : 'Book your first flight to get started'}
          </p>
          {tab !== 'past' && (
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/planner')} className="btn-outline text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> AI Planner</button>
              <button onClick={() => navigate('/flights')} className="btn-primary text-sm flex items-center gap-1.5"><Plane className="w-4 h-4" /> Search Flights</button>
            </div>
          )}
        </div>
      )}

      {/* Booking grid */}
      {!loading && shown.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 fade-in">
          {shown.map((b) => (
            <BookingCard key={b._id} booking={b} onCancel={b.status === 'confirmed' ? handleCancel : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
