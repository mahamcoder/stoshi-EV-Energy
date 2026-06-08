import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhoWeAre from './components/WhoWeAre';
import LiveFundingTracker from './components/LiveFundingTracker';
import CurrentProject from './components/CurrentProject';
import WhyJoin from './components/WhyJoin';
import MemberBenefits from './components/MemberBenefits';
import MembershipCards from './components/MembershipCards';
import FutureProjects from './components/FutureProjects';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import PolicyModal from './components/PolicyModal';

export default function App() {
  // ── Live funding simulator state ──────────────────────────────────────────
  const [totalMembers, setTotalMembers] = useState(127);
  const [filledCapacity, setFilledCapacity] = useState(975000);
  const targetCapacity = 1500000;

  const remainingCapacity = targetCapacity - filledCapacity;
  const capacityPercent   = (filledCapacity / targetCapacity) * 100;
  const isCapacityReached = filledCapacity >= targetCapacity;

  // ── Policy modal state ────────────────────────────────────────────────────
  // activePage: null | 'terms' | 'coupon' | 'refund'
  const [activePolicyPage, setActivePolicyPage] = useState(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePledge = (amount) => {
    if (isCapacityReached) return;
    setFilledCapacity((prev) => Math.min(prev + amount, targetCapacity));
    setTotalMembers((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen bg-brand-light selection:bg-brand-parrot selection:text-brand-dark">

      {/* 1. Floating Navbar */}
      <Navbar
        capacityPercent={capacityPercent}
        onScrollToSection={handleScrollToSection}
      />

      {/* 2. Hero Section — DO NOT MODIFY */}
      <Hero
        onScrollToSection={handleScrollToSection}
        capacityPercent={capacityPercent}
        totalMembers={totalMembers}
        filled={filledCapacity}
        available={remainingCapacity}
        total={targetCapacity}
      />

      {/* 3. Who We Are */}
      <WhoWeAre />

      {/* 4. Live Funding Tracker */}
      <LiveFundingTracker
        filled={filledCapacity}
        total={targetCapacity}
        available={remainingCapacity}
        capacityPercent={capacityPercent}
        totalMembers={totalMembers}
      />

      {/* 5. Current Project: SONBHADRA EV-1 + Upcoming */}
      <CurrentProject onScrollToSection={handleScrollToSection} />

      {/* 6. Why Join */}
      <WhyJoin onScrollToSection={handleScrollToSection} />

      {/* 7. Member Benefits Grid (matches mockup) */}
      <MemberBenefits />

      {/* 8. Membership Plans */}
      <section id="membership" className="py-20 md:py-28 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <MembershipCards
            onPledge={handlePledge}
            remainingCapacity={remainingCapacity}
          />
        </div>
      </section>

      {/* 9. Upcoming / Future Projects */}
      <section id="future" className="py-20 md:py-28 px-4 md:px-8 bg-[#F7FAF7]">
        <div className="max-w-7xl mx-auto">
          <FutureProjects />
        </div>
      </section>

      {/* 10. Testimonials */}
      <Testimonials />

      {/* 11. FAQ */}
      <FAQ />

      {/* 12. Footer — passes onOpenPolicy to open modals */}
      <Footer
        onScrollToSection={handleScrollToSection}
        onOpenPolicy={setActivePolicyPage}
      />

      {/* 13. Policy Modal Overlay (rendered at root so it overlays everything) */}
      {activePolicyPage && (
        <PolicyModal
          page={activePolicyPage}
          onClose={() => setActivePolicyPage(null)}
        />
      )}

    </div>
  );
}
