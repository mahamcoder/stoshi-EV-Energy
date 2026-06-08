import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '../router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db, doc, getDoc, updateDoc, collection, addDoc } from '../firebase';
import { CreditCard, Smartphone, CheckCircle, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Payment() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Determine which plan is chosen
  const planParam = searchParams.get('plan');
  const selectedPlan = planParam || userData?.membershipType || 'Gold';

  // Plan Prices and Details
  const plansInfo = {
    Silver: { price: 7500, label: 'Silver Membership' },
    Gold: { price: 15000, label: 'Gold Membership' },
    Platinum: { price: 30000, label: 'Platinum Membership' }
  };

  const currentPlanInfo = plansInfo[selectedPlan] || plansInfo.Gold;
  const price = currentPlanInfo.price;

  // Form State
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    // If not authenticated, redirect to signup
    if (!currentUser) {
      navigate(`/signup?plan=${selectedPlan}`);
    }
  }, [currentUser, navigate, selectedPlan]);

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (status === 'processing') return;

    setStatus('processing');
    setErrorMessage('');

    // Simulate validation
    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        setErrorMessage('Please fill in all card details.');
        setStatus('idle');
        return;
      }
    } else {
      if (!upiId || !upiId.includes('@')) {
        setErrorMessage('Please enter a valid UPI ID (e.g. name@upi).');
        setStatus('idle');
        return;
      }
    }

    try {
      // Create a unique transaction ID
      const txId = 'STS-' + Math.random().toString(36).slice(2, 11).toUpperCase();
      const dateString = new Date().toISOString();

      // 1. Add record to payments collection
      await addDoc(collection(db, 'payments'), {
        transactionId: txId,
        userId: currentUser.uid,
        userName: userData?.name || 'User',
        userEmail: currentUser.email,
        amount: price,
        plan: selectedPlan,
        date: dateString,
        status: 'Success'
      });

      // 2. Update user status in Firestore users collection
      await updateDoc(doc(db, 'users', currentUser.uid), {
        membershipType: selectedPlan,
        membershipStatus: 'Active',
        paymentStatus: 'Paid'
      });

      // 3. Atomically update project metrics
      const projectRef = doc(db, 'project', 'sonbhadra-ev-1');
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const pData = projectSnap.data();
        await updateDoc(projectRef, {
          collectedAmount: (pData.collectedAmount || 975000) + price,
          totalMembers: (pData.totalMembers || 127) + 1
        });
      }

      // Record transaction context
      setTransactionDetails({
        id: txId,
        amount: price,
        date: new Date(dateString).toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      });

      setStatus('success');

      // Trigger Celebration Confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#042A1d', '#105D3D', '#74E61F', '#22C55E']
      });

      // Auto Redirect to Dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error('Payment processing error:', err);
      setErrorMessage('Payment failed to record: ' + err.message);
      setStatus('idle');
    }
  };

  const formatRupee = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#042A1d] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-inter">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#74E61F]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#105D3D]/30 rounded-full blur-[120px] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md glassmorphism-dark rounded-[32px] p-8 text-center border border-white/10 relative z-10 shadow-2xl"
          >
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-[#74E61F]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-sora text-white mb-2">
              Payment Successful!
            </h2>
            <p className="text-slate-300 text-xs md:text-sm font-semibold mb-6">
              Welcome to Stoshi Green Energy
            </p>

            <div className="bg-[#0B3022] rounded-2xl p-5 mb-8 text-left border border-white/5 space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="text-slate-200 font-mono">{transactionDetails?.id}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Plan Activated:</span>
                <span className="text-[#74E61F]">{selectedPlan} Plan</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="text-slate-200">{formatRupee(transactionDetails?.amount)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Payment Date:</span>
                <span className="text-slate-200">{transactionDetails?.date}</span>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#74E61F] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-[#74E61F] font-bold tracking-wider uppercase animate-pulse">
                Unlocking your Dashboard...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 my-8 px-2"
          >
            {/* Left Box: Order Summary */}
            <div className="lg:col-span-5 glassmorphism-dark rounded-[32px] p-8 border border-white/10 flex flex-col justify-between shadow-2xl">
              <div>
                <img src="/stoshi_logo.png" alt="Stoshi" className="h-10 w-auto mb-8" />
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#74E61F]/20 text-[#74E61F] uppercase tracking-wider block w-fit mb-3">
                  Checkout Summary
                </span>
                <h3 className="text-2xl font-extrabold font-sora mb-4 tracking-tight">
                  {currentPlanInfo.label}
                </h3>
                <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
                  Support sustainable EV infrastructure. Your pledge helps construct the Sonbhadra EV-1 charging node.
                </p>

                {/* Plan Highlights */}
                <div className="border-t border-white/10 pt-6 space-y-4">
                  <div className="flex items-center space-x-3 text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#74E61F]"></div>
                    <span className="text-slate-300">Automatic active membership activation</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#74E61F]"></div>
                    <span className="text-slate-300">Access to Green Energy Dashboard widgets</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#74E61F]"></div>
                    <span className="text-slate-300">Live progress tracking & community voting</span>
                  </div>
                </div>
              </div>

              {/* Total Row */}
              <div className="border-t border-white/10 pt-6 mt-8 flex justify-between items-end">
                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total to Pay</span>
                  <div className="text-3xl font-extrabold font-sora text-[#74E61F] mt-1">
                    {formatRupee(price)}
                  </div>
                </div>
                <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-[#042A1d] px-3 py-1.5 rounded-xl border border-white/5 space-x-1.5 shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Secure 256-bit SSL</span>
                </div>
              </div>
            </div>

            {/* Right Box: Payment Fields */}
            <div className="lg:col-span-7 glassmorphism-dark rounded-[32px] p-8 md:p-10 border border-white/10 shadow-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold font-sora text-white mb-6">
                  Select Payment Method
                </h4>

                {/* Method selector */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-2xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-3 cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#74E61F] bg-[#74E61F]/10 text-white'
                        : 'border-white/10 bg-[#0B3022]/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-2xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-3 cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#74E61F] bg-[#74E61F]/10 text-white'
                        : 'border-white/10 bg-[#0B3022]/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI ID</span>
                  </button>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handlePay} className="space-y-5">
                  {paymentMethod === 'card' ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Cardholder Name</label>
                        <input
                          type="text"
                          name="name"
                          value={cardDetails.name}
                          onChange={handleCardChange}
                          placeholder="Vijay Kumar"
                          className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors"
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Card Number</label>
                        <input
                          type="text"
                          name="number"
                          value={cardDetails.number}
                          onChange={handleCardChange}
                          placeholder="4111 2222 3333 4444"
                          maxLength="19"
                          className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors font-mono"
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Expiry Date</label>
                          <input
                            type="text"
                            name="expiry"
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors font-mono"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">CVV</label>
                          <input
                            type="password"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="•••"
                            maxLength="3"
                            className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors font-mono"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="vijay@okhdfcbank"
                          className="w-full px-4 py-3 rounded-2xl bg-[#0B3022]/60 border border-white/10 focus:border-[#74E61F] focus:outline-none text-sm font-medium transition-colors font-mono"
                          required={paymentMethod === 'upi'}
                        />
                      </div>
                    </div>
                  )}

                  {/* Pay Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={status === 'processing'}
                    className="w-full mt-6 py-4 rounded-2xl bg-[#74E61F] text-[#042A1d] font-sora font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center space-x-2 text-xs md:text-sm"
                  >
                    {status === 'processing' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#042A1d] border-t-transparent rounded-full animate-spin"></div>
                        <span>Securing Connection...</span>
                      </>
                    ) : (
                      <>
                        <span>Simulate Secure Payment</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

              <div className="mt-8 text-center text-slate-400 text-[10px] md:text-xs">
                By completing payment, you agree to our terms of participation. This is a secure transaction simulation. No real money will be charged.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
