import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from '../router';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'Gold';

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', plan: initialPlan,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all fields.'); setLoading(false); return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.'); setLoading(false); return;
    }

    try {
      await signUp(formData.email, formData.password, formData.name, formData.phone, formData.plan);
      navigate(`/payment?plan=${formData.plan}`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('This email is already registered.');
      else setError('Failed to create account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#042A1d] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-inter">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#74E61F]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#105D3D]/30 rounded-full blur-[120px] pointer-events-none" />

      <Link to="/" className="absolute top-6 left-6 flex items-center space-x-2 text-slate-400 hover:text-[#74E61F] transition-colors text-sm font-semibold z-10">
        <ArrowLeft className="w-4 h-4" /><span>Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-lg glassmorphism-dark rounded-[32px] p-8 md:p-10 shadow-2xl relative z-10 border border-white/10"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <img src="/stoshi_logo.png" alt="Stoshi" className="h-12 w-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-extrabold font-sora text-[#74E61F] tracking-tight">Create Your Account</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Join the green energy revolution today</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs font-semibold">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Vijay Kumar"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors" required />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="vijay@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors" required />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors" required />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Plan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Plan</label>
            <select name="plan" value={formData.plan} onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors appearance-none cursor-pointer">
              <option value="Silver" className="bg-[#042A1d]">Silver Plan (₹7,500)</option>
              <option value="Gold"   className="bg-[#042A1d]">Gold Plan   (₹15,000)</option>
              <option value="Platinum" className="bg-[#042A1d]">Platinum Plan (₹30,000)</option>
            </select>
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#74E61F] text-[#042A1d] font-sora font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center text-sm">
            {loading
              ? <div className="w-5 h-5 border-2 border-[#042A1d] border-t-transparent rounded-full animate-spin" />
              : 'Proceed to Payment'}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-slate-400 text-sm font-medium">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#74E61F] hover:underline font-bold">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
