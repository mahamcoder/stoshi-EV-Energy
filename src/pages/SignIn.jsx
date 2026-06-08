import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from '../router';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { db, doc, getDoc } from '../firebase';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminFlow = searchParams.get('from') === 'admin';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signIn(formData.email, formData.password);
      const user = userCredential.user;

      // Check user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role === 'admin') {
          navigate('/admin');
        } else if (data.paymentStatus === 'Paid') {
          navigate('/dashboard');
        } else {
          navigate('/payment');
        }
      } else {
        // Fallback: If no Firestore doc exists, send to home
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else {
        setError('Failed to sign in: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to pre-fill developer testing accounts
  const fillTestCredentials = (role) => {
    if (role === 'admin') {
      setFormData({
        email: 'admin@stoshi.com',
        password: 'adminpassword'
      });
    } else {
      setFormData({
        email: 'user@stoshi.com',
        password: 'userpassword'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#042A1d] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-inter">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#74E61F]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#105D3D]/30 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-slate-400 hover:text-[#74E61F] transition-colors text-sm font-semibold z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glassmorphism-dark rounded-[32px] p-8 md:p-10 shadow-2xl relative z-10 border border-white/10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <img src="/stoshi_logo.png" alt="Stoshi Logo" className="h-12 w-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-extrabold font-sora text-[#74E61F] tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1.5 font-medium">
            Sign in to access your Green Energy Dashboard
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs font-semibold"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vijay.kumar@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#74E61F] text-[#042A1d] font-sora font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center space-x-2 text-xs md:text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#042A1d] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Sign In</span>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-slate-400 text-xs md:text-sm font-medium">
          Don't have an account yet?{" "}
          <Link to="/signup" className="text-[#74E61F] hover:underline font-bold">
            Sign Up
          </Link>
        </div>

        {/* Quick Test Accounts Banner */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Testing Shortcuts
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => fillTestCredentials('user')}
              className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-[#74E61F] text-[11px] font-bold transition-all bg-[#0B3022]/30 cursor-pointer text-slate-300"
            >
              Test User
            </button>
            {isAdminFlow && (
              <button
                onClick={() => fillTestCredentials('admin')}
                className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-[#74E61F] text-[11px] font-bold transition-all bg-[#0B3022]/30 cursor-pointer text-[#74E61F]"
              >
                Test Admin
              </button>
            )}
          </div>
          {isAdminFlow && (
            <p className="text-[9px] text-slate-500 mt-2">
              Tip: Registering an email like <span className="font-semibold text-slate-300">admin@stoshi.com</span> automatically grants admin status.
            </p>
          )}
        </div>

      </motion.div>
    </div>
  );
}
