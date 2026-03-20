import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </div>
              <span className="text-white text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                Journey<span className="text-sky-400">Book</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              Search and book flights to hundreds of destinations worldwide. Built for South African travellers.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-widest uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>
              Navigate
            </h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/" className="hover:text-sky-400 transition-colors">Home</Link>
              <Link to="/flights" className="hover:text-sky-400 transition-colors">Search Flights</Link>
              <Link to="/planner" className="hover:text-sky-400 transition-colors">AI Trip Planner</Link>
              <Link to="/dashboard" className="hover:text-sky-400 transition-colors">My Dashboard</Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-widest uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>
              Account
            </h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/login" className="hover:text-sky-400 transition-colors">Login</Link>
              <Link to="/register" className="hover:text-sky-400 transition-colors">Create Account</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-widest uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>
              Contact
            </h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <a href="mailto:hello@journeybook.co.za" className="hover:text-sky-400 transition-colors">
                hello@journeybook.co.za
              </a>
              <span className="text-slate-500 text-xs mt-1">Cape Town, South Africa</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} JourneyBook · All Rights Reserved · Built by <span className="text-slate-400 font-semibold"><a href="https://jallopes.vercel.app" target="_blank" rel="noopener noreferrer">Jall Technologies</a></span></span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
