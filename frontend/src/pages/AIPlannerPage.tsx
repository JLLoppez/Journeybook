import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import CitySearch from '../components/CitySearch';
import PassengerSelector, { type PassengerCounts } from '../components/PassengerSelector';
import toast from 'react-hot-toast';

const TRIP_TYPES = [
  { value: 'solo',     label: '🧍', name: 'Solo' },
  { value: 'couple',   label: '👫', name: 'Couple' },
  { value: 'family',   label: '👨‍👩‍👧', name: 'Family' },
  { value: 'friends',  label: '👯', name: 'Friends' },
  { value: 'business', label: '💼', name: 'Business' },
];

const DAY_COLORS = [
  'bg-sky-500','bg-blue-500','bg-indigo-500','bg-violet-500',
  'bg-purple-500','bg-pink-500','bg-rose-500','bg-orange-500',
  'bg-amber-500','bg-yellow-500',
];

const LOADING_STEPS = [
  'Analysing your trip request...',
  'Checking available flights...',
  'Building your day-by-day itinerary...',
  'Calculating costs for your group...',
  'Adding local tips and visa requirements...',
  'Finalising your perfect plan...',
];

const EXAMPLE_PROMPTS = [
  'Relaxing beach holiday with snorkelling and local food',
  'Adventure safari with wildlife spotting',
  'Romantic getaway with fine dining and spa',
  'Cultural city break exploring history and art',
  'Family fun with kid-friendly activities',
  'Budget backpacker adventure',
];

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  accommodation?: string;
  estimatedCostZAR?: number;
}

interface TravelPlan {
  destination: string;
  duration: string;
  totalBudgetZAR: number;
  totalBudgetDisplay: string;
  perPersonBudgetZAR: number;
  perPersonBudgetDisplay: string;
  summary: string;
  itinerary: ItineraryDay[];
  flights: any[];
  tips: string[];
  bestTimeToVisit?: string;
  requiredDocuments?: string[];
  originCode: string;
  destinationCode: string;
  departureDateSuggested: string;
  returnDateSuggested?: string;
}

export default function AIPlannerPage() {
  const { isAuthenticated } = useAuth();
  const { currency, convertToZAR, formatAmount, formatZAR, isZAR } = useCurrency();
  const navigate = useNavigate();

  // Form state
  const [originCode, setOriginCode] = useState('');
  const [originDisplay, setOriginDisplay] = useState('');
  const [destCode, setDestCode] = useState('');
  const [destDisplay, setDestDisplay] = useState('');
  const [tripType, setTripType] = useState('solo');
  const [isReturn, setIsReturn] = useState(true);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState<PassengerCounts>({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState('economy');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [duration, setDuration] = useState('5');
  const [description, setDescription] = useState('');

  // Result state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [source, setSource] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const totalPax = passengers.adults + passengers.children;
  const budgetZAR = budgetAmount ? convertToZAR(parseFloat(budgetAmount)) : 0;

  const validate = () => {
    if (!originCode) { toast.error('Please select your departure city'); return false; }
    if (!destCode) { toast.error('Please select your destination'); return false; }
    if (!departureDate) { toast.error('Please select a departure date'); return false; }
    if (isReturn && !returnDate) { toast.error('Please select a return date for a return trip'); return false; }
    if (isReturn && returnDate <= departureDate) { toast.error('Return date must be after departure date'); return false; }
    if (!budgetAmount || isNaN(parseFloat(budgetAmount)) || parseFloat(budgetAmount) <= 0) {
      toast.error('Please enter a valid budget amount'); return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) { toast.error('Please log in to use the AI Planner'); navigate('/login'); return; }
    if (!validate()) return;

    setLoading(true);
    setPlan(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 2000);

    try {
      const result = await aiService.planTripFull({
        prompt: description || `${tripType} trip to ${destDisplay}`,
        origin: originCode,
        destination: destCode,
        destinationDisplay: destDisplay,
        originDisplay,
        budget: budgetZAR.toString(),
        budgetOriginal: budgetAmount,
        budgetCurrency: currency.code,
        duration,
        tripType,
        isReturn,
        departureDate,
        returnDate: isReturn ? returnDate : undefined,
        passengers,
        cabinClass,
      });
      setPlan(result.plan);
      setSource(result.source);
      if (result.warning) toast(result.warning, { icon: '⚠️' });
      // Scroll to results
      setTimeout(() => {
        document.getElementById('plan-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate plan. Try again.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const handleSelectPlan = () => {
    if (!plan) return;
    const params = new URLSearchParams();
    params.set('origin', plan.originCode || originCode);
    params.set('destination', plan.destinationCode || destCode);
    params.set('date', plan.departureDateSuggested || departureDate);
    if (isReturn && plan.returnDateSuggested) params.set('returnDate', plan.returnDateSuggested);
    params.set('cabinClass', cabinClass);
    params.set('adults', passengers.adults.toString());
    params.set('children', passengers.children.toString());
    params.set('infants', passengers.infants.toString());
    navigate(`/flights?${params.toString()}`);
  };

  const totalCostZAR = plan?.itinerary?.reduce((s, d) => s + (d.estimatedCostZAR || 0), 0) || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>🤖</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3"
          style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
          AI Travel Planner
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
          Fill in your trip details and Claude AI will generate a complete personalised itinerary — scaled to your group, budget, and travel style.
        </p>
      </div>

      {/* ── Form card ─────────────────────────────────────── */}
      <div className="card p-6 mb-8">

        {/* Row 1: Origin → Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="label">Departing From *</label>
            <CitySearch
              value={originDisplay}
              onChange={(d, code) => { setOriginDisplay(d); setOriginCode(code); }}
              placeholder="Cape Town, Johannesburg..."
            />
          </div>
          <div>
            <label className="label">Destination *</label>
            <CitySearch
              value={destDisplay}
              onChange={(d, code) => { setDestDisplay(d); setDestCode(code); }}
              placeholder="Dubai, London, Zanzibar..."
            />
          </div>
        </div>

        {/* Row 2: Trip type toggle + One way/Return */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="label">Trip Type</label>
            <div className="flex gap-2 flex-wrap">
              {TRIP_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setTripType(t.value);
                    if (t.value === 'couple') setPassengers(p => ({ ...p, adults: 2 }));
                    if (t.value === 'solo') setPassengers(p => ({ ...p, adults: 1, children: 0 }));
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                    tripType === t.value
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-200 text-slate-600 hover:border-sky-200'
                  }`}
                >
                  <span>{t.label}</span> {t.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Journey Type</label>
            <div className="flex gap-2">
              {[
                { val: false, label: '→ One Way' },
                { val: true,  label: '⇄ Return' },
              ].map(opt => (
                <button
                  key={String(opt.val)}
                  type="button"
                  onClick={() => setIsReturn(opt.val)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                    isReturn === opt.val
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-200 text-slate-500 hover:border-sky-200'
                  }`}
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="label">Departure Date *</label>
            <input
              type="date"
              min={today}
              value={departureDate}
              onChange={e => setDepartureDate(e.target.value)}
              className="input-field w-full"
            />
          </div>
          {isReturn && (
            <div>
              <label className="label">Return Date *</label>
              <input
                type="date"
                min={departureDate || today}
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
          )}
        </div>

        {/* Row 4: Passengers + Class */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="label">Passengers</label>
            <PassengerSelector value={passengers} onChange={setPassengers} />
          </div>
          <div>
            <label className="label">Cabin Class</label>
            <select className="input-field w-full" value={cabinClass} onChange={e => setCabinClass(e.target.value)}>
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>
        </div>

        {/* Row 5: Budget + Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="label">
              Budget per Person * &nbsp;
              <span className="text-sky-600 font-bold">{currency.symbol} {currency.code}</span>
              <span className="text-slate-400 font-normal text-xs ml-1">(auto-detected · change in navbar)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none">
                {currency.symbol}
              </span>
              <input
                type="number"
                min="1"
                required
                className="input-field pl-8"
                placeholder="e.g. 20000"
                value={budgetAmount}
                onChange={e => setBudgetAmount(e.target.value)}
              />
            </div>
            {/* Live ZAR conversion */}
            {budgetAmount && !isNaN(parseFloat(budgetAmount)) && !isZAR && (
              <p className="text-xs text-slate-400 mt-1">
                ≈ {formatZAR(budgetZAR)} per person · {formatZAR(budgetZAR * totalPax)} total
              </p>
            )}
            {budgetAmount && !isNaN(parseFloat(budgetAmount)) && isZAR && (
              <p className="text-xs text-slate-400 mt-1">
                {formatZAR(parseFloat(budgetAmount) * totalPax)} total for {totalPax} paying passenger{totalPax !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div>
            <label className="label">Duration (days) *</label>
            <select className="input-field w-full" value={duration} onChange={e => setDuration(e.target.value)}>
              {[2,3,4,5,6,7,8,9,10,12,14].map(d => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 6: Trip description */}
        <div className="mb-5">
          <label className="label">What do you want to experience? <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Beach relaxation, great food, snorkelling, avoid touristy spots..."
            rows={2}
            className="input-field resize-none"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {EXAMPLE_PROMPTS.map(p => (
              <button key={p} type="button" onClick={() => setDescription(p)}
                className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-sky-50 hover:text-sky-700 transition-colors">
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 text-white font-bold rounded-xl text-base transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', fontFamily: 'Syne, sans-serif' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Planning your trip...
            </span>
          ) : `✨ Generate My ${isReturn ? 'Return' : 'One-Way'} Trip Plan`}
        </button>
      </div>

      {/* ── Loading state ──────────────────────────────────── */}
      {loading && (
        <div className="card p-10 text-center mb-8">
          <div className="text-5xl mb-6 animate-float">✈</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Claude AI is building your plan...
          </h3>
          <p className="text-sky-600 text-sm font-medium mb-6">{LOADING_STEPS[loadingStep]}</p>
          <div className="w-full max-w-xs mx-auto bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%`,
                background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
              }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-3">Usually takes 10–20 seconds</p>
        </div>
      )}

      {/* ── Plan results ───────────────────────────────────── */}
      {plan && !loading && (
        <div id="plan-results" className="space-y-5 fade-up">

          {/* Plan header */}
          <div className="card overflow-hidden">
            <div className="hero-mesh p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 grid-texture pointer-events-none" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <p className="text-xs text-white/40 tracking-widest uppercase mb-1">
                      {source === 'ai' ? 'Claude AI Generated Plan' : 'Sample Plan'}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold"
                      style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
                      {plan.destination}
                    </h2>
                    <div className="flex flex-wrap gap-3 mt-2 text-white/70 text-sm">
                      <span>{isReturn ? '⇄ Return' : '→ One Way'}</span>
                      <span>·</span>
                      <span>📅 {plan.duration}</span>
                      <span>·</span>
                      <span>👥 {totalPax} passenger{totalPax !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span className="capitalize">💺 {cabinClass}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${
                    source === 'ai'
                      ? 'bg-sky-500/20 border-sky-400/30 text-sky-300'
                      : 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                  }`}>
                    {source === 'ai' ? '✦ Claude AI' : '◎ Sample'}
                  </span>
                </div>

                {/* Cost stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      icon: '💰',
                      label: 'Total Budget',
                      zar: formatZAR(plan.totalBudgetZAR || totalCostZAR),
                      converted: isZAR ? null : formatAmount(plan.totalBudgetZAR || totalCostZAR),
                    },
                    {
                      icon: '👤',
                      label: 'Per Person',
                      zar: formatZAR(plan.perPersonBudgetZAR || Math.round(totalCostZAR / totalPax)),
                      converted: isZAR ? null : formatAmount(plan.perPersonBudgetZAR || Math.round(totalCostZAR / totalPax)),
                    },
                    {
                      icon: '📅',
                      label: 'Departure',
                      zar: plan.departureDateSuggested || departureDate,
                      converted: null,
                    },
                    {
                      icon: isReturn ? '🔄' : '✈',
                      label: isReturn ? 'Return' : 'One Way',
                      zar: isReturn ? (plan.returnDateSuggested || returnDate) : 'No return',
                      converted: null,
                    },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="text-lg mb-0.5">{s.icon}</div>
                      <div className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{s.zar}</div>
                      {s.converted && <div className="text-white/50 text-xs mt-0.5">{s.converted}</div>}
                      <div className="text-white/40 text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100">
              <p className="text-slate-600 leading-relaxed text-sm">{plan.summary}</p>
            </div>
          </div>

          {/* Itinerary */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                📋 Day-by-Day Itinerary
              </h3>
              {totalCostZAR > 0 && (
                <div className="text-right">
                  <div className="text-xs text-slate-400">Estimated total</div>
                  <div className="font-extrabold text-sky-600 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {formatZAR(totalCostZAR)}
                    {!isZAR && <span className="text-slate-400 font-normal ml-1">· {formatAmount(totalCostZAR)}</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {plan.itinerary.map((day) => (
                <div key={day.day} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl ${DAY_COLORS[(day.day - 1) % DAY_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
                      style={{ fontFamily: 'Syne, sans-serif' }}>
                      {day.day}
                    </div>
                  </div>
                  <div className="flex-1 pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                      <h4 className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {day.title}
                      </h4>
                      {day.estimatedCostZAR && (
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                            {formatZAR(day.estimatedCostZAR)}
                          </span>
                          {!isZAR && (
                            <div className="text-xs text-slate-400 mt-0.5 text-right">
                              {formatAmount(day.estimatedCostZAR)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {day.activities.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-sky-400 mt-0.5 flex-shrink-0 font-bold">›</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                    {day.accommodation && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <span>🏨</span> {day.accommodation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalCostZAR > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total for {totalPax} paying passenger{totalPax !== 1 ? 's' : ''}</span>
                  <span className="font-extrabold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {formatZAR(totalCostZAR)}
                  </span>
                </div>
                {!isZAR && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">In {currency.code}</span>
                    <span className="font-bold text-slate-500">{formatAmount(totalCostZAR)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Available flights */}
          {(plan.flights?.length ?? 0) > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                ✈ Matching Flights in Our System
              </h3>
              <div className="space-y-3">
                {plan.flights.map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{f.airline} · {f.flightNumber}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{f.origin?.code} → {f.destination?.code} · {f.duration} · {f.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-sky-600 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {formatZAR(f.price * totalPax)}
                      </p>
                      {!isZAR && <p className="text-xs text-slate-400">{formatAmount(f.price * totalPax)}</p>}
                      <p className="text-xs text-slate-400">{formatZAR(f.price)} × {totalPax} pax</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips + Documents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {(plan.tips?.length ?? 0) > 0 && (
              <div className="card p-5">
                <h3 className="text-base font-bold text-slate-900 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>💡 Travel Tips</h3>
                <ul className="space-y-2.5">
                  {plan.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="text-amber-400 flex-shrink-0 mt-0.5 font-bold">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(plan.requiredDocuments?.length ?? 0) > 0 && (
              <div className="card p-5">
                <h3 className="text-base font-bold text-slate-900 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>📄 Documents Required</h3>
                <ul className="space-y-2.5">
                  {plan.requiredDocuments?.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="text-sky-400 flex-shrink-0 mt-0.5 font-bold">›</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SELECT THIS PLAN CTA */}
          <div className="card p-6 overflow-hidden relative">
            <div className="absolute inset-0 hero-mesh opacity-5 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Love this plan?
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Click below to go to flight search with all your details pre-filled — origin, destination, dates, passengers and class.
                </p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">✓ {originDisplay || originCode} → {destDisplay || destCode}</span>
                  <span className="flex items-center gap-1">✓ {departureDate}{isReturn ? ` → ${returnDate}` : ' (one way)'}</span>
                  <span className="flex items-center gap-1">✓ {totalPax} pax · {cabinClass}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleSelectPlan}
                  className="px-8 py-4 text-white font-extrabold rounded-2xl text-base transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', fontFamily: 'Syne, sans-serif', minWidth: '220px' }}
                >
                  ✈ Select This Plan →
                </button>
                <button
                  onClick={() => { setPlan(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="btn-outline text-sm py-2.5 justify-center"
                >
                  Generate Another Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
