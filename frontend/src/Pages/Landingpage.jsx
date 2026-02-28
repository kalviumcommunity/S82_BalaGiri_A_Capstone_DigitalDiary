import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreLoader from '../components/ui/PreLoader';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import SecuritySection from '../components/landing/SecuritySection';
import Footer from '../components/landing/Footer';
import ThemeToggle from '../components/ui/ThemeToggle';
import { BookHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [loading, setLoading] = useState(true);

  // Prevent scrolling while loading
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [loading]);

  return (
    <>
      <PreLoader onComplete={() => setLoading(false)} />

      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col min-h-screen font-sans"
          >
            <main className="flex-grow">
              <Hero />
              <Features />
              <HowItWorks />
              <SecuritySection />
            </main>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingPage;
