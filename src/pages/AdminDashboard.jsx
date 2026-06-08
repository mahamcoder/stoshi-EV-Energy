import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from '../router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  db,
  doc, 
  onSnapshot, 
  collection, 
  getDocs,
  updateDoc,
  deleteDoc
} from '../firebase';
import { 
  LayoutDashboard, Users, Wallet, Settings, LogOut, 
  Menu, X, Check, Trash2, Shield, Search, ArrowLeft,
  Calendar, RefreshCw, AlertCircle, Edit, ArrowUpRight, TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminDashboard() {
  const { currentUser, userData, signOut } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'analytics' | 'users' | 'payments' | 'project'
  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Users and Payments State
  const [usersList, setUsersList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Project Settings Form State
  const [projectForm, setProjectForm] = useState({
    totalCapacity: 1500000,
    collectedAmount: 975000,
    totalMembers: 127,
    status: 'Operational',
    location: 'Sonbhadra, Uttar Pradesh'
  });
  const [projectStatus, setProjectStatus] = useState({ success: false, error: '' });

  // Search filter
  const [userSearch, setUserSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Editing User Modal/Form State
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', phone: '', membershipType: '', membershipStatus: '', paymentStatus: '' });

  // 1. Fetch Users, Payments, and live Project data
  useEffect(() => {
    let unsubProject = () => {};
    
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch all users
        const usersSnap = await getDocs(collection(db, 'users'));
        const users = [];
        usersSnap.forEach((uDoc) => {
          users.push({ id: uDoc.id, ...uDoc.data() });
        });
        setUsersList(users);

        // Fetch all payments
        const paymentsSnap = await getDocs(collection(db, 'payments'));
        const payments = [];
        paymentsSnap.forEach((pDoc) => {
          payments.push({ id: pDoc.id, ...pDoc.data() });
        });
        // Sort by date descending
        payments.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPaymentsList(payments);

        // Setup real-time listener for the live project
        unsubProject = onSnapshot(doc(db, 'project', 'sonbhadra-ev-1'), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setProjectForm({
              totalCapacity: data.totalCapacity || 1500000,
              collectedAmount: data.collectedAmount || 975000,
              totalMembers: data.totalMembers || 127,
              status: data.status || 'Operational',
              location: data.location || 'Sonbhadra, Uttar Pradesh'
            });
          }
        });

      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();

    return () => unsubProject();
  }, [activeTab]);

  // Helper: Refresh Data manually
  const handleRefresh = async () => {
    setLoadingData(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = [];
      usersSnap.forEach((uDoc) => {
        users.push({ id: uDoc.id, ...uDoc.data() });
      });
      setUsersList(users);

      const paymentsSnap = await getDocs(collection(db, 'payments'));
      const payments = [];
      paymentsSnap.forEach((pDoc) => {
        payments.push({ id: pDoc.id, ...pDoc.data() });
      });
      payments.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPaymentsList(payments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  // Helper: Format Rupee
  const formatRupee = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // 2. Action Handlers
  const handleToggleAdmin = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      confetti({
        particleCount: 30,
        spread: 30,
        colors: ['#74E61F', '#105D3D']
      });
    } catch (err) {
      alert('Error updating user role: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user profile? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsersList(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user.id);
    setUserForm({
      name: user.name || '',
      phone: user.phone || '',
      membershipType: user.membershipType || '',
      membershipStatus: user.membershipStatus || 'Pending',
      paymentStatus: user.paymentStatus || 'Unpaid'
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', editingUser), userForm);
      setUsersList(prev => prev.map(u => u.id === editingUser ? { ...u, ...userForm } : u));
      setEditingUser(null);
    } catch (err) {
      alert('Error updating user: ' + err.message);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setProjectStatus({ success: false, error: '' });

    try {
      const parsedCapacity = Number(projectForm.totalCapacity);
      const parsedCollected = Number(projectForm.collectedAmount);
      const parsedMembers = Number(projectForm.totalMembers);

      if (isNaN(parsedCapacity) || isNaN(parsedCollected) || isNaN(parsedMembers)) {
        setProjectStatus({ success: false, error: 'Amounts and counts must be numeric values.' });
        return;
      }

      await updateDoc(doc(db, 'project', 'sonbhadra-ev-1'), {
        totalCapacity: parsedCapacity,
        collectedAmount: parsedCollected,
        totalMembers: parsedMembers,
        status: projectForm.status,
        location: projectForm.location,
        lastUpdated: new Date().toISOString()
      });

      setProjectStatus({ success: true, error: '' });
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#74E61F', '#22C55E']
      });

      setTimeout(() => setProjectStatus(prev => ({ ...prev, success: false })), 3000);
    } catch (err) {
      setProjectStatus({ success: false, error: 'Failed to update live project: ' + err.message });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Math & Analytics Calculations
  const totalRegisteredUsers = usersList.length;
  const activeMembers = usersList.filter(u => u.membershipStatus === 'Active').length;
  const totalRevenue = paymentsList.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Filtered Users List
  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone?.includes(userSearch)
  );

  // Filtered Payments List
  const filteredPayments = paymentsList.filter(p => 
    p.userName?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.userEmail?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.transactionId?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.plan?.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  const sidebarMenuItems = [
    { id: 'analytics', name: 'Overview', icon: LayoutDashboard },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'payments', name: 'Payments History', icon: Wallet },
    { id: 'project', name: 'Live Project Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#021811] text-[#E2E8F0] flex font-inter relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#74E61F]/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-[20%] w-[50%] h-[50%] bg-[#105D3D]/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Mobile Drawer menu icon */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 bg-[#042A1d] border border-white/10 rounded-2xl text-[#74E61F] cursor-pointer shadow-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar menu drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#041E15]/95 backdrop-blur-md border-r border-white/5 p-6 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/stoshi_logo.png" alt="Stoshi" className="h-12 w-auto" />
            <div>
              <span className="text-sm font-extrabold font-sora block tracking-tight text-white">STOSHI</span>
              <span className="text-[10px] font-extrabold text-[#74E61F] tracking-widest block uppercase">Admin Portal</span>
            </div>
          </Link>

          {/* Admin Tag */}
          <div className="flex items-center space-x-3 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-sm shadow-inner">
              AD
            </div>
            <div>
              <span className="text-xs font-bold text-white block truncate">{userData?.name || 'Administrator'}</span>
              <span className="px-2 py-0.5 mt-1 rounded text-[8px] font-extrabold font-sora uppercase border bg-red-500/10 text-red-400 border-red-500/20 inline-block">
                Systems Admin
              </span>
            </div>
          </div>

          {/* Sidebar Navigation items */}
          <nav className="space-y-1">
            {sidebarMenuItems.map((item) => {
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

        {/* Back and Logout buttons */}
        <div className="space-y-3">
          <Link
            to="/"
            className="w-full px-4 py-3 border border-white/5 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-wider transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Landing Page</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-white rounded-2xl flex items-center space-x-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout admin</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto z-10 max-w-7xl mx-auto w-full">
        {/* Header Toolbar */}
        <div className="flex justify-between items-center mb-8 bg-[#042A1d]/50 p-6 rounded-[32px] border border-white/5 backdrop-blur-sm">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold font-sora text-white">
              Green Infrastructure Console
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Active Control over Live Pledges, User Accounts, and Charging Nodes metrics.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-3 bg-[#0B2C21] hover:bg-[#74E61F] hover:text-[#042A1d] transition-all rounded-2xl border border-white/5 text-slate-300 cursor-pointer"
            title="Refresh logs data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-[#74E61F]' : ''}`} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* ──────── TAB: ANALYTICS / OVERVIEW ──────── */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Metrics Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stat Card 1 */}
                  <div className="p-6 bg-[#042118]/80 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/10">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Total Registered Users
                    </span>
                    <div className="text-3xl font-extrabold font-sora text-white">
                      {loadingData ? '...' : totalRegisteredUsers}
                    </div>
                    <p className="text-[10px] text-cyan-400 mt-2 font-semibold flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      <span>User records in local DB</span>
                    </p>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="p-6 bg-[#042118]/80 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="w-10 h-10 rounded-2xl bg-[#74E61F]/10 flex items-center justify-center text-[#74E61F] mb-4 border border-[#74E61F]/10">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Active Members Count
                    </span>
                    <div className="text-3xl font-extrabold font-sora text-white">
                      {loadingData ? '...' : activeMembers}
                    </div>
                    <p className="text-[10px] text-[#74E61F] mt-2 font-semibold">
                      Paid and fully active pledges
                    </p>
                  </div>

                  {/* Stat Card 3 */}
                  <div className="p-6 bg-[#042118]/80 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/10">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Simulated Revenue Received
                    </span>
                    <div className="text-3xl font-extrabold font-sora text-white">
                      {loadingData ? '...' : formatRupee(totalRevenue)}
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-2 font-semibold">
                      Accumulated simulated transaction sum
                    </p>
                  </div>
                </div>

                {/* Sub layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Quick settings summary */}
                  <div className="lg:col-span-6 p-6 bg-[#042118]/40 border border-white/5 rounded-[32px] space-y-4">
                    <h3 className="text-sm font-bold font-sora text-white uppercase tracking-wider">
                      Live Project Metrics Snapshot
                    </h3>
                    <div className="p-5 bg-[#0B2C21] rounded-2xl border border-white/5 space-y-4 font-semibold text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Project Name:</span>
                        <span className="text-white font-bold">Sonbhadra EV-1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Project Capacity:</span>
                        <span className="text-[#74E61F] font-bold font-sora">{formatRupee(projectForm.totalCapacity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Amount Raised:</span>
                        <span className="text-white font-sora">{formatRupee(projectForm.collectedAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Member Contributions Counter:</span>
                        <span className="text-white">{projectForm.totalMembers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="text-white">{projectForm.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status State:</span>
                        <span className="px-2 py-0.5 bg-[#74E61F]/10 text-[#74E61F] rounded font-bold">{projectForm.status}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('project')}
                      className="w-full py-3.5 bg-[#0B2C21] hover:bg-[#74E61F] hover:text-[#042A1d] transition-all rounded-2xl border border-white/5 text-center text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer"
                    >
                      Update Live Settings
                    </button>
                  </div>

                  {/* Right: Recent Payment notifications log */}
                  <div className="lg:col-span-6 p-6 bg-[#042118]/40 border border-white/5 rounded-[32px] space-y-4">
                    <h3 className="text-sm font-bold font-sora text-white uppercase tracking-wider">
                      Recent Activity Stream
                    </h3>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {paymentsList.slice(0, 4).map((pay, pIdx) => (
                        <div key={pay.id || pIdx} className="p-3 bg-[#0B2C21]/60 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-white block">{pay.userName} ({pay.plan} Plan)</span>
                            <span className="text-[10px] text-slate-500 block font-semibold">{new Date(pay.date).toLocaleDateString('en-IN')}</span>
                          </div>
                          <span className="text-xs font-bold text-[#74E61F] font-sora shrink-0">{formatRupee(pay.amount)}</span>
                        </div>
                      ))}
                      {paymentsList.length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-8">No payments logged yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──────── TAB: USER MANAGEMENT ──────── */}
            {activeTab === 'users' && (
              <div className="bg-[#042118]/50 border border-white/5 p-8 md:p-10 rounded-[32px] space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold font-sora text-white">
                      Registered Users Registry
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Modify membership tiers, update profile status, delete accounts or toggle admin privileges.
                    </p>
                  </div>

                  {/* User search box */}
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-xs font-semibold text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#031F15]/30">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                        <th className="p-4">Name & Email</th>
                        <th className="p-4">Phone Number</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Plan Tier</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-white block">{user.name}</span>
                            <span className="text-[10px] text-slate-500 block font-semibold">{user.email}</span>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-400">{user.phone || 'N/A'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.role === 'admin' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-300">{user.membershipType || 'None'}</td>
                          <td className="p-4">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              user.paymentStatus === 'Paid' 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {user.paymentStatus || 'Unpaid'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center items-center space-x-2.5">
                              <button
                                onClick={() => handleEditUserClick(user)}
                                className="p-2 bg-[#0B2C21] hover:bg-[#74E61F] hover:text-[#042A1d] transition-all rounded-xl border border-white/5 text-slate-300 cursor-pointer"
                                title="Edit Profile Details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleAdmin(user.id, user.role)}
                                className="p-2 bg-[#0B2C21] hover:bg-[#74E61F] hover:text-[#042A1d] transition-all rounded-xl border border-white/5 text-slate-300 cursor-pointer"
                                title="Toggle Admin Privileges"
                              >
                                <Shield className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all rounded-xl border border-red-500/20 text-red-400 cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-500 text-xs font-semibold">
                            No matching user profiles found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Edit User Modal Overlay */}
                {editingUser && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full max-w-md bg-[#042118] border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-6"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h4 className="text-base font-bold font-sora text-white">Edit User Settings</h4>
                        <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white cursor-pointer">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
                          <input
                            type="text"
                            value={userForm.name}
                            onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3022] border border-white/10 text-xs font-semibold text-white focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Phone</label>
                          <input
                            type="text"
                            value={userForm.phone}
                            onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3022] border border-white/10 text-xs font-semibold text-white focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Plan</label>
                            <select
                              value={userForm.membershipType}
                              onChange={(e) => setUserForm({...userForm, membershipType: e.target.value})}
                              className="w-full px-3 py-2 rounded-xl bg-[#0B3022] border border-white/10 text-xs font-semibold text-white focus:outline-none"
                            >
                              <option value="">None</option>
                              <option value="Silver">Silver</option>
                              <option value="Gold">Gold</option>
                              <option value="Platinum">Platinum</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Status</label>
                            <select
                              value={userForm.membershipStatus}
                              onChange={(e) => setUserForm({...userForm, membershipStatus: e.target.value})}
                              className="w-full px-3 py-2 rounded-xl bg-[#0B3022] border border-white/10 text-xs font-semibold text-white focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Active">Active</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Payment Status</label>
                          <select
                            value={userForm.paymentStatus}
                            onChange={(e) => setUserForm({...userForm, paymentStatus: e.target.value})}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3022] border border-white/10 text-xs font-semibold text-white focus:outline-none"
                          >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="flex-1 py-3 border border-white/5 rounded-2xl text-xs font-bold uppercase text-slate-400 hover:text-white transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 bg-[#74E61F] text-[#042A1d] rounded-2xl text-xs font-bold uppercase hover:bg-white hover:text-black transition cursor-pointer"
                          >
                            Save Settings
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}

              </div>
            )}

            {/* ──────── TAB: PAYMENTS LOGS ──────── */}
            {activeTab === 'payments' && (
              <div className="bg-[#042118]/50 border border-white/5 p-8 md:p-10 rounded-[32px] space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold font-sora text-white">
                      Financial Transaction Audit Log
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Sync logs of simulated pledges and credit check entries recorded in firestore payments collection.
                    </p>
                  </div>

                  {/* Payment filter */}
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-xs font-semibold text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Payments Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#031F15]/30">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">User Details</th>
                        <th className="p-4">Plan Tier</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium">
                      {filteredPayments.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-white uppercase">{tx.transactionId}</td>
                          <td className="p-4">
                            <span className="font-bold text-slate-300 block">{tx.userName}</span>
                            <span className="text-[10px] text-slate-500 block font-semibold">{tx.userEmail}</span>
                          </td>
                          <td className="p-4 font-bold">{tx.plan} Plan</td>
                          <td className="p-4 text-right text-[#74E61F] font-sora font-semibold">{formatRupee(tx.amount)}</td>
                          <td className="p-4 text-slate-400">
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
                      {filteredPayments.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-500 text-xs font-semibold">
                            No matching financial transaction logs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ──────── TAB: LIVE PROJECT SETTINGS ──────── */}
            {activeTab === 'project' && (
              <div className="max-w-2xl bg-[#042118]/50 border border-white/5 p-8 md:p-10 rounded-[32px] space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold font-sora text-white">
                    Live Project Parameters Settings
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct controls to change overall EV funding metrics. Changes sync instantly to landing page widgets and dashboards.
                  </p>
                </div>

                {projectStatus.success && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-semibold">
                    Parameters saved! Live tracker dials updated instantly.
                  </div>
                )}
                {projectStatus.error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl text-xs font-semibold">
                    {projectStatus.error}
                  </div>
                )}

                <form onSubmit={handleProjectSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Goal Capacity (₹)</label>
                      <input
                        type="number"
                        value={projectForm.totalCapacity}
                        onChange={(e) => setProjectForm({...projectForm, totalCapacity: e.target.value})}
                        className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-xs font-bold text-white transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Funds Collected (₹)</label>
                      <input
                        type="number"
                        value={projectForm.collectedAmount}
                        onChange={(e) => setProjectForm({...projectForm, collectedAmount: e.target.value})}
                        className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-xs font-bold text-white transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Members Counter</label>
                      <input
                        type="number"
                        value={projectForm.totalMembers}
                        onChange={(e) => setProjectForm({...projectForm, totalMembers: e.target.value})}
                        className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-xs text-white transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Project Location</label>
                      <input
                        type="text"
                        value={projectForm.location}
                        onChange={(e) => setProjectForm({...projectForm, location: e.target.value})}
                        className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-xs text-white transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 font-semibold">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Infrastructure Status</label>
                    <select
                      value={projectForm.status}
                      onChange={(e) => setProjectForm({...projectForm, status: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-xs text-white transition-colors cursor-pointer"
                    >
                      <option value="Operational">Operational</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Calibration">Pending Calibration</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-[#74E61F] text-[#042A1d] font-sora font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all cursor-pointer text-xs md:text-sm"
                  >
                    Commit Parameters to Database
                  </motion.button>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
