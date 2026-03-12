import { useNavigate } from 'react-router-dom';
import type { Booking } from '../types';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const navigate = useNavigate();

  const statusClass: Record<string, string> = {
    confirmed: 'status-confirmed',
    pending: 'status-pending',
    cancelled: 'status-cancelled',
  };

  const flight = booking.flight;
  const departureDate = flight?.departure?.date
    ? format(new Date(flight.departure.date), 'dd MMM yyyy')
    : '—';

  return (
    <div className="card hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => navigate(`/bookings/${booking._id}`)}>
      <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs text-slate-400 mb-0.5">Booking ref</div>
            <div className="font-bold text-slate-800 tracking-widest text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
              {booking.bookingReference}
            </div>
          </div>
          <span className={statusClass[booking.status] || 'badge bg-slate-100 text-slate-600'}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        {flight ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div>
                <div className="text-xl font-black text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>{flight.origin?.code}</div>
                <div className="text-xs text-slate-400">{flight.origin?.city}</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-sky-400">✈</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>{flight.destination?.code}</div>
                <div className="text-xs text-slate-400">{flight.destination?.city}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>📅 {departureDate}</span>
                <span>👤 {booking.passengers}x</span>
              </div>
              <div className="font-bold text-sky-600" style={{ fontFamily: 'Syne, sans-serif' }}>
                R{booking.totalPrice?.toLocaleString()}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">Flight details unavailable</p>
        )}

        {booking.status === 'confirmed' && onCancel && (
          <button
            className="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors"
            onClick={(e) => { e.stopPropagation(); onCancel(booking._id); }}
          >
            Cancel booking
          </button>
        )}
      </div>
    </div>
  );
}
