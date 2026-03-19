import { useNavigate } from 'react-router-dom';
import type { Booking } from '../types';
import { format, isValid } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
  index?: number;
}

// BUG FIX: safe date formatting
const safeFormat = (dateStr: string | undefined | null, fmt: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isValid(d) ? format(d, fmt) : '—';
};

const CLASS_BADGE: Record<string, string> = {
  economy: 'badge-economy',
  business: 'badge-business',
  first: 'badge-first',
};

export default function BookingCard({ booking, onCancel, index = 0 }: BookingCardProps) {
  const navigate = useNavigate();
  const flight = booking.flight;

  const statusClass: Record<string, string> = {
    confirmed: 'status-confirmed',
    pending: 'status-pending',
    cancelled: 'status-cancelled',
  };

  return (
    <div
      className="card-hover group fade-up" style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => navigate(`/bookings/${booking._id}`)}
    >
      {/* Class colour bar */}
      <div className={`h-1 ${
        booking.class === 'first'
          ? 'bg-gradient-to-r from-violet-500 to-purple-600'
          : booking.class === 'business'
          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
          : 'bg-gradient-to-r from-sky-500 to-blue-600'
      }`} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 mb-0.5 font-medium">Booking ref</p>
            <p
              className="font-bold text-slate-900 tracking-wider text-sm"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em' }}
            >
              {booking.bookingReference}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={statusClass[booking.status] || 'badge bg-slate-100 text-slate-600'}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            {booking.class && (
              <span className={CLASS_BADGE[booking.class] || 'badge-economy'}>
                {booking.class.charAt(0).toUpperCase() + booking.class.slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Route */}
        {flight ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div>
                <p
                  className="text-2xl font-black text-slate-900"
                  style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
                >
                  {flight.origin?.code}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{flight.origin?.city}</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-1 w-full">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-sky-400 text-sm">✈</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </div>
              <div className="text-right">
                <p
                  className="text-2xl font-black text-slate-900"
                  style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
                >
                  {flight.destination?.code}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{flight.destination?.city}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>📅 {safeFormat(flight.departure?.date, 'dd MMM yyyy')}</span>
                <span>👤 {booking.passengers}x</span>
              </div>
              <p
                className="font-extrabold text-sky-600"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                R{booking.totalPrice?.toLocaleString()}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 py-2">Flight details unavailable</p>
        )}

        {/* Cancel button */}
        {booking.status === 'confirmed' && onCancel && (
          <button
            className="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(booking._id);
            }}
          >
            Cancel booking
          </button>
        )}
      </div>
    </div>
  );
}
