"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Bold } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import GrainyGradientGlow from '@/app/components/GrainyGradientGlow';
import { DotPattern } from "@/components/magicui/dot-pattern";
import '../../public/css/normalize.css';
import '../../public/css/webflow.css';
import '../../public/css/advancers-club-ef3cf37311bfc4b53cc064fc.webflow.css';
import '../../public/css/stars.css';
import { PreloadImages } from '@/components/PreloadImages';
import { criticalImages } from '@/lib/images';
import { cn } from "@/lib/utils";

const Welcome = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isTextComplete, setIsTextComplete] = useState(false);
  const fullText = "A next generation personal computer operating system.";
  const words = fullText.split(' ');

  useEffect(() => {
    let currentWordIndex = 0;
    const interval = setInterval(() => {
      if (currentWordIndex <= words.length) {
        setDisplayText(words.slice(0, currentWordIndex).join(' '));
        if (currentWordIndex === words.length) {
          setIsTextComplete(true);
        }
        currentWordIndex++;
      } else {
        clearInterval(interval);
      }
    }, 150); // Much faster animation, word by word

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      // Show success state
      setIsSubmitted(true);
      setEmail(''); // Clear email immediately when showing thank you
      
      // Reset thank you message after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 2000);
    } catch (err) {
      setError('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Birdinterface</title>
      </Head>
      {/* Outer relative container for stacking context */}
      <div className="fixed inset-0 w-full h-screen overflow-hidden bg-black">
        {/* Background Layer (Dot Grid with Glow) */}
        <div className="absolute inset-0 z-0">
          <DotPattern
            glow={isTextComplete}
            className={cn(
              "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
              "opacity-50"
            )}
          />
        </div>

        {/* Glow Layer (Flares) */}
        <div className="absolute inset-0 z-10">
           <GrainyGradientGlow />
        </div>

        {/* Content Layer (z-index 20) */}
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-48 overflow-hidden z-20">
          <div className="relative w-[150px] h-[150px] mb-12">
            <Image
              src="/images/white.png"
              alt="Bird Interface Logo"
              width={200}
              height={200}
              className="object-contain"
              priority
              draggable={false}
              quality={85}
              loading="eager"
            />
          </div>
          <motion.h1 
            className="text-white text-3xl font-light mb-12 text-center px-4 max-w-2xl mx-auto min-h-[80px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {displayText}
          </motion.h1>
          
          <form onSubmit={handleSubmit} className="w-full max-w-md px-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 min-w-[120px]"
                >
                  {isSubmitting ? 'Joining...' : isSubmitted ? 'Thank You' : 'Join waitlist'}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Welcome; 