import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, Battery, Users, Leaf, ArrowUpRight, Clock } from 'lucide-react';

const upcomingProjects = [
  {
    name: 'SONBHADRA EV-2',
    location: 'Sonbhadra, UP',
    status: 'Planning',
    capacity: '₹20,00,000',
    eta: 'Q3 2025',
    statusColor: 'text-amber-500 bg-amber-50 border-amber-100'
  },
  {
    name: 'AZAMGARH EV-1',
    location: 'Azamgarh, UP',
    status: 'Planning',
    capacity: '₹18,00,000',
    eta: 'Q4 2025',
    statusColor: 'text-amber-500 bg-amber-50 border-amber-100'
  },
  {
    name: 'LUCKNOW EV-1',
    location: 'Lucknow, UP',
    status: 'Coming Soon',
    capacity: '₹25,00,000',
    eta: 'Q1 2026',
    statusColor: 'text-slate-500 bg-slate-50 border-slate-100'
  }
];

const specs = [
  { icon: Zap, label: 'Power Rating', value: '120 kW' },
  { icon: Battery, label: 'Charging Bays', value: '8 Ports' },
  { icon: Users, label: 'Daily Users (est.)', value: '120+' },
  { icon: Leaf, label: 'CO₂ Saved/yr', value: '48 Tonnes' }
];

export default function CurrentProject({ onScrollToSection }) {
  return (
    <section id="current-project" className="py-20 md:py-28 px-4 md:px-8 bg-[#F7FAF7] overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-bold font-sora text-brand-green uppercase tracking-widest block mb-3"
          >
            Active Project
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black font-sora text-brand-dark leading-tight tracking-tight"
          >
            SONBHADRA{' '}
            <span className="text-brand-green">EV-1</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Main Project Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3 bg-[#042A1D] rounded-[36px] p-8 md:p-10 text-white overflow-hidden relative"
          >
            {/* Background glow */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-parrot/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-green/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Live badge */}
              <div className="flex items-center justify-between mb-8">
                <span className="inline-flex items-center gap-2 bg-brand-parrot/20 text-brand-parrot text-[10px] font-extrabold tracking-wider px-3.5 py-1.5 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-parrot animate-pulse" />
                  Funding Active
                </span>
                <div className="flex items-center gap-1.5 text-emerald-300/60 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Sonbhadra, Uttar Pradesh</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl md:text-3xl font-black font-sora text-white mb-3 tracking-tight">
                SONBHADRA EV-1<br />
                <span className="text-brand-parrot">Charging Station</span>
              </h3>
              <p className="text-emerald-100/70 text-sm leading-relaxed mb-8 max-w-md">
                India's community-funded EV charging node in Sonbhadra — powering clean mobility for the region with solar-integrated fast-charging infrastructure available to all members.
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {specs.map((spec, i) => {
                  const Icon = spec.icon;
                  return (
                    <div key={i} className="bg-white/8 rounded-2xl p-4 border border-white/10">
                      <Icon className="w-4 h-4 text-brand-parrot mb-2" strokeWidth={1.5} />
                      <span className="text-lg font-black font-sora text-white block">{spec.value}</span>
                      <span className="text-[10px] font-bold text-emerald-200/50 uppercase tracking-wider">{spec.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Target Capacity */}
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <div>
                  <span className="text-[10px] font-bold text-emerald-200/50 uppercase tracking-wider block">Project Capacity</span>
                  <span className="text-2xl font-black font-sora text-white">₹15,00,000</span>
                </div>
                <button
                  onClick={() => onScrollToSection && onScrollToSection('membership')}
                  className="flex items-center gap-2 bg-brand-parrot hover:bg-white text-[#042A1D] font-sora font-bold text-xs rounded-full px-5 py-2.5 transition-all duration-300 cursor-pointer"
                >
                  Join Now
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Projects Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-2"
            >
              <span className="text-[11px] font-bold font-sora text-brand-green uppercase tracking-widest block mb-1">
                Upcoming Projects
              </span>
              <h3 className="text-xl font-black font-sora text-brand-dark">
                Next Charging Nodes
              </h3>
            </motion.div>

            {upcomingProjects.map((project, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-black font-sora text-brand-dark">{project.name}</h4>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {project.location}
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 border ${project.statusColor}`}>
                    {project.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Capacity</span>
                    <span className="text-sm font-black font-sora text-brand-dark">{project.capacity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ETA</span>
                    <div className="flex items-center gap-1 text-brand-green text-xs font-bold">
                      <Clock className="w-3 h-3" />
                      {project.eta}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
