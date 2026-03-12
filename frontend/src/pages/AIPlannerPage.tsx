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

const dayColors = ['bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500'];

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
    if (!isAuthenticated) { toast.error('Please login to use AI Planner'); navigate('/login'); return; }
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
          🤖
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
          AI Travel Planner
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Describe your dream trip and our AI will generate a complete itinerary — day by day, with flights, hotels, activities and budget.
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
          <div className="text-xs text-slate-400 mb-2">Try an example:</div>
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

        {/* Options row */}
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
              min="1" max="30"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full justify-center py-3.5 text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2"><span className="animate-spin text-lg">⟳</span> Planning your trip...</span>
          ) : (
            '✨ Generate My Trip Plan'
          )}
        </button>

        {!isAuthenticated && (
          <p className="text-center text-xs text-slate-400 mt-3">
            <button onClick={() => navigate('/login')} className="text-sky-600 font-semibold hover:underline">Login</button> to use the AI planner
          </p>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 animate-float">✈</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Planning your perfect trip...
          </h3>
          <p className="text-slate-400 text-sm">Our AI is crafting your personalised itinerary</p>
        </div>
      )}

      {/* Results */}
      {plan && !loading && (
        <div className="space-y-6 fade-up">
          {/* Plan header */}
          <div className="card overflow-hidden">
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)' }} className="p-6 text-white">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs text-white/50 tracking-widest uppercase mb-1">AI Generated Plan</div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>{plan.destination}</h2>
                  <div className="flex items-center gap-4 mt-2 text-white/80 text-sm flex-wrap">
                    <span>📅 {plan.duration}</span>
                    <span>💰 {plan.totalBudget}</span>
                    {plan.bestTimeToVisit && <span>🌤 Best: {plan.bestTimeToVisit}</span>}
                  </div>
                </div>
                {source === 'demo' && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                    Sample Plan
                  </span>
                )}
                {source === 'ai' && (
                  <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold">
                    AI Generated
                  </span>
                )}
              </div>
            </div>
            <div className="p-5 bg-slate-50">
              <p className="text-slate-600 leading-relaxed">{plan.summary}</p>
            </div>
          </div>

          {/* Itinerary */}
          <div className="card p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
              📋 Day-by-Day Itinerary
            </h3>
            <div className="space-y-4">
              {plan.itinerary.map((day) => (
                <div key={day.day} className="flex gap-4">
                  {/* Day badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl ${dayColors[(day.day - 1) % dayColors.length]} flex items-center justify-center text-white font-bold text-sm`} style={{ fontFamily: 'Syne, sans-serif' }}>
                      {day.day}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{day.title}</h4>
                      {day.estimatedCost && (
                        <span className="text-xs text-slate-400 whitespace-nowrap">~R{day.estimatedCost.toLocaleString()}</span>
                      )}
                    </div>
                    <ul className="mt-2 space-y-1">
                      {day.activities.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-sky-400 mt-0.5 flex-shrink-0">›</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                    {day.accommodation && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <span>🏨</span> {day.accommodation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available flights from our system */}
          {plan.flights && plan.flights.length > 0 && (
            <div className="card p-5">
              <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                ✈ Available Flights
              </h3>
              <div className="space-y-3">
                {plan.flights.map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{f.airline} · {f.flightNumber}</div>
                      <div className="text-xs text-slate-500">{f.origin?.code} → {f.destination?.code} · {f.duration}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sky-600" style={{ fontFamily: 'Syne, sans-serif' }}>R{f.price?.toLocaleString()}</div>
                      <button
                        onClick={() => navigate('/flights')}
                        className="text-xs text-sky-600 hover:underline"
                      >
                        Book →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two columns: tips + docs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tips */}
            {plan.tips && plan.tips.length > 0 && (
              <div className="card p-5">
                <h3 className="text-base font-bold text-slate-800 mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                  💡 Travel Tips
                </h3>
                <ul className="space-y-2">
                  {plan.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-amber-400 flex-shrink-0 mt-0.5">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required docs */}
            {plan.requiredDocuments && plan.requiredDocuments.length > 0 && (
              <div className="card p-5">
                <h3 className="text-base font-bold text-slate-800 mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                  📄 Documents Required
                </h3>
                <ul className="space-y-2">
                  {plan.requiredDocuments.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-sky-400 flex-shrink-0 mt-0.5">›</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="card p-6 bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>Ready to book?</h3>
                <p className="text-slate-500 text-sm">Search available flights for your trip</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setPrompt(''); setPlan(null); }}
                  className="btn-outline text-sm"
                >
                  Plan Another
                </button>
                <button
                  onClick={() => navigate('/flights')}
                  className="btn-primary text-sm"
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
