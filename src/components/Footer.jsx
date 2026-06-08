import React, { useState } from 'react';
import { Leaf, Send } from 'lucide-react';

export default function Footer({ onScrollToSection }) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 3000);
  };

  return (
    <footer className="bg-brand-dark text-white rounded-t-[50px] pt-16 pb-8 px-4 md:px-8 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-parrot/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          
          {/* Logo & Pitch */}
          <div className="md:col-span-4 flex flex-col items-start">
            <div className="flex items-center space-x-2 mb-4 cursor-pointer" onClick={() => onScrollToSection('hero')}>
              <div className="w-10 h-10 rounded-full bg-brand-parrot flex items-center justify-center text-brand-dark shadow-md">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-sora font-extrabold text-xl tracking-tight text-white">
                SONBHADRA <span className="text-brand-parrot">EV-1</span>
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed max-w-sm">
              Dedicated to accelerating the deployment of sustainable EV charging infrastructure across local and regional corridors. Powered by community participation.
            </p>
          </div>

          {/* Links columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-[11px] font-bold font-sora uppercase tracking-widest text-slate-400 mb-4">
                Framework
              </h5>
              <ul className="space-y-2.5">
                {['Overview', 'Capacity Tracker', 'Memberships', 'Future Project'].map((name, i) => {
                  const ids = ['hero', 'tracker', 'membership', 'future'];
                  return (
                    <li key={i}>
                      <button
                        onClick={() => onScrollToSection(ids[i])}
                        className="text-xs md:text-sm text-slate-300 hover:text-brand-parrot font-semibold transition-colors"
                      >
                        {name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h5 className="text-[11px] font-bold font-sora uppercase tracking-widest text-slate-400 mb-4">
                Resources
              </h5>
              <ul className="space-y-2.5">
                {['Green Energy Planners', 'FAQ Guide', 'Waitlist Status', 'Support Hub'].map((name, i) => (
                  <li key={i}>
                    <a href="#" className="text-xs md:text-sm text-slate-300 hover:text-brand-parrot font-semibold transition-colors">
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="md:col-span-4">
            <h5 className="text-[11px] font-bold font-sora uppercase tracking-widest text-slate-400 mb-4">
              Join the newsletter
            </h5>
            <p className="text-xs text-slate-300 mb-4 font-semibold">
              Get the latest updates on infrastructure capacity thresholds and launch dates.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-brand-parrot transition-colors pr-12 font-medium"
              />
              <button
                type="submit"
                className="absolute right-2.5 p-2 rounded-xl bg-brand-parrot text-brand-dark hover:bg-white transition-colors cursor-pointer"
              >
                {subscribed ? <span className="text-[10px] font-bold">Done</span> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 w-full mb-8" />

        {/* Giant footer logo brand */}
        <div className="py-6 select-none pointer-events-none text-center">
          <h2 className="text-[12vw] font-black font-sora text-white/5 tracking-tighter uppercase leading-none">
            SONBHADRA
          </h2>
        </div>

        {/* Bottom copyright details */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <span>
            © {new Date().getFullYear()} SONBHADRA EV-1 Infrastructure. All Rights Reserved.
          </span>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-brand-parrot transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-parrot transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-parrot transition-colors flex items-center space-x-1">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
