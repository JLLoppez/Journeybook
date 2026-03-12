import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';
  const dark = isHome;

  const navStyle = dark
    ? { background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }
    : {};
  const navClass = `sticky top-0 z-50 transition-all duration-300 ${dark ? '' : 'bg-white border-b border-slate-100 shadow-sm'}`;

  const linkClass = dark ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-sky-600';
  const textClass = dark ? 'text-white' : 'text-slate-800';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={navClass} style={navStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white text-base">✈</span>
            </div>
            <span className={`text-xl font-bold tracking-tight ${textClass}`} style={{ fontFamily: 'Syne, sans-serif' }}>
              Journey<span className="text-sky-500">Book</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/flights" className={`text-sm font-semibold tracking-wide transition-colors ${linkClass}`} style={{ fontFamily: 'Syne, sans-serif' }}>
              Flights
            </Link>
            <Link to="/planner" className={`text-sm font-semibold tracking-wide transition-colors flex items-center gap-1 ${linkClass}`} style={{ fontFamily: 'Syne, sans-serif' }}>
              ✨ AI Planner
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={`text-sm font-semibold transition-colors ${linkClass}`} style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</Link>
                <div className={`text-sm ${dark ? 'text-white/60' : 'text-slate-400'}`}>
                  Hi, <span className={`font-semibold ${textClass}`}>{user?.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`text-sm font-semibold transition-colors ${linkClass}`} style={{ fontFamily: 'Syne, sans-serif' }}>Login</Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-bold rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-all shadow-md hover:shadow-sky-500/20 hover:-translate-y-0.5"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className={`md:hidden p-2 rounded-lg ${dark ? 'text-white' : 'text-slate-700'}`} onClick={() => setMenuOpen(!menuOpen)}>
            <div className="space-y-1.5">
              <div className="w-5 h-0.5 bg-current" />
              <div className="w-5 h-0.5 bg-current" />
              <div className="w-5 h-0.5 bg-current" />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={`md:hidden pb-4 border-t ${dark ? 'border-white/10' : 'border-slate-100'}`}>
            <div className="pt-3 flex flex-col gap-1">
              {[
                { to: '/flights', label: 'Flights' },
                { to: '/planner', label: '✨ AI Planner' },
                ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
              ].map(({ to, label }) => (
                <Link key={to} to={to} className={`py-2 px-3 rounded-lg text-sm font-semibold ${dark ? 'text-white/80 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="py-2 px-3 text-left text-sm font-semibold text-red-500">Logout</button>
              ) : (
                <>
                  <Link to="/login" className={`py-2 px-3 rounded-lg text-sm font-semibold ${dark ? 'text-white/80' : 'text-slate-600'}`} onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="py-2 px-3 rounded-xl text-sm font-bold bg-sky-500 text-white" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
