import React from 'react';
import { Router, Routes, Route } from './router';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Payment from './pages/Payment';
import UserDashboard from './pages/UserDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/"        element={<Home />} />
          <Route path="/signup"  element={<SignUp />} />
          <Route path="/signin"  element={<SignIn />} />

          {/* Admin login portal — standalone, no auth guard */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Protected: payment (must be logged in) */}
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          {/* Protected: user dashboard (must be logged in + paid) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireActive={true}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected: admin dashboard (must be admin role) */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
