import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
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
        <div className="absolute bottom-10 left-5 w-64 h-64 rounded-full opacity-10 blur-3xl bg-indigo-500 pointer-events-none" />

        <div className="relative text-center">
          <div className="text-6xl mb-8 animate-float">🌍</div>
          <h2
            className="text-4xl font-extrabold text-white mb-4"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
          >
            Your journey<br />starts here
          </h2>
          <p className="text-white/50 max-w-sm text-sm leading-relaxed">
            Create your free account and start booking flights to hundreds of destinations worldwide.
          </p>

          <div className="mt-10 flex flex-col gap-3 text-left">
            {['Free to join — no hidden fees', 'Instant booking confirmation', 'AI trip planner included'].map(p => (
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
              <span className="text-white">✈</span>
            </div>
            <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
              Journey<span className="text-sky-500">Book</span>
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
            Create account
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Already have one?{' '}
            <Link to="/login" className="text-sky-600 font-semibold hover:text-sky-700">Sign in →</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Jose Lopes"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

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
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm px-1"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-semibold ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                className={`input-field ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:ring-red-400/50 focus:border-red-400' : ''}`}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!!confirmPassword && confirmPassword !== password)}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating account...</>
              ) : 'Create account →'}
            </button>
          </form>

          <p className="mt-5 text-xs text-slate-400 text-center">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
