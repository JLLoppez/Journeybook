import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, type ReactNode } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import FlightSearch from './pages/FlightSearch';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingDetails from './pages/BookingDetails';
import AIPlannerPage from './pages/AIPlannerPage';
import ProtectedRoute from './components/ProtectedRoute';

function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  return <div key={location.pathname}>{children}</div>;
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <RouteTransition>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/flights" element={<FlightSearch />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/planner" element={
                    <ProtectedRoute><AIPlannerPage /></ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                  } />
                  <Route path="/bookings/:id" element={
                    <ProtectedRoute><BookingDetails /></ProtectedRoute>
                  } />
                </Routes>
              </RouteTransition>
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  fontFamily: 'DM Sans, sans-serif',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  boxShadow: '0 8px 32px -8px rgba(0,0,0,0.12)',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </div>
        </BrowserRouter>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
