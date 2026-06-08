import React, { useState, useEffect } from 'react';
import { useNavigate } from '../router';
import { doc, onSnapshot } from '../firebase';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { initializeProjectData } from '../firebase';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WhoWeAre from '../components/WhoWeAre';
import LiveFundingTracker from '../components/LiveFundingTracker';
import CurrentProject from '../components/CurrentProject';
import WhyJoin from '../components/WhyJoin';
import MemberBenefits from '../components/MemberBenefits';
import MembershipCards from '../components/MembershipCards';
import FutureProjects from '../components/FutureProjects';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import PolicyModal from '../components/PolicyModal';

export default function Home() {
  const { currentUser, userData, updateMembershipPlan } = useAuth();
  const navigate = useNavigate();

  // ── Live project data from DB ─────────────────────────────────────────────
  const [projectData, setProjectData] = useState({
    totalCapacity: 1500000,
    collectedAmount: 975000,
    totalMembers: 127,
  });

  useEffect(() => {
    // Seed on first load
    initializeProjectData();

    const unsub = onSnapshot(doc(db, 'project', 'sonbhadra-ev-1'), (snap) => {
      if (snap.exists()) setProjectData(snap.data());
    });
    return () => unsub();
  }, []);

  const targetCapacity   = projectData.totalCapacity   || 1500000;
  const filledCapacity   = projectData.collectedAmount  || 975000;
  const totalMembers     = projectData.totalMembers     || 127;
  const remainingCapacity = targetCapacity - filledCapacity;
  const capacityPercent   = (filledCapacity / targetCapacity) * 100;

  // ── Policy modal ──────────────────────────────────────────────────────────
  const [activePolicyPage, setActivePolicyPage] = useState(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectPlan = async (amount) => {
    const planMap = { 7500: 'Silver', 15000: 'Gold', 30000: 'Platinum' };
    const planName = planMap[amount] || 'Gold';

    if (!currentUser) {
      navigate(`/signup?plan=${planName}`);
    } else if (userData?.paymentStatus !== 'Paid') {
      try { await updateMembershipPlan(planName); } catch (_) {}
      navigate('/payment');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-light selection:bg-brand-parrot selection:text-brand-dark">
      <Navbar capacityPercent={capacityPercent} onScrollToSection={handleScrollToSection} />

      <Hero
        onScrollToSection={handleScrollToSection}
        capacityPercent={capacityPercent}
        totalMembers={totalMembers}
        filled={filledCapacity}
        available={remainingCapacity}
        total={targetCapacity}
      />

      <WhoWeAre />

      <LiveFundingTracker
        filled={filledCapacity}
        total={targetCapacity}
        available={remainingCapacity}
        capacityPercent={capacityPercent}
        totalMembers={totalMembers}
      />

      <CurrentProject onScrollToSection={handleScrollToSection} />
      <WhyJoin onScrollToSection={handleScrollToSection} />
      <MemberBenefits />

      <section id="membership" className="py-20 md:py-28 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <MembershipCards
            onPledge={handleSelectPlan}
            remainingCapacity={remainingCapacity}
          />
        </div>
      </section>

      <section id="future" className="py-20 md:py-28 px-4 md:px-8 bg-[#F7FAF7]">
        <div className="max-w-7xl mx-auto">
          <FutureProjects />
        </div>
      </section>

      <Testimonials />
      <FAQ />

      <Footer
        onScrollToSection={handleScrollToSection}
        onOpenPolicy={setActivePolicyPage}
      />

      {activePolicyPage && (
        <PolicyModal page={activePolicyPage} onClose={() => setActivePolicyPage(null)} />
      )}
    </div>
  );
}
