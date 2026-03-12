import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-bg flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-sky-400/10 blur-2xl" />
        <div className="absolute bottom-10 left-5 w-56 h-56 rounded-full bg-blue-300/10 blur-3xl" />
        <div className="relative text-center">
          <div className="text-6xl mb-6 animate-float">✈️</div>
          <h2 className="text-4xl font-extrabold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Welcome<br />back, traveller
          </h2>
          <p className="text-white/60 max-w-sm">
            Log in to access your bookings, manage your trips, and discover new destinations.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                <span className="text-white text-sm">✈</span>
              </div>
              <span className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
                Journey<span className="text-sky-500">Book</span>
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>Sign in</h1>
            <p className="text-slate-500 mt-2">
              Don't have an account?{' '}
              <Link to="/register" className="text-sky-600 font-semibold hover:text-sky-700">Sign up free</Link>
            </p>
          </div>

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
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-sky-50 rounded-xl border border-sky-100 text-sm text-sky-700">
            <strong>Demo account:</strong> demo@journeybook.com / demo123
          </div>
        </div>
      </div>
    </div>
  );
}
