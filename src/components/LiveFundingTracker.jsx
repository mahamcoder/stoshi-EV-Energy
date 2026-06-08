import React from 'react';
import { motion } from 'framer-motion';
import { Users, Landmark, Target, Hourglass, ArrowUpRight } from 'lucide-react';

export default function LiveFundingTracker({ filled, total, available, capacityPercent, totalMembers }) {
  const formatRupee = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const circleRadius = 78;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (capacityPercent / 100) * circumference;

  return (
    <section id="tracker" className="py-20 md:py-28 px-4 md:px-8 bg-[#F6FAF7] overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-12">
        {/* Category Label */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[11px] font-extrabold font-sora text-brand-green uppercase tracking-widest block mb-3"
        >
          PROJECT CAPACITY PROGRESS
        </motion.span>

        {/* Section Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black font-sora text-brand-dark leading-tight tracking-tight mb-4"
        >
          SONBHADRA EV-1 • <span className="text-brand-green">Live Funding</span>
        </motion.h2>

        {/* Subtext description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-500 font-medium max-w-2xl mx-auto text-sm sm:text-[15px] leading-relaxed"
        >
          Membership participation contributes toward the overall project capacity. Once the maximum capacity is reached, new registrations may be placed on a waiting list.
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* ================= LEFT SIDE: DUAL TRACK CIRCULAR GAUGE CARD ================= */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.35 }}
          className="lg:col-span-5 bg-white rounded-[36px] border border-slate-100 shadow-xl shadow-brand-dark/5 p-8 flex flex-col justify-between relative overflow-hidden group min-h-[440px]"
        >
          {/* Top Live Badge */}
          <div className="absolute top-6 right-6">
            <span className="inline-flex items-center space-x-1.5 bg-[#4AA65C] text-white text-[10px] font-extrabold tracking-wider px-3.5 py-1.5 rounded-full uppercase shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center mt-6">
            {/* SVG Circle Gauge */}
            <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 select-none">
                <circle
                  cx="50%"
                  cy="50%"
                  r={circleRadius}
                  fill="transparent"
                  stroke="#EBF3EE"
                  strokeWidth="15"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r={circleRadius}
                  fill="transparent"
                  stroke="url(#dashboardGradient)"
                  strokeWidth="15"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  whileInView={{ strokeDashoffset }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#105D3D" />
                    <stop offset="100%" stopColor="#74E61F" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inside details */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Completion</span>
                <span className="text-4xl md:text-5xl font-black font-sora text-[#105D3D] my-1 leading-none">
                  {capacityPercent.toFixed(0)}%
                </span>
                <span className="text-[11px] font-black text-brand-dark leading-none">
                  {formatRupee(filled)}
                </span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                  of {formatRupee(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom remaining label */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">REMAINING</span>
              <span className="text-sm font-extrabold text-brand-dark block">{formatRupee(available)}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </motion.div>

        {/* ================= RIGHT SIDE: STATS GRID ================= */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Stat Box 1: Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex items-center space-x-4 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-green/5 text-brand-green flex items-center justify-center shrink-0 border border-brand-green/10">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black font-sora text-brand-dark block leading-tight">
                  {totalMembers}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Members
                </span>
              </div>
            </motion.div>

            {/* Stat Box 2: Participation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex items-center space-x-4 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-green/5 text-brand-green flex items-center justify-center shrink-0 border border-brand-green/10">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black font-sora text-brand-dark block leading-tight">
                  {formatRupee(filled)}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Participation
                </span>
              </div>
            </motion.div>

            {/* Stat Box 3: Target Capacity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex items-center space-x-4 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-green/5 text-brand-green flex items-center justify-center shrink-0 border border-brand-green/10">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black font-sora text-brand-dark block leading-tight">
                  {formatRupee(total)}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Capacity
                </span>
              </div>
            </motion.div>

            {/* Stat Box 4: Remaining */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex items-center space-x-4 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-green/5 text-brand-green flex items-center justify-center shrink-0 border border-brand-green/10">
                <Hourglass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black font-sora text-brand-dark block leading-tight">
                  {formatRupee(available)}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Remaining
                </span>
              </div>
            </motion.div>

          </div>

          {/* Stat Box 5: Long Horizontal Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-black text-brand-dark">Project Capacity</span>
              <span className="text-sm font-black text-brand-green">{capacityPercent.toFixed(0)}%</span>
            </div>
            
            {/* Slider track */}
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${capacityPercent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="bg-gradient-to-r from-brand-green to-brand-parrot h-full rounded-full"
              />
            </div>

            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{formatRupee(filled)} filled</span>
              <span>{formatRupee(available)} available</span>
            </div>
          </motion.div>

          {/* Stat Box 6: Silver / Gold / Platinum Membership tags side-by-side */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { level: 'SILVER', price: '₹7,500', desc: 'Entry-level participation in the project capacity.', gradient: 'from-slate-50 to-slate-100/50' },
              { level: 'GOLD', price: '₹15,00/000', priceFormatted: '₹15,000', desc: 'Balanced share for committed community members.', gradient: 'from-amber-50/40 to-amber-100/10' },
              { level: 'PLATINUM', price: '₹30,000', desc: 'Maximum impact contribution to project growth.', gradient: 'from-brand-green/5 to-transparent' }
            ].map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1, type: 'spring', bounce: 0.3 }}
                className={`bg-gradient-to-b ${tier.gradient} rounded-2xl p-4 border border-slate-100 flex flex-col justify-between`}
              >
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">{tier.level}</span>
                  <span className="text-[17px] font-black font-sora text-brand-dark mt-1 block leading-none">
                    {tier.priceFormatted || tier.price}
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-2 leading-tight">
                  {tier.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
