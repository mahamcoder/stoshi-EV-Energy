import React, { useState, useEffect } from 'react';
import { useNavigate } from '../router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  db,
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  updateDoc 
} from '../firebase';
import { 
  LayoutDashboard, User, Compass, Award, History, Bell, LogOut, 
  Menu, X, Check, Info, Gift, Wallet, Leaf, Shield, ChevronRight, 
  Download, ArrowUpRight, Phone, Mail, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UserDashboard() {
  const { currentUser, userData, signOut, updateProfileData } = useAuth();
  const navigate = useNavigate();

  // Navigation / Tab state
  const [activeTab, setActiveTab] = useState('overview'); // overview, profile, progress, plan, payments, notifications
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileStatus, setProfileStatus] = useState({ success: false, error: '' });

  // Payment History State
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  // Firestore live project stats
  const [projectData, setProjectData] = useState({
    totalCapacity: 1500000,
    collectedAmount: 975000,
    totalMembers: 127
  });

  // Load User Data into Form when tab changes to profile
  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name || '',
        phone: userData.phone || ''
      });
    }
  }, [userData, activeTab]);

  // Listen to live Project metrics
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'project', 'sonbhadra-ev-1'), (docSnap) => {
      if (docSnap.exists()) {
        setProjectData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Payment history for this user
  useEffect(() => {
    if (!currentUser) return;
    
    // We fetch using a standard query.
    // If indices are still building, we query directly and sort client-side.
    const fetchPayments = async () => {
      try {
        const q = query(
          collection(db, 'payments'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const paymentsList = [];
        querySnapshot.forEach((doc) => {
          paymentsList.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by date descending
        paymentsList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPayments(paymentsList);
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPayments();
  }, [currentUser, activeTab]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus({ success: false, error: '' });

    if (!profileForm.name || !profileForm.phone) {
      setProfileStatus({ success: false, error: 'All fields are required.' });
      return;
    }

    try {
      await updateProfileData(profileForm.name, profileForm.phone);
      setProfileStatus({ success: true, error: '' });
      
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#74E61F', '#22C55E']
      });

      setTimeout(() => setProfileStatus((prev) => ({ ...prev, success: false })), 3000);
    } catch (err) {
      console.error(err);
      setProfileStatus({ success: false, error: 'Failed to update profile: ' + err.message });
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Formatting helper
  const formatRupee = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Plan Details Helper
  const getPlanDetails = (planType) => {
    const plans = {
      Silver: {
        price: 7500,
        poolShare: '0.25%',
        rewards: '₹12,500 Limit',
        badge: 'Silver Member',
        badgeClass: 'bg-slate-400/20 text-slate-300 border-slate-500/20',
        cardBg: 'from-slate-700 to-slate-900',
        benefits: [
          'EV Community Forum Access',
          'Monthly Infrastructure Logs',
          'Digital Certificate of Participation',
          'Standard Waitlist Priority'
        ]
      },
      Gold: {
        price: 15000,
        poolShare: '1.00%',
        rewards: '₹48,500 Limit',
        badge: 'Pioneer Member',
        badgeClass: 'bg-brand-parrot/20 text-brand-parrot border-brand-parrot/20',
        cardBg: 'from-emerald-950 to-brand-dark',
        benefits: [
          'Priority charging nodes access',
          'Bi-monthly physical impact reports',
          'Green Infrastructure Badge',
          'Invitations to annual energy summits',
          '2x Priority for next project cycles'
        ]
      },
      Platinum: {
        price: 30000,
        poolShare: '2.50%',
        rewards: '₹1,25,000 Limit',
        badge: 'Elite Partner',
        badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
        cardBg: 'from-slate-900 via-cyan-950 to-brand-dark border-cyan-500/10',
        benefits: [
          'VIP access to charging node inaugurations',
          'Co-owner voting rights on future locations',
          'Special plaque at Sonbhadra node',
          'Lifetime waiver of standard processing fees',
          'Guaranteed placement in future waitlists'
        ]
      }
    };

    return plans[planType] || plans.Gold;
  };

  const currentPlan = userData?.membershipType || 'Gold';
  const planInfo = getPlanDetails(currentPlan);

  // Project progress math
  const target = projectData.totalCapacity || 1500000;
  const collected = projectData.collectedAmount || 975000;
  const percent = Math.min(Math.round((collected / target) * 100), 100);
  const remaining = Math.max(target - collected, 0);

  // Sidebar Menu Items
  const menuItems = [
    { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', name: 'My Profile', icon: User },
    { id: 'progress', name: 'Project Progress', icon: Compass },
    { id: 'plan', name: 'My Membership', icon: Award },
    { id: 'payments', name: 'Payment History', icon: History },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-[#021811] text-[#E2E8F0] flex font-inter">
      {/* ── BACKGROUND GLOWS ────────────────────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#74E61F]/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-[20%] w-[50%] h-[50%] bg-[#105D3D]/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* ── MOBILE MENU TRIGGER ──────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 bg-[#042A1d] border border-white/10 rounded-2xl text-[#74E61F] cursor-pointer shadow-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── SIDEBAR DRAWER ───────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#041E15]/95 backdrop-blur-md border-r border-white/5 p-6 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/stoshi_logo.png" alt="Stoshi" className="h-12 w-auto" />
            <div>
              <span className="text-sm font-extrabold font-sora block tracking-tight text-white">STOSHI</span>
              <span className="text-[10px] font-extrabold text-[#74E61F] tracking-widest block uppercase">Green Energy</span>
            </div>
          </div>

          {/* Profile Short Box */}
          <div className="flex items-center space-x-3 p-4 bg-[#0B2C21]/60 rounded-2xl border border-white/5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#105D3D] text-[#74E61F] flex items-center justify-center font-bold text-sm font-sora shadow-inner">
                {userData?.name ? userData.name.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#041E15] rounded-full"></span>
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">{userData?.name || 'User Name'}</span>
              <span className={`px-2 py-0.5 mt-1 rounded text-[9px] font-extrabold font-sora uppercase border inline-block ${planInfo.badgeClass}`}>
                {planInfo.badge}
              </span>
            </div>
          </div>

          {/* Menu Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 rounded-2xl flex items-center space-x-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'bg-[#74E61F]/15 border border-[#74E61F]/20 text-[#74E61F] font-extrabold' 
                      : 'text-slate-400 hover:text-white hover:bg-[#07241A]/50 border border-transparent'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Section */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-white rounded-2xl flex items-center space-x-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto z-10 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* ──────── TABS: OVERVIEW ──────── */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Dashboard Welcome Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#042A1d]/50 p-6 rounded-[32px] border border-white/5 backdrop-blur-sm">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold font-sora text-white flex items-center">
                      <span>Welcome back, {userData?.name || 'Partner'}</span>
                      <Check className="w-5 h-5 text-emerald-400 ml-2 border border-emerald-400/20 rounded-full bg-emerald-500/10 p-0.5 shrink-0" />
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      Member ID: STS-{currentUser?.uid.slice(0, 8).toUpperCase()} • Joined on {userData?.joinDate ? new Date(userData.joinDate).toLocaleDateString('en-IN', {year: 'numeric', month: 'short', day: 'numeric'}) : 'N/A'}
                    </p>
                  </div>

                  {/* Active Project Highlight */}
                  <div className="mt-4 md:mt-0 px-4 py-3 bg-[#0B2C21] rounded-2xl border border-white/5 flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 bg-[#74E61F] rounded-full animate-pulse"></div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Project</span>
                      <span className="text-xs font-bold text-white">Sonbhadra EV-1 (Operational)</span>
                    </div>
                  </div>
                </div>

                {/* 4 Dashboard Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Reward Pool Stat */}
                  <div className="p-6 bg-[#042118]/80 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/10">
                      <Gift className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Reward Pool Limit
                    </span>
                    <div className="text-2xl font-extrabold font-sora text-white">
                      {planInfo.rewards}
                    </div>
                    <p className="text-[10px] text-cyan-400 mt-2 font-semibold flex items-center">
                      <span>Total Reward Cap</span>
                    </p>
                  </div>

                  {/* Share Stat */}
                  <div className="p-6 bg-[#042118]/80 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="w-10 h-10 rounded-2xl bg-[#74E61F]/10 flex items-center justify-center text-[#74E61F] mb-4 border border-[#74E61F]/10">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      My Pool Share
                    </span>
                    <div className="text-2xl font-extrabold font-sora text-white">
                      {planInfo.poolShare}
                    </div>
                    <p className="text-[10px] text-[#74E61F] mt-2 font-semibold">
                      Based on {currentPlan} Tier
                    </p>
                  </div>

                  {/* Membership Status */}
                  <div className="p-6 bg-[#042118]/80 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/10">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Membership Status
                    </span>
                    <div className="text-2xl font-extrabold font-sora text-white capitalize">
                      {userData?.membershipStatus || 'Pending'}
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-2 font-semibold">
                      Account status is Active
                    </p>
                  </div>

                  {/* Payment Status */}
                  <div className="p-6 bg-[#042118]/80 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 border border-amber-500/10">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Payment Status
                    </span>
                    <div className="text-2xl font-extrabold font-sora text-white">
                      {userData?.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'}
                    </div>
                    <p className="text-[10px] text-amber-400 mt-2 font-semibold">
                      Fees: {formatRupee(planInfo.price)} paid
                    </p>
                  </div>
                </div>

                {/* Dashboard layout lower sections */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Live Progress Circle Quick Widget */}
                  <div className="lg:col-span-8 bg-[#042118]/40 border border-white/5 rounded-[32px] p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-bold font-sora text-white">
                        Live Project Funding Tracker
                      </h3>
                      <button 
                        onClick={() => setActiveTab('progress')}
                        className="text-xs font-bold text-[#74E61F] hover:underline flex items-center space-x-1"
                      >
                        <span>View Progress</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4 flex justify-center">
                        <div className="relative w-36 h-36">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle 
                              cx="72" cy="72" r="62" 
                              stroke="rgba(255,255,255,0.03)" 
                              strokeWidth="8" 
                              fill="transparent" 
                            />
                            <circle 
                              cx="72" cy="72" r="62" 
                              stroke="#74E61F" 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray={2 * Math.PI * 62}
                              strokeDashoffset={2 * Math.PI * 62 * (1 - percent / 100)}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black font-sora text-white">{percent}%</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Funding</span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Capacity</span>
                            <span className="text-sm font-bold text-white font-sora">{formatRupee(target)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Collected Amount</span>
                            <span className="text-sm font-bold text-white font-sora">{formatRupee(collected)}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-[#0B2C21] rounded-2xl border border-white/5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Your Contribution Highlight</span>
                          <p className="text-xs font-semibold text-slate-200">
                            You've pledged <span className="text-[#74E61F] font-bold font-sora">{formatRupee(planInfo.price)}</span> representing a <span className="text-[#74E61F] font-bold font-sora">{planInfo.poolShare}</span> ownership share.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quick Actions & Updates */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#042118]/40 border border-white/5 rounded-[32px] p-6 space-y-4">
                      <h3 className="text-sm font-bold font-sora text-white uppercase tracking-wider">
                        Quick Actions
                      </h3>
                      <div className="space-y-2.5">
                        <button 
                          onClick={() => setActiveTab('plan')}
                          className="w-full p-3.5 bg-[#0B2C21] hover:bg-[#74E61F] hover:text-[#042A1d] transition-all rounded-2xl border border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer"
                        >
                          <span className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <span>Upgrade My Plan</span>
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setActiveTab('profile')}
                          className="w-full p-3.5 bg-[#0B2C21] hover:bg-[#74E61F] hover:text-[#042A1d] transition-all rounded-2xl border border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer"
                        >
                          <span className="flex items-center space-x-2">
                            <User className="w-4 h-4 shrink-0" />
                            <span>Edit Account Details</span>
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#042118]/40 border border-white/5 rounded-[32px] p-6 space-y-4">
                      <h3 className="text-sm font-bold font-sora text-white uppercase tracking-wider">
                        System Logs
                      </h3>
                      <div className="space-y-3">
                        <div className="flex space-x-3 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#74E61F] mt-1.5 shrink-0"></div>
                          <div>
                            <p className="text-slate-300 font-semibold">Payment Confirmed</p>
                            <span className="text-[9px] text-slate-500">STS-{currentUser?.uid.slice(0, 4)} cycles initialized</span>
                          </div>
                        </div>
                        <div className="flex space-x-3 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#74E61F] mt-1.5 shrink-0"></div>
                          <div>
                            <p className="text-slate-300 font-semibold">New EV Project Launch</p>
                            <span className="text-[9px] text-slate-500">Waitlist for upcoming sites open</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──────── TABS: EDIT PROFILE ──────── */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl bg-[#042118]/50 border border-white/5 p-8 md:p-10 rounded-[32px] space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold font-sora text-white">
                    Account Profile Settings
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Update your user profile metadata saved in Firestore
                  </p>
                </div>

                {profileStatus.success && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-semibold">
                    Profile settings successfully updated in Firestore!
                  </div>
                )}
                {profileStatus.error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl text-xs font-semibold">
                    {profileStatus.error}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Vijay Kumar"
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-semibold text-white transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 font-semibold">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address (Cannot change)</label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#0B3022]/30 border border-white/5 text-slate-400 text-sm font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-semibold text-white transition-colors"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-[#74E61F] text-[#042A1d] font-sora font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all cursor-pointer text-xs md:text-sm"
                  >
                    Save Changes
                  </motion.button>
                </form>
              </div>
            )}

            {/* ──────── TABS: PROJECT PROGRESS ──────── */}
            {activeTab === 'progress' && (
              <div className="bg-[#042118]/50 border border-white/5 p-8 md:p-10 rounded-[32px] space-y-8">
                <div>
                  <h3 className="text-2xl font-extrabold font-sora text-white">
                    Live Funding Capacity Progress
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time metrics tracking total capacity vs collected user contribution
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 flex flex-col items-center justify-center py-6">
                    <div className="relative w-56 h-56">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle 
                          cx="112" cy="112" r="95" 
                          stroke="rgba(255,255,255,0.03)" 
                          strokeWidth="12" 
                          fill="transparent" 
                        />
                        <circle 
                          cx="112" cy="112" r="95" 
                          stroke="#74E61F" 
                          strokeWidth="12" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 95}
                          strokeDashoffset={2 * Math.PI * 95 * (1 - percent / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold font-sora text-white">{percent}%</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6 font-semibold">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-5 bg-[#0B2C21]/60 rounded-2xl border border-white/5">
                        <span className="text-xs text-slate-400 uppercase block mb-1">Target Capacity</span>
                        <span className="text-xl font-bold font-sora text-white">{formatRupee(target)}</span>
                      </div>
                      <div className="p-5 bg-[#0B2C21]/60 rounded-2xl border border-white/5">
                        <span className="text-xs text-slate-400 uppercase block mb-1">Total Funds Raised</span>
                        <span className="text-xl font-bold font-sora text-[#74E61F]">{formatRupee(collected)}</span>
                      </div>
                    </div>

                    <div className="p-6 bg-[#042A1d] rounded-2xl border border-white/5 space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-400">Total Project Contribution Left:</span>
                          <span className="text-[#74E61F] font-bold">{formatRupee(remaining)}</span>
                        </div>
                        <div className="w-full bg-[#031E15] h-2 rounded-full overflow-hidden">
                          <div className="bg-[#74E61F] h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-4 text-xs space-y-2 leading-relaxed">
                        <p className="text-slate-300">
                          Your Active contribution highlight: <span className="font-bold text-white">{formatRupee(planInfo.price)}</span>
                        </p>
                        <p className="text-slate-400 font-medium">
                          Note: Once the funding reaches 100% (₹15,00,000), subscription bounds for Sonbhadra EV-1 will freeze, unlocking secondary wind and solar pilot structures.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──────── TABS: MY PLAN ──────── */}
            {activeTab === 'plan' && (
              <div className="space-y-8">
                <div className="bg-[#042118]/50 border border-white/5 p-8 md:p-10 rounded-[32px]">
                  <div>
                    <h3 className="text-2xl font-extrabold font-sora text-white">
                      Selected Plan Details
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Check your active plan specifications, associated rewards, and details
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* Visual Membership Card mockup */}
                    <div className={`
                      bg-gradient-to-br ${planInfo.cardBg} rounded-[28px] p-8 border border-white/10 min-h-60 flex flex-col justify-between shadow-2xl relative overflow-hidden
                    `}>
                      <div className="absolute top-0 right-0 w-36 h-36 bg-[#74E61F]/5 rounded-full blur-2xl"></div>
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest text-[#74E61F] uppercase">STOSHI Green Energy</span>
                          <h4 className="text-lg font-black font-sora text-white mt-1 capitalize">{currentPlan} Plan</h4>
                        </div>
                        <Shield className="w-8 h-8 text-[#74E61F]" />
                      </div>

                      <div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Member Name</span>
                          <span className="text-sm font-semibold text-white tracking-wide">{userData?.name}</span>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">STS-{currentUser?.uid.slice(0, 10).toUpperCase()}</span>
                          <span className="text-xs font-bold text-[#74E61F] uppercase">Active Member</span>
                        </div>
                      </div>
                    </div>

                    {/* Plan features details list */}
                    <div className="space-y-5">
                      <h4 className="text-sm font-bold font-sora text-white uppercase tracking-wider">
                        My Tier Benefits List
                      </h4>
                      <ul className="space-y-3.5">
                        {planInfo.benefits.map((benefit, bIdx) => (
                          <li key={bIdx} className="flex items-start space-x-3 text-xs">
                            <div className="w-5 h-5 rounded-full bg-[#74E61F]/15 border border-[#74E61F]/20 text-[#74E61F] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-slate-300 font-semibold leading-relaxed">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Upgrade Option section */}
                {currentPlan !== 'Platinum' && (
                  <div className="bg-[#042118]/50 border border-white/5 p-8 rounded-[32px] space-y-6">
                    <div>
                      <h4 className="text-lg font-bold font-sora text-white">
                        Upgrade Your Plan Tier
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Select a premium tier to scale up rewards, voting power, and priority waitlist limits
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {currentPlan === 'Silver' && (
                        <div className="p-6 bg-[#042118] border border-white/5 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="px-2 py-0.5 bg-brand-parrot/10 text-brand-parrot rounded text-[9px] font-extrabold font-sora uppercase">Advanced</span>
                            <h5 className="text-sm font-bold text-white font-sora mt-2">Gold Plan</h5>
                            <p className="text-xs text-slate-400 mt-1">Scale pool share to 1.00% and unlock double waitlist cycles.</p>
                          </div>
                          <button
                            onClick={() => navigate('/payment?plan=Gold')}
                            className="mt-4 px-4 py-2.5 bg-[#74E61F] text-[#042A1d] font-bold rounded-xl text-xs uppercase cursor-pointer hover:bg-white transition"
                          >
                            Upgrade to Gold
                          </button>
                        </div>
                      )}

                      <div className="p-6 bg-[#042118] border border-[#74E61F]/10 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-3 py-1 bg-[#74E61F]/15 text-[#74E61F] text-[8px] font-black uppercase rounded-bl-xl tracking-wider">Ultimate</div>
                        <div>
                          <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[9px] font-extrabold font-sora uppercase">Premium</span>
                          <h5 className="text-sm font-bold text-white font-sora mt-2">Platinum Plan</h5>
                          <p className="text-xs text-slate-400 mt-1">Max 2.50% share, special plaque, voting rights, lifetime fee waiver.</p>
                        </div>
                        <button
                          onClick={() => navigate('/payment?plan=Platinum')}
                          className="mt-4 px-4 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase cursor-pointer hover:bg-white transition"
                        >
                          Upgrade to Platinum
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ──────── TABS: PAYMENT HISTORY ──────── */}
            {activeTab === 'payments' && (
              <div className="bg-[#042118]/50 border border-white/5 p-8 md:p-10 rounded-[32px] space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold font-sora text-white">
                    Pledge Payment Log
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Receipt details of successful EV project tier pledges synced from firestore payments collection
                  </p>
                </div>

                {paymentsLoading ? (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    Loading payments records...
                  </div>
                ) : payments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-semibold border border-dashed border-white/10 rounded-2xl text-xs">
                    No transactions found for your user ID.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#031F15]/30">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          <th className="p-4">Transaction ID</th>
                          <th className="p-4">Membership Plan</th>
                          <th className="p-4 text-right">Amount Paid</th>
                          <th className="p-4">Payment Date</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium">
                        {payments.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono font-bold text-white uppercase">{tx.transactionId}</td>
                            <td className="p-4">{tx.plan} Plan</td>
                            <td className="p-4 text-right text-white font-sora font-semibold">{formatRupee(tx.amount)}</td>
                            <td className="p-4">
                              {new Date(tx.date).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.status === 'Success' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ──────── TABS: NOTIFICATIONS ──────── */}
            {activeTab === 'notifications' && (
              <div className="bg-[#042118]/50 border border-white/5 p-8 md:p-10 rounded-[32px] space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold font-sora text-white">
                    Notifications Inbox
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Platform notices, payment logs, and new project launch events
                  </p>
                </div>

                <div className="space-y-4 font-semibold">
                  {/* Notification 1 */}
                  <div className="p-5 bg-[#0B2C21] rounded-2xl border border-white/5 flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-[#74E61F]/10 text-[#74E61F] flex items-center justify-center shrink-0 border border-[#74E61F]/15">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Payment Confirmation</h4>
                      <p className="text-xs text-slate-300 font-medium mt-1">
                        Your transaction was successfully processed. Your plan is updated to <span className="text-[#74E61F] font-bold">{currentPlan}</span> with all active benefits unlocked.
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1.5 block">Recent</span>
                    </div>
                  </div>

                  {/* Notification 2 */}
                  <div className="p-5 bg-[#0B2C21] rounded-2xl border border-white/5 flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-[#74E61F]/10 text-[#74E61F] flex items-center justify-center shrink-0 border border-[#74E61F]/15">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sonbhadra EV-1 Updates</h4>
                      <p className="text-xs text-slate-300 font-medium mt-1">
                        Charging node assembly completed. Calibration logs are ready to view. Real-time charger status is Operational.
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1.5 block">2 days ago</span>
                    </div>
                  </div>

                  {/* Notification 3 */}
                  <div className="p-5 bg-[#0B2C21] rounded-2xl border border-white/5 flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-[#74E61F]/10 text-[#74E61F] flex items-center justify-center shrink-0 border border-[#74E61F]/15">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">New EV Project Launch</h4>
                      <p className="text-xs text-slate-300 font-medium mt-1">
                        Waitlist registration for the upcoming green power solar charger array in Mirzapur begins next week. Stay tuned!
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1.5 block">1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
