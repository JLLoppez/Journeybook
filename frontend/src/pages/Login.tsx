import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plane, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-mesh flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="absolute top-20 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl bg-sky-400 pointer-events-none" />
        <div className="absolute bottom-10 left-5 w-56 h-56 rounded-full opacity-10 blur-3xl bg-indigo-500 pointer-events-none" />

        <div className="relative text-center">
          <div className="mb-8 animate-float flex justify-center"><Plane className="w-16 h-16 text-sky-400" /></div>
          <h2
            className="text-4xl font-extrabold text-white mb-4"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
          >
            Welcome back,<br />traveller
          </h2>
          <p className="text-white/50 max-w-sm text-sm leading-relaxed">
            Log in to access your bookings, manage your trips, and explore new destinations.
          </p>

          <div className="mt-10 flex flex-col gap-3 text-left">
            {['Live flight search via Duffel API', 'AI-powered itinerary planning', 'Full booking management'].map(p => (
              <div key={p} className="flex items-center gap-3 text-white/60 text-sm">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-xs flex-shrink-0">✓</span>
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
              Journey<span className="text-sky-500">Book</span>
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
            Sign in
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            No account?{' '}
            <Link to="/register" className="text-sky-600 font-semibold hover:text-sky-700">Sign up free →</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm px-1"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in...</>
              ) : 'Sign in →'}
            </button>
          </form>

          {/* Demo account hint */}
          <div className="mt-6 p-4 bg-sky-50 rounded-2xl border border-sky-100">
            <p className="text-xs font-bold text-sky-700 mb-1">Demo account</p>
            <p className="text-xs text-sky-600 font-mono">demo@journeybook.com / demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
