import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import toast from 'react-hot-toast';
import type { Flight } from '../types';

interface Props { flight: Flight; }

type Step = 'details' | 'passenger' | 'payment' | 'success';

const classLabel: Record<string, string> = {
  economy: 'Economy', business: 'Business', first: 'First Class',
};

export default function FlightCard({ flight }: Props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState('');

  // Step 1 – booking details
  const [passengers, setPassengers] = useState(1);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Step 2 – passenger info (required for Duffel live bookings)
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [bornOn, setBornOn] = useState('');
  const [gender, setGender] = useState('m');
  const [title, setTitle] = useState('mr');

  // Step 3 – payment (Stripe test card UI)
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCVC, setCardCVC] = useState('123');
  const [cardName, setCardName] = useState('');

  const isLive = flight.isLive || flight._id?.startsWith('off_');
  const totalPrice = flight.price * passengers;

  const handleOpen = () => {
    if (!isAuthenticated) { toast.error('Please login to book'); navigate('/login'); return; }
    setStep('details');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (step === 'success') navigate('/dashboard');
  };

  // Step 1 → 2 (or → payment for demo flights)
  const handleDetailsNext = () => {
    if (!contactEmail || !contactPhone) { toast.error('Please enter contact details'); return; }
    setStep(isLive ? 'passenger' : 'payment');
  };

  // Step 2 → 3
  const handlePassengerNext = () => {
    if (!givenName || !familyName || !bornOn) { toast.error('Please fill in all passenger details'); return; }
    setStep('payment');
  };

  // Final confirm
  const handleConfirm = async () => {
    if (!cardName.trim()) { toast.error('Please enter cardholder name'); return; }
    setLoading(true);
    try {
      const payload: any = {
        passengers,
        class: flight.class,
        contactEmail,
        contactPhone,
      };

      if (isLive) {
        // Live Duffel booking
        payload.duffelOfferId = flight._id;
        payload.flightId = flight._id;
        payload.passengerDetails = { givenName, familyName, bornOn, gender, title };
      } else {
        // Local seeded flight
        payload.flightId = flight._id;
      }

      // Simulate payment processing delay
      await new Promise(r => setTimeout(r, 1200));

      const result = await bookingService.create(payload);
      setConfirmedRef(result.booking?.bookingReference || 'JB-XXXXX');
      setStep('success');
      toast.success('Booking confirmed! 🎉');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const STEPS: Step[] = isLive ? ['details', 'passenger', 'payment', 'success'] : ['details', 'payment', 'success'];
  const stepIndex = STEPS.indexOf(step);

  return (
    <>
      {/* ── Flight Card ────────────────────────────────────────────── */}
      <div className="card group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
        <div className="p-5">
          {/* Airline + price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {flight.airlineLogo ? (
                <img src={flight.airlineLogo} alt={flight.airline} className="w-9 h-9 object-contain rounded-xl bg-slate-50 p-1" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg">✈</div>
              )}
              <div>
                <div className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{flight.airline}</div>
                <div className="text-xs text-slate-400">{flight.flightNumber}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-sky-600" style={{ fontFamily: 'Syne, sans-serif' }}>
                R{flight.price.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                per person{flight.originalCurrency && flight.originalCurrency !== 'ZAR' ? ` (${flight.originalCurrency})` : ''}
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <div className="text-2xl font-black text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>{flight.origin.code}</div>
              <div className="text-xs text-slate-500 truncate">{flight.origin.city}</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">{flight.departure.time}</div>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-slate-400">{flight.duration}</div>
              <div className="relative w-full flex items-center">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="mx-1.5 text-sky-400 text-sm">✈</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="text-xs text-slate-400">
                {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-2xl font-black text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>{flight.destination.code}</div>
              <div className="text-xs text-slate-500 truncate">{flight.destination.city}</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">{flight.arrival.time}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge badge-${flight.class}`}>{classLabel[flight.class] || flight.class}</span>
              {isLive && <span className="badge bg-green-100 text-green-600">● Live</span>}
              {!isLive && <span className="badge bg-slate-100 text-slate-500">{flight.availableSeats} seats</span>}
              {flight.co2Emissions && <span className="badge bg-emerald-50 text-emerald-600 text-xs">🌱 {flight.co2Emissions}</span>}
            </div>
            <button onClick={handleOpen} className="btn-primary text-sm py-2 px-4">Book Now</button>
          </div>

          {flight.amenities?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {flight.amenities.slice(0, 4).map(a => (
                <span key={a} className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">{a}</span>
              ))}
            </div>
          )}

          {flight.offerExpiresAt && (
            <div className="mt-2 text-xs text-amber-500">
              ⏱ Offer expires {new Date(flight.offerExpiresAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* ── Booking Modal ──────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto fade-up">

            {/* Progress bar */}
            <div className="flex border-b border-slate-100">
              {STEPS.filter(s => s !== 'success').map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 py-3 text-center text-xs font-bold transition-colors ${
                    stepIndex === i ? 'text-sky-600 border-b-2 border-sky-500'
                    : i < stepIndex ? 'text-green-500'
                    : 'text-slate-300'
                  }`}
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
                </div>
              ))}
            </div>

            <div className="p-6">
              {/* Flight summary bar */}
              {step !== 'success' && (
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{flight.airline} · {flight.flightNumber}</div>
                    <div className="text-xs text-slate-500">{flight.origin.code} → {flight.destination.code} · {flight.duration}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-sky-600 text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>R{(flight.price * passengers).toLocaleString()}</div>
                    <div className="text-xs text-slate-400">{passengers} pax</div>
                  </div>
                </div>
              )}

              {/* ── STEP: details ── */}
              {step === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Passengers</label>
                    <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="input-field">
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Contact Email</label>
                    <input type="email" className="input-field" placeholder="you@email.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Contact Phone</label>
                    <input type="tel" className="input-field" placeholder="+27 81 000 0000" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={handleClose} className="btn-outline flex-1">Cancel</button>
                    <button onClick={handleDetailsNext} className="btn-primary flex-1 justify-center">Continue →</button>
                  </div>
                </div>
              )}

              {/* ── STEP: passenger (Duffel live only) ── */}
              {step === 'passenger' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 bg-sky-50 border border-sky-100 rounded-xl p-3">
                    Duffel requires full passenger details for real bookings.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Title</label>
                      <select className="input-field" value={title} onChange={e => setTitle(e.target.value)}>
                        <option value="mr">Mr</option>
                        <option value="ms">Ms</option>
                        <option value="mrs">Mrs</option>
                        <option value="dr">Dr</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Gender</label>
                      <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="m">Male</option>
                        <option value="f">Female</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">First Name</label>
                    <input type="text" className="input-field" placeholder="Jose" value={givenName} onChange={e => setGivenName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input type="text" className="input-field" placeholder="Alves" value={familyName} onChange={e => setFamilyName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Date of Birth</label>
                    <input type="date" className="input-field" value={bornOn} onChange={e => setBornOn(e.target.value)} />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setStep('details')} className="btn-outline flex-1">← Back</button>
                    <button onClick={handlePassengerNext} className="btn-primary flex-1 justify-center">Continue →</button>
                  </div>
                </div>
              )}

              {/* ── STEP: payment ── */}
              {step === 'payment' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                    <strong>Test Mode:</strong> Use 4242 4242 4242 4242, any future expiry, any CVC.
                  </div>
                  <div>
                    <label className="label">Cardholder Name</label>
                    <input type="text" className="input-field" placeholder="Jose Alves" value={cardName} onChange={e => setCardName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Card Number</label>
                    <input type="text" className="input-field font-mono tracking-widest" maxLength={19} value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Expiry</label>
                      <input type="text" className="input-field" placeholder="MM/YY" maxLength={5} value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">CVC</label>
                      <input type="text" className="input-field" placeholder="123" maxLength={4} value={cardCVC} onChange={e => setCardCVC(e.target.value)} />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
                      <span>Total</span>
                      <span className="text-sky-600">R{totalPrice.toLocaleString()}</span>
                    </div>
                    {isLive && <div className="text-xs text-slate-400 mt-1">Booked via Duffel · real airline reservation</div>}
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setStep(isLive ? 'passenger' : 'details')} className="btn-outline flex-1">← Back</button>
                    <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1 justify-center">
                      {loading ? 'Confirming...' : `🔒 Pay R${totalPrice.toLocaleString()}`}
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP: success ── */}
              {step === 'success' && (
                <div className="text-center py-4">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Booking Confirmed!</h3>
                  <p className="text-slate-500 text-sm mb-3">Your booking reference:</p>
                  <div className="text-2xl font-black text-sky-600 tracking-widest mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>{confirmedRef}</div>
                  {isLive && <p className="text-xs text-slate-400 mb-4">Booked directly with the airline via Duffel</p>}
                  <p className="text-slate-400 text-xs mb-6">Confirmation sent to {contactEmail}</p>
                  <button onClick={handleClose} className="btn-primary w-full justify-center">View Dashboard →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
