import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export default function Navbar({ onScrollToSection }) {
  const [activeItem, setActiveItem] = useState('Green Energy');

  const navItems = [
    { name: 'Green Energy', id: 'hero' },
    { name: 'Consulting', id: 'tracker' },
    { name: 'Solar Power', id: 'membership' },
    { name: 'Wind Turbine', id: 'future' },
    { name: 'Pricing', id: 'membership' }
  ];

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-5 bg-[#F9FAF9]/90 backdrop-blur-md border-b border-slate-100/40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section: Logo & Language */}
        <div className="flex items-center space-x-6">
          <div
            onClick={() => onScrollToSection('hero')}
            className="flex items-center cursor-pointer group"
          >
            <img
              src="/stoshi_logo.png"
              alt="STOSHI Green Energy"
              className="h-14 md:h-16 w-auto group-hover:scale-102 transition-transform duration-300"
            />
          </div>



        </div>

        {/* Center Section: Navigation Pill */}
        <nav className="hidden md:flex items-center bg-[#ECECEC]/60 border border-slate-200/40 rounded-full p-1 max-w-lvh">
          {navItems.map((item) => {
            const isActive = activeItem === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveItem(item.name);
                  onScrollToSection(item.id);
                }}
                className={`px-5 py-3 text-xs font-semibold rounded-full transition-all duration-300 ${isActive
                  ? 'bg-[#E1E3E1] text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Join Us / CTA */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onScrollToSection('membership')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Join us
          </button>
          <button
            onClick={() => onScrollToSection('membership')}
            className="bg-slate-950 hover:bg-slate-800 text-white rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            Green Power
          </button>
        </div>
      </div>
    </motion.header>
  );
}

