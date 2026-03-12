import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
                <span className="text-white text-sm">✈</span>
              </div>
              <span className="text-white text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                Journey<span className="text-sky-400">Book</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Travel booking made simple. Find the best flights at the best prices.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-widest uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>Navigation</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/" className="hover:text-sky-400 transition-colors">Home</Link>
              <Link to="/flights" className="hover:text-sky-400 transition-colors">Search Flights</Link>
              <Link to="/login" className="hover:text-sky-400 transition-colors">Login</Link>
              <Link to="/register" className="hover:text-sky-400 transition-colors">Sign Up</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-widest uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>Support</h4>
            <div className="flex flex-col gap-2 text-sm">
              <span>help@journeybook.com</span>
              <span>+1 (800) 555-0199</span>
              <span className="text-slate-500 text-xs mt-2">Mon–Fri, 9am–6pm</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} JourneyBook. All rights reserved.</span>
          <span>Built with ❤️ for travellers everywhere</span>
        </div>
      </div>
    </footer>
  );
}
