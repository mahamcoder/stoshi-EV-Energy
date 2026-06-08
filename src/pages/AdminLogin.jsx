import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from '../router';
import { useAuth } from '../context/AuthContext';
import { db, doc, getDoc } from '../firebase';

export default function AdminLogin() {
  const { currentUser, userData, signIn, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as admin, go straight to dashboard
  useEffect(() => {
    if (!loading && currentUser && userData?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [loading, currentUser, userData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setSubmitting(false);
      return;
    }

    try {
      const credential = await signIn(email, password);
      const user = credential.user;

      // Verify admin role in Firestore
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (!userSnap.exists()) {
        setError('No account found. Please register first.');
        setSubmitting(false);
        return;
      }

      const data = userSnap.data();
      if (data.role !== 'admin') {
        setError('Access denied. This portal is restricted to administrators only.');
        setSubmitting(false);
        return;
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Incorrect email or password.');
      } else {
        setError('Sign in failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060D0B] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#74E61F]/20 border-t-[#74E61F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060D0B] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden font-inter">
      {/* Background glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] bg-red-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] bg-[#74E61F]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(116,230,31,1) 1px, transparent 1px), linear-gradient(90deg, rgba(116,230,31,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-5">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-extrabold font-sora text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="text-slate-500 text-xs font-semibold mt-2 tracking-wide">
            STOSHI GREEN ENERGY — RESTRICTED ACCESS
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0C1A14]/80 border border-white/8 rounded-[28px] p-8 backdrop-blur-sm shadow-2xl shadow-black/40">

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start space-x-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stoshi.com"
                  autoComplete="email"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0B2C21]/60 border border-white/8 focus:border-[#74E61F]/50 focus:outline-none text-sm font-medium text-white placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#0B2C21]/60 border border-white/8 focus:border-[#74E61F]/50 focus:outline-none text-sm font-medium text-white placeholder-slate-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-4 rounded-2xl bg-[#74E61F] text-[#042A1d] font-sora font-extrabold uppercase tracking-wider hover:bg-white transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center space-x-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#042A1d] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Access Admin Dashboard</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-[10px] text-slate-600 font-semibold">
            This portal is restricted to authorized administrators only.
            <br />
            Unauthorized access attempts are logged.
          </p>
        </div>

        {/* Back link */}
        <p className="text-center mt-6 text-xs text-slate-600 font-semibold">
          Not an admin?{' '}
          <a
            href="/"
            className="text-[#74E61F] hover:underline font-bold"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
          >
            Return to Homepage
          </a>
        </p>
      </motion.div>
    </div>
  );
}
