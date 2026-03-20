import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CurrencySelector from './CurrencySelector';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  // Track scroll for navbar transition on home page
  useEffect(() => {
    if (!isHome) return;
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [isHome]);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const dark = isHome && !scrolled;

  const navBg = dark
    ? 'bg-transparent'
    : 'bg-white/90 border-b border-slate-100 shadow-sm';

  const backdropStyle = dark
    ? { backdropFilter: 'blur(12px)', background: scrolled ? 'rgba(8,13,26,0.85)' : 'transparent' }
    : {};

  const linkBase = `text-sm font-semibold transition-colors duration-150`;
  const linkActive = dark ? 'text-white' : 'text-sky-600';
  const linkInactive = dark ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-sky-600';

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${navBg}`}
      style={backdropStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white text-base">✈</span>
            </div>
            <span
              className={`text-xl font-bold tracking-tight transition-colors duration-150 ${dark ? 'text-white' : 'text-slate-900'}`}
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Journey<span className="text-sky-500">Book</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/flights"
              className={`px-3 py-2 rounded-lg ${linkBase} ${isActive('/flights') ? linkActive : linkInactive}`}
            >
              Flights
            </Link>
            <Link
              to="/planner"
              className={`px-3 py-2 rounded-lg ${linkBase} ${isActive('/planner') ? linkActive : linkInactive} flex items-center gap-1`}
            >
              <span className="text-xs">✨</span> AI Planner
            </Link>

            <div className="w-px h-5 bg-current opacity-10 mx-2" />

            <CurrencySelector />

            <div className="w-px h-5 bg-current opacity-10 mx-2" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg ${linkBase} ${isActive('/dashboard') ? linkActive : linkInactive}`}
                >
                  Dashboard
                </Link>
                <div className={`text-sm ml-1 ${dark ? 'text-white/50' : 'text-slate-400'}`}>
                  Hi, <span className={`font-bold ${dark ? 'text-white' : 'text-slate-700'}`}>{user?.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 text-sm font-semibold rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/15 transition-colors"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-lg ${linkBase} ${linkInactive}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-2 px-5 py-2 text-sm font-bold rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-all shadow-md hover:shadow-sky-500/20"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${dark ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className={`md:hidden pb-4 border-t slide-down ${dark ? 'border-white/10' : 'border-slate-100'}`}
          >
            <div className="pt-3 flex flex-col gap-0.5">
              {[
                { to: '/flights', label: 'Flights' },
                { to: '/planner', label: '✨ AI Planner' },
                ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(to)
                      ? dark ? 'bg-white/10 text-white' : 'bg-sky-50 text-sky-700'
                      : dark ? 'text-white/80 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              <div className={`my-2 h-px ${dark ? 'bg-white/10' : 'bg-slate-100'}`} />

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="py-2.5 px-3 text-left text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${dark ? 'text-white/80 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="mt-1 py-2.5 px-3 rounded-xl text-sm font-bold bg-sky-500 text-white text-center hover:bg-sky-400 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up →
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
