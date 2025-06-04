"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import '../../public/css/normalize.css';
import '../../public/css/webflow.css';
import '../../public/css/advancers-club-ef3cf37311bfc4b53cc064fc.webflow.css';
import '../../public/css/stars.css';

import { PreloadImages } from '@/components/PreloadImages';
import { criticalImages } from '@/lib/images';
import { cn } from "@/lib/utils";

import FlashlightEffect from '../../components/custom/flashlight-effect';

const interFont = Inter({ subsets: ['latin'] });

const Welcome = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isTextComplete, setIsTextComplete] = useState(false);
  const fullText = "An intelligent personal interface.";

  useEffect(() => {
    const words = fullText.split(' ');
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
  }, [fullText]);

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
        <style>{`body { background-color: black; }`}</style>
      </Head>
      {/* Outer container now allows scrolling */}
      <div className="w-full bg-black min-h-screen">
        {/* Hero Section - Adjusted for scrolling */}
        <div className="hero-section-for-flashlight relative flex flex-col items-center z-20 min-h-screen">
          <FlashlightEffect />
          <div className="relative size-[160px] mt-10 mb-9">
            <Image
              src="/images/Birdinterface-white.png"
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full -mt-10">
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
              <motion.h1 
                className="text-white text-3xl font-light mb-12 text-center px-4 h-[80px] normal-case"
                style={{ fontFamily: interFont.style.fontFamily }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {displayText}
              </motion.h1>
              
              <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto px-4">
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
          {/* Arrow pointing down */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer">
            <ArrowDown 
              className="size-8 text-neutral-400"
              onClick={() => {
                const missionSection = document.getElementById('mission-section');
                if (missionSection) {
                  missionSection.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
            />
          </div>
        </div>
      
        {/* New Section for the Mission and Masterplan */}
        <div id="mission-section" className="bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div 
            className="max-w-3xl mx-auto normal-case font-normal" 
            style={{ fontFamily: interFont.style.fontFamily }}
          >
            <h2 className="text-3xl font-bold text-black mb-1 text-center">
              Mission and Masterplan
            </h2>
            <p className="text-center text-xs font-medium" style={{ color: '#555555', marginBottom: '2rem' }}>
              Alex Gisbrecht, Founder &amp; CEO of Birdinterface • May 30, 2025
            </p>
            
            <h2 className="text-xl font-bold text-black mb-6 mt-12">
              Unifying Our Life For AI
            </h2>
            <p className="text-base" style={{ color: '#555555' }}>
              I founded Birdinterface to solve data fragmentation by building an AI-integrated personal interface.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              The first essential step is unifying core data+tools into one elegant, ground-up interface—starting with tasks, calendar, an improved G-Drive-like system, a curator (to store and organize online content like videos, posts, websites, books, movies, music), agentic AI, maps, mail, messaging, financial overview, and browser.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              This creates 3 major unlocks:
            </p>
            <ol className="list-decimal list-inside text-base mt-4 pl-4" style={{ color: '#555555' }}>
              <li className="text-base">The user has all his important data in one place.</li>
              <li className="text-base">Birdinterface now understands the whole life of a user.</li>
              <li className="text-base">Birdinterface can deliver the best and most relevant knowledge, insights, and tools from the internet directly to the user—at the right place and time. Knowledge is Power - but only if it&apos;s the right knowledge.</li>
            </ol>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              As soon as core data is unified (which is the essential first step to create a truly magical experience), we&apos;ll start training LLMs to emulate the interface, freeing AI to serve the user&apos;s needs and preferences more intelligently while maintaining UI and data consistency.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Currently, we&apos;re in the early stages with a prototype used daily by 1,000+ people. I&apos;m preparing for the Alpha launch in summer 2025.
            </p>

            <h2 className="text-xl font-bold text-black mt-12 mb-6">
              The Mission
            </h2>
            <p className="text-base" style={{ color: '#555555' }}>
              At Birdinterface, the mission is to empower humans in their own pursuits and from an early age. We want to bring more freedom, independence, and power to people by creating a completely new, adaptive, intuitive and generative computer interface that aligns with a user&apos;s best interests, adapts to his/her thinking, removes friction, and respects their time.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              As outlined in <a href="https://advancers.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline decoration-transparent underline-offset-4 transition-all duration-300 hover:text-gray-400 hover:decoration-current">my philosophy</a>, I believe most systems in civilization, tech, and the internet are still misaligned with true advancement—favoring control, inefficiency, or profit over individual freedom and progress.
            </p>

            <h2 className="text-xl font-bold text-black mt-12 mb-6">
              The Data Fragmentation Problem
            </h2>
            <p className="text-base" style={{ color: '#555555' }}>
              The fundamental problem is the fragmentation of core data (=what drives one&apos;s curiosity, creativity and will to contribute).
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Today, a user&apos;s core data is fragmented across disconnected data silos and environments—creating friction, wasting time, and blocking a clear overview of life.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Birdinterface aims to solve this problem by creating a unified, AI-integrated and high-capability environment, that would be unwise not to use.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Among other things Birdinterface continuously analyzes a user&apos;s data to predict and serve user needs better. Bird can almost instantly surface or teleport the user to a desired data snippet across all their data (docs, files, code, videos, websites, music). Bird can point out gaps or errors in a user&apos;s thinking and visualize real opportunities for value creation, that I call &quot;Potentials&quot;. Bird also enables users to use a lot of compute to figure out the answer for hard problems that humans can&apos;t solve.
            </p>

            <h2 className="text-xl font-bold text-black mt-12 mb-6">
              Building a Unified Data Interface
            </h2>
            <p className="text-base" style={{ color: '#555555' }}>
              Birdinterface started as a personal research project I&apos;ve developed over 10+ years by continuously removing friction from my computer and phone experience. The current prototype uses Chrome bookmarks with simplified tools like Todoist, Google Calendar, Google Drive, Google Maps, Google Sheets, my own AI and more. My approach is to rebuild all components from the ground up—stripped to their most elegant, simple, and prioritized forms.
            </p>

            <h2 className="text-xl font-bold text-black mb-6 mt-12">
              What&apos;s Next
            </h2>
            <p className="text-base" style={{ color: '#555555' }}>
              For the Alpha launch planned in summer 2025, I aim to build the first five core data components—Tasks, Calendar, Database, Curator, and Intelligence—with core functionalities such as full AI context, agentic capabilities within the interface and the ability to generate new functioning components that can also be shared with other users.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Thereafter, every 1–2 months and over 6–9 months, we&apos;ll ship the next five—Map, Mail, People (communications hub), Finance, and Internet (sandboxed browser)—while starting data collection to train our first generative interface model.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Looking further ahead, Birdinterface plans to:
            </p>
            <ol className="list-decimal list-inside text-base mt-4 pl-4" style={{ color: '#555555' }}>
              <li className="text-base">Develop adaptive displays and devices powered by generative computing</li>
              <li className="text-base">Integrate a virtual world using real-world models for social, work, and play—with Bird as the HUD</li>
              <li className="text-base">Build augmentation hardware to boost cognition and monitor health</li>
              <li className="text-base">Enhance prediction accuracy to be truly in-sync with the user</li>
              <li className="text-base">Explore blockchain for data ownership</li>
            </ol>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              If rethinking the current computer experience excites you, let&apos;s talk. I&apos;m seeking founding engineers and partners with expertise in AI systems, model optimization, hardware, and scalable architecture.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Reach out: <a href="mailto:alex@birdinterface.com" className="text-blue-600 underline decoration-transparent underline-offset-4 transition-all duration-300 hover:text-gray-400 hover:decoration-current">alex@birdinterface.com</a>
            </p>

            <h2 className="text-xl font-bold text-black mt-12 mb-6">
              Mission and Masterplan (Summarized)
            </h2>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Empower humans—in their own pursuits and from an early age.
            </p>
            <ul className="list-decimal list-inside text-base mt-4 pl-4" style={{ color: '#555555' }}>
              <li className="text-base">Unify core data, build core components from the ground up</li>
              <li className="text-base">Train LLMs to emulate the interface</li>
              <li className="text-base">Build custom displays and devices</li>
              <li className="text-base">Develop augmentation hardware</li>
              <li className="text-base">Predict user actions with high accuracy</li>
            </ul>
            
            <hr className="my-12 border-gray-300" />

            <p className="text-center text-sm" style={{ color: '#555555' }}>
              © 2025 Bird Interfaces, GmbH. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome; 