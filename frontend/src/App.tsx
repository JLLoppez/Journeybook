import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
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
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'DM Sans, sans-serif',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
