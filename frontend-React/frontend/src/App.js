import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TripSearch from './pages/TripSearch';
import SeatSelection from './pages/SeatSelection';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import BusManagement from './pages/BusManagement';
import RouteManagement from './pages/RouteManagement';
import TripManagement from './pages/TripManagement';
import Reports from './pages/Reports';
import Ticket from './pages/Ticket';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  const normalizeRole = (role) => {
    if (!role) return '';
    const upper = String(role).toUpperCase();
    const stripped = upper.startsWith('ROLE_') ? upper.slice(5) : upper;
    if (stripped === 'USER') return 'CUSTOMER';
    return stripped;
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = normalizeRole(user?.role);
    const allowed = allowedRoles.map(normalizeRole);
    if (!allowed.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="App">
      <Navbar />
      <main className="container-fluid p-0">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          } />
          <Route path="/search" element={<TripSearch />} />
          
          {/* Customer Routes */}
          <Route path="/seats/:tripId" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <SeatSelection />
            </ProtectedRoute>
          } />
          <Route path="/booking/:tripId" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Booking />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path="/tickets/:bookingId" element={
            <ProtectedRoute allowedRoles={['CUSTOMER','ADMIN']}>
              <Ticket />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/buses" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <BusManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/routes" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <RouteManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/trips" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TripManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Reports />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

// App Component with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
