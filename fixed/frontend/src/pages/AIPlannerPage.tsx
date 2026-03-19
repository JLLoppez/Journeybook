import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EXAMPLE_PROMPTS = [
  'Plan a 5-day trip to Zanzibar under R20,000',
  'Weekend getaway to Johannesburg from Cape Town',
  'Romantic 7 days in Dubai, budget R40,000 per couple',
  'Safari adventure in Nairobi, 5 days',
  'Family holiday to London, 10 days',
];

const DAY_COLORS = [
  'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-purple-500', 'bg-pink-500', 'bg-rose-500', 'bg-orange-500',
  'bg-amber-500', 'bg-yellow-500',
];

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  accommodation?: string;
  estimatedCost?: number;
}

interface TravelPlan {
  destination: string;
  duration: string;
  totalBudget: string;
  summary: string;
  itinerary: ItineraryDay[];
  flights: any[];
  tips: string[];
  bestTimeToVisit?: string;
  requiredDocuments?: string[];
}

export default function AIPlannerPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [origin, setOrigin] = useState('CPT');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [source, setSource] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Tell us where you want to go!'); return; }
    if (!isAuthenticated) { toast.error('Please log in to use the AI Planner'); navigate('/login'); return; }
    setLoading(true);
    setPlan(null);
    try {
      const result = await aiService.planTrip(prompt, origin, budget, duration);
      setPlan(result.plan);
      setSource(result.source);
      if (result.warning) toast(result.warning, { icon: '⚠️' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          🤖
        </div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3"
          style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
        >
          AI Travel Planner
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          Describe your dream trip and Claude AI will generate a complete itinerary — day by day, with flights, accommodation, activities and budget.
        </p>
      </div>

      {/* Input card */}
      <div className="card p-6 mb-8">
        <div className="mb-4">
          <label className="label">Describe your trip</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. Plan a 5-day beach holiday in Zanzibar under R20,000. I love snorkelling and local food."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* Quick prompts */}
        <div className="mb-5">
          <p className="text-xs text-slate-400 mb-2 font-medium">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100 hover:bg-sky-100 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="label">Departing From</label>
            <input
              type="text"
              className="input-field"
              placeholder="CPT"
              maxLength={3}
              value={origin}
              onChange={e => setOrigin(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className="label">Budget (ZAR, optional)</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 20000"
              value={budget}
              onChange={e => setBudget(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Duration (days, optional)</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 5"
              min="1"
              max="30"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Planning your trip...
            </span>
          ) : '✨ Generate My Trip Plan'}
        </button>

        {!isAuthenticated && (
          <p className="text-center text-xs text-slate-400 mt-3">
            <button onClick={() => navigate('/login')} className="text-sky-600 font-semibold hover:underline">
              Log in
            </button>{' '}
            to use the AI planner
          </p>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-20">
          <div className="text-5xl mb-5 animate-float">✈</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Planning your perfect trip...
          </h3>
          <p className="text-slate-400 text-sm">Claude AI is crafting your personalised itinerary</p>
          <div className="flex justify-center gap-1.5 mt-6">
            {[0,1,2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {plan && !loading && (
        <div className="space-y-5 fade-up">

          {/* Plan header card */}
          <div className="card overflow-hidden">
            <div className="hero-mesh p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 grid-texture pointer-events-none" />
              <div className="relative flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-white/40 tracking-widest uppercase mb-1">AI Generated Plan</p>
                  <h2
                    className="text-2xl sm:text-3xl font-extrabold"
                    style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
                  >
                    {plan.destination}
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-white/70 text-sm">
                    <span>📅 {plan.duration}</span>
                    <span>💰 {plan.totalBudget}</span>
                    {plan.bestTimeToVisit && <span>🌤 Best: {plan.bestTimeToVisit}</span>}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    source === 'ai'
                      ? 'bg-sky-500/20 border-sky-400/30 text-sky-300'
                      : 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                  }`}
                >
                  {source === 'ai' ? '✦ AI Generated' : '◎ Sample Plan'}
                </span>
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100">
              <p className="text-slate-600 leading-relaxed text-sm">{plan.summary}</p>
            </div>
          </div>

          {/* Itinerary */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
              📋 Day-by-Day Itinerary
            </h3>
            <div className="space-y-5">
              {plan.itinerary.map((day) => (
                <div key={day.day} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${DAY_COLORS[(day.day - 1) % DAY_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
                      style={{ fontFamily: 'Syne, sans-serif' }}
                    >
                      {day.day}
                    </div>
                  </div>
                  <div className="flex-1 pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                      <h4 className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {day.title}
                      </h4>
                      {day.estimatedCost && (
                        <span className="text-xs text-slate-400 whitespace-nowrap font-medium">
                          ~R{day.estimatedCost.toLocaleString()}
                        </span>
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
          </div>

          {/* Available flights */}
          {plan.flights?.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                ✈ Available Flights
              </h3>
              <div className="space-y-3">
                {plan.flights.map((f: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{f.airline} · {f.flightNumber}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{f.origin?.code} → {f.destination?.code} · {f.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-sky-600 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                        R{f.price?.toLocaleString()}
                      </p>
                      <button
                        onClick={() => navigate('/flights')}
                        className="text-xs text-sky-600 hover:underline font-semibold"
                      >
                        Book →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips + Documents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {plan.tips?.length > 0 && (
              <div className="card p-5">
                <h3 className="text-base font-bold text-slate-900 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                  💡 Travel Tips
                </h3>
                <ul className="space-y-2.5">
                  {plan.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="text-amber-400 flex-shrink-0 mt-0.5 font-bold">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.requiredDocuments?.length > 0 && (
              <div className="card p-5">
                <h3 className="text-base font-bold text-slate-900 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                  📄 Documents Required
                </h3>
                <ul className="space-y-2.5">
                  {plan.requiredDocuments.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="text-sky-400 flex-shrink-0 mt-0.5 font-bold">›</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* CTA */}
          <div
            className="card p-6 border-sky-100"
            style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Ready to book?
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">Search available flights for your trip</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setPrompt(''); setPlan(null); }}
                  className="btn-outline text-sm py-2.5"
                >
                  Plan Another
                </button>
                <button
                  onClick={() => navigate('/flights')}
                  className="btn-primary text-sm py-2.5"
                >
                  Search Flights →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
