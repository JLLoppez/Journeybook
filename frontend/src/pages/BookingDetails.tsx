import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import type { Booking } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    bookingService.getById(id)
      .then((data) => setBooking(data.booking || data))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!booking || !confirm('Cancel this booking?')) return;
    try {
      await bookingService.cancel(booking._id);
      toast.success('Booking cancelled');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 py-24 gap-3">
        <div className="text-3xl animate-float">✈</div>
        <p className="text-slate-400">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 text-lg">Booking not found.</p>
        <Link to="/dashboard" className="btn-primary mt-4 inline-flex">← Back to Dashboard</Link>
      </div>
    );
  }

  const flight = booking.flight;
  const statusClass: Record<string, string> = {
    confirmed: 'status-confirmed',
    pending: 'status-pending',
    cancelled: 'status-cancelled',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link to="/dashboard" className="text-sm text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="hero-bg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-white/50 mb-1 tracking-widest uppercase">Booking Reference</div>
              <div className="text-2xl font-extrabold tracking-widest" style={{ fontFamily: 'Syne, sans-serif' }}>
                {booking.bookingReference}
              </div>
            </div>
            <span className={statusClass[booking.status] || 'badge bg-white/20 text-white'}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Flight info */}
          {flight && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Flight Details</h3>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-black text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>{flight.origin?.code}</div>
                  <div className="text-sm text-slate-500">{flight.origin?.city}</div>
                  <div className="text-xs text-slate-400">{flight.origin?.airport}</div>
                  <div className="text-lg font-bold text-slate-700 mt-1">{flight.departure?.time}</div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-slate-400 mb-1">{flight.duration}</div>
                  <div className="relative w-full flex items-center">
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="mx-2 text-sky-500 text-lg">✈</span>
                    <div className="flex-1 h-px bg-slate-200"></div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>{flight.destination?.code}</div>
                  <div className="text-sm text-slate-500">{flight.destination?.city}</div>
                  <div className="text-xs text-slate-400">{flight.destination?.airport}</div>
                  <div className="text-lg font-bold text-slate-700 mt-1">{flight.arrival?.time}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Airline</div>
                  <div className="font-semibold text-slate-700">{flight.airline}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Flight No.</div>
                  <div className="font-semibold text-slate-700">{flight.flightNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Date</div>
                  <div className="font-semibold text-slate-700">
                    {flight.departure?.date ? format(new Date(flight.departure.date), 'dd MMM yyyy') : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Class</div>
                  <div className="font-semibold text-slate-700 capitalize">{booking.class}</div>
                </div>
              </div>
            </div>
          )}

          {/* Booking summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Booking Summary</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Passengers</span>
                <span className="font-semibold text-slate-700">{booking.passengers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Email</span>
                <span className="font-semibold text-slate-700">{booking.contactEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Phone</span>
                <span className="font-semibold text-slate-700">{booking.contactPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booked on</span>
                <span className="font-semibold text-slate-700">
                  {booking.createdAt ? format(new Date(booking.createdAt), 'dd MMM yyyy') : '—'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>Total Paid</span>
                <span className="text-xl font-extrabold text-sky-600" style={{ fontFamily: 'Syne, sans-serif' }}>
                  R{booking.totalPrice?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link to="/dashboard" className="btn-outline flex-1 justify-center">
              ← Dashboard
            </Link>
            {booking.status === 'confirmed' && (
              <button onClick={handleCancel} className="flex-1 px-4 py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors" style={{ fontFamily: 'Syne, sans-serif' }}>
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
