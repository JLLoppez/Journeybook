import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import type { Booking } from '../types';
import { format, isValid } from 'date-fns';
import toast from 'react-hot-toast';
import { Plane, ArrowLeft, ArrowRight } from 'lucide-react';

const safeFormat = (dateStr: string | undefined | null, fmt: string, fallback = '—') => {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  return isValid(d) ? format(d, fmt) : fallback;
};

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    bookingService.getById(id)
      .then((data) => setBooking(data.booking || data))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!booking || !confirm('Cancel this booking? This cannot be undone.')) return;
    setCancelling(true);
    try {
      await bookingService.cancel(booking._id);
      toast.success('Booking cancelled');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="skeleton h-5 w-32 rounded mb-6" />
        <div className="card overflow-hidden">
          <div className="skeleton h-32 w-full" />
          <div className="p-6 space-y-4">
            <div className="skeleton h-20 w-full rounded-xl" />
            <div className="skeleton h-36 w-full rounded-xl" />
            <div className="skeleton h-28 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-24 px-4">
        <div className="flex justify-center mb-4 text-slate-300"><Plane className="w-16 h-16" /></div>
        <p className="text-slate-600 text-lg font-semibold mb-2">Booking not found</p>
        <p className="text-slate-400 text-sm mb-6">This booking may have been removed or the link is invalid.</p>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const flight = booking.flight;
  const statusMap: Record<string, string> = {
    confirmed: 'status-confirmed',
    pending: 'status-pending',
    cancelled: 'status-cancelled',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <Link to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 font-semibold mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="card overflow-hidden">
        <div className="hero-mesh p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 grid-texture pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-white/40 tracking-widest uppercase mb-1">Booking Reference</p>
              <p className="text-2xl font-extrabold tracking-widest" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em' }}>
                {booking.bookingReference}
              </p>
              <p className="text-white/50 text-xs mt-1">Booked on {safeFormat(booking.createdAt, 'dd MMM yyyy')}</p>
            </div>
            <span className={statusMap[booking.status] || 'badge bg-white/20 text-white'}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {flight ? (
            <div>
              <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-5">Flight Details</p>

              <div className="flex items-center gap-4 sm:gap-8">
                <div>
                  <p className="text-4xl font-black text-slate-900" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
                    {flight.origin?.code}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{flight.origin?.city}</p>
                  <p className="text-xs text-slate-400">{flight.origin?.airport}</p>
                  <p className="text-xl font-bold text-slate-800 mt-2">{flight.departure?.time || '—'}</p>
                </div>

                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <p className="text-xs text-slate-400">{flight.duration || '—'}</p>
                  <div className="relative w-full flex items-center">
                    <div className="flex-1 h-px bg-slate-200" />
                    <Plane className="w-4 h-4 text-sky-500 mx-2" />
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  <p className="text-xs text-slate-400">
                    {flight.stops === 0 ? 'Nonstop' : flight.stops + ' stop' + (flight.stops > 1 ? 's' : '')}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-4xl font-black text-slate-900" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
                    {flight.destination?.code}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{flight.destination?.city}</p>
                  <p className="text-xs text-slate-400">{flight.destination?.airport}</p>
                  <p className="text-xl font-bold text-slate-800 mt-2">{flight.arrival?.time || '—'}</p>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Airline', value: flight.airline },
                  { label: 'Flight No.', value: flight.flightNumber },
                  { label: 'Date', value: safeFormat(flight.departure?.date, 'dd MMM yyyy') },
                  { label: 'Class', value: booking.class ? booking.class.charAt(0).toUpperCase() + booking.class.slice(1) : '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                    <p className="font-semibold text-slate-800 text-sm">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-400">
              Flight details unavailable for this booking.
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Booking Summary</p>
            <div className="bg-slate-50 rounded-2xl p-5 space-y-3 text-sm">
              {[
                { label: 'Passengers', value: booking.passengers },
                { label: 'Contact Email', value: booking.contactEmail },
                { label: 'Contact Phone', value: booking.contactPhone || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-800">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>Total Paid</span>
                <span className="text-2xl font-extrabold text-sky-600" style={{ fontFamily: 'Syne, sans-serif' }}>
                  R{booking.totalPrice?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Link to="/dashboard" className="btn-outline flex-1 justify-center flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            {booking.status === 'confirmed' && (
              <button onClick={handleCancel} disabled={cancelling}
                className="btn-danger flex-1 justify-center flex items-center gap-2">
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
