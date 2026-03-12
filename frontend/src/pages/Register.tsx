import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
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
      <div className="hidden lg:flex lg:w-1/2 hero-bg flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-sky-400/10 blur-2xl" />
        <div className="absolute bottom-10 left-5 w-56 h-56 rounded-full bg-blue-300/10 blur-3xl" />
        <div className="relative text-center">
          <div className="text-6xl mb-6 animate-float">🌍</div>
          <h2 className="text-4xl font-extrabold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Your journey<br />starts here
          </h2>
          <p className="text-white/60 max-w-sm">
            Create your free account and start booking flights to hundreds of destinations worldwide.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-left">
            {['Free to join, no hidden fees', 'Instant booking confirmation', 'Manage all trips in one place'].map(p => (
              <div key={p} className="flex items-center gap-2 text-white/70 text-sm">
                <span className="text-sky-400">✓</span> {p}
              </div>
            ))}
          </div>
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
            <h1 className="text-3xl font-extrabold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>Create account</h1>
            <p className="text-slate-500 mt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-600 font-semibold hover:text-sky-700">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Jose Alves"
                value={name}
                onChange={e => setName(e.target.value)}
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
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2"
            >
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-400 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
