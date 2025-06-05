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
  const fullText = "The intelligent personal interface";

  // Prevent copy/paste keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, F12, and right-click related shortcuts
      if (
        (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        // Allow these shortcuts only when focused on the email input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' && target.getAttribute('type') === 'email') {
          return; // Allow normal input behavior
        }
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
        throw new Error('Failed to join Alpha');
      }

      // Show success state
      setIsSubmitted(true);
      setEmail(''); // Clear email immediately when showing thank you
      
      // Reset thank you message after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 2000);
    } catch (err) {
      setError('Failed to join Alpha. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Birdinterface</title>
        <style>{`
          body { 
            background-color: black; 
          }
          * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
          }
          input[type="email"] {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
          }
          ::selection {
            background: transparent;
          }
          ::-moz-selection {
            background: transparent;
          }
        `}</style>
      </Head>
      {/* Outer container now allows scrolling */}
      <div 
        className="w-full bg-black min-h-screen select-none"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
        onDragStart={(e: React.DragEvent) => e.preventDefault()}
      >
        {/* Hero Section - Adjusted for scrolling */}
        <div className="hero-section-for-flashlight relative flex flex-col items-center z-20 min-h-screen">
          <FlashlightEffect />
          
          {/* Logo positioned separately */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-210px]">
            <div className="relative w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] md:w-[460px] md:h-[460px] lg:w-[520px] lg:h-[520px] xl:w-[560px] xl:h-[560px]">
              <Image
                src="/images/darkergrey.png"
                alt="Bird Interface Logo"
                width={1000} 
                height={1000}
                className="object-contain w-full h-full"
                priority
                draggable={false}
                quality={85}
              />
            </div>
          </div>
          
          {/* Paragraph positioned separately */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full mt-[-80px]">
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
              <p 
                className="text-white text-sm text-center px-4 font-medium"
                style={{ fontFamily: interFont.style.fontFamily, textTransform: 'none' }}
              >
                Your data – unified in a high-capability environment. Generate, manipulate, and innovate with an interface that acts on your behalf, accesses the web in real-time, and adapts to your every need. The future of computing is here – and it&apos;s limitless.
              </p>
            </div>
          </div>

          {/* Form positioned separately */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full mt-[20px]">
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
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
                      className="flex-1 px-4 py-2 rounded-lg bg-black text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-black text-gray-400 rounded-lg font-medium hover:text-white transition-colors disabled:opacity-50 min-w-[120px]"
                    >
                      {isSubmitting ? (
                        'Joining...'
                      ) : isSubmitted ? (
                        'Thank You'
                      ) : (
                        <span className="flex items-center justify-center">
                          Sign Up for Alpha <span className="text-lg ml-2">↵</span>
                        </span>
                      )}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>
              </form>
            </div>
          </div>
          {/* Arrow pointing down with text */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 cursor-pointer">
            <p 
              className="text-neutral-400 text-sm"
              style={{ fontFamily: interFont.style.fontFamily, textTransform: 'none' }}
            >
              Coming at the end of summer 2025
            </p>
            <ArrowDown 
              className="size-5 text-neutral-400 hover:text-white relative bottom-[6px]"
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
              I founded Birdinterface to solve data fragmentation by building a unified and AI-integrated personal interface.
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
              Among other things Birdinterface continuously analyzes a user&apos;s data to predict and serve user needs better. Bird can almost instantly surface or teleport the user to a desired data snippet across all their data (docs, files, code, videos, websites, music). Bird can point out gaps or errors in a user&apos;s thinking and visualize real opportunities for value creation, that I call &quot;Potentials&quot;. Bird also enables users to use a lot of compute to figure out the answer for hard problems that humans can&apos;t solve. This is only scratching the surface.
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