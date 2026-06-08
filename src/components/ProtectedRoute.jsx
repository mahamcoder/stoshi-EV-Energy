import React from 'react';
import { Navigate } from '../router';
import { useAuth } from '../context/AuthContext';

/** Requires user to be logged in. If requireActive, also requires Paid status. */
export function ProtectedRoute({ children, requireActive = false }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <Loader text="Verifying session…" />;
  if (!currentUser) return <Navigate to="/signin" replace />;

  if (requireActive && userData?.role !== 'admin' && userData?.paymentStatus !== 'Paid') {
    if (!userData?.membershipType) return <Navigate to="/" replace />;
    return <Navigate to="/payment" replace />;
  }

  return children;
}

/** Requires user to be logged in AND have role === 'admin'. */
export function AdminRoute({ children }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <Loader text="Verifying admin privileges…" />;
  if (!currentUser) return <Navigate to="/admin" replace />;
  if (userData?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}

function Loader({ text }) {
  return (
    <div className="min-h-screen bg-[#042A1d] flex flex-col items-center justify-center text-[#74E61F] font-sora">
      <div className="w-12 h-12 border-4 border-[#74E61F]/20 border-t-[#74E61F] rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold tracking-wider">{text}</p>
    </div>
  );
}
