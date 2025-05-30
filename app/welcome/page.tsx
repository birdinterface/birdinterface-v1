"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
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

const Welcome = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isTextComplete, setIsTextComplete] = useState(false);
  const fullText = "An AI that understands your whole life.";
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
  }, [words]);

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
        <div className="relative flex flex-col items-center z-20 h-screen">
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
                className="text-white text-3xl font-light mb-12 text-center px-4 h-[80px]"
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
          <div className="max-w-3xl mx-auto">
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
              I founded Birdinterface to tackle the problem of data fragmentation by building an AI that understands the whole life of a user.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              The first essential step is to unify a user&apos;s core data into one elegant interface, with all core components built from the ground up - starting with tasks, calendar, a g-drive-like system, curator (to store and organize anything online like videos, posts, websites, books, movies, music), an AI chat interface, maps, mail, audio/video/messaging, economics for financial tracking, and browser.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              This unique combination creates a big unlock in many ways. For example, we can now bring the best and most relevant knowledge, insights and capabilities from the internet directly to the interface of the user, and serve it in the right places and at the right time.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Once we achieve unification of the core data, we&apos;ll then train LLMs to emulate the interface so every pixel can be generated, which sets the AI free to better serve the user&apos;s needs and preferences while maintaining UI and data consistency.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Today, I&apos;m at an early stage with a prototype used by over 1,000 people every day. I have direct access to these users as my first potential customers, and I&apos;m preparing for an Alpha launch in summer 2025.
            </p>

            <h2 className="text-xl font-bold text-black mt-12 mb-6">
              The Mission
            </h2>
            <p className="text-base" style={{ color: '#555555' }}>
              At Birdinterface, the mission is to empower individuals in their own pursuits and from an early age. My drive and motivation is to bring more freedom, independence and power to individuals by creating a new computer interface that aligns with the user&apos;s best interests, adapts to its thinking, removes all friction and respects its time. As pointed out in <a href="https://advancers.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-400">my philosophy</a>, I believe most systems and structures in civilization/computers/internet are still fundamentally misaligned with people&apos;s best interests - prioritizing control, inefficiency, or profit over individual freedom and advancement.
            </p>

            <h2 className="text-xl font-bold text-black mt-12 mb-6">
              The Data Fragmentation Problem
            </h2>
            <p className="text-base" style={{ color: '#555555' }}>
              In today&apos;s world, a user&apos;s core data is scattered across incoherent apps, devices, and platforms. This fragmentation creates friction, wastes time, and hinders users to have a state-of-the-art overview over their lives.
            </p>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Birdinterface will solve this by bringing all important user data into one elegant interface. Bird constantly analyzes this data to predict and serve user&apos;s needs better, e.g. instantly bringing users to desired information pieces/snippets across all data—whether it&apos;s text, messages, files, code, videos, websites, posts, movies, or music. It can also point out gaps or errors in a user&apos;s thinking and visualize real opportunities for value creation in the world, that I call &ldquo;potentials&rdquo;.
            </p>

            <h2 className="text-xl font-bold text-black mt-12 mb-6">
              Building a Unified Data Interface
            </h2>
            <p className="text-base" style={{ color: '#555555' }}>
              Birdinterface is a personal research project I&apos;ve developed over 10+ years through continuous friction removal in my computer+phone experience. The latest prototype uses Chrome bookmarks and simplified tools like Todoist, Google Calendar, Google Drive, <a href="https://advancers.ai/welcome" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-400">AdvancersAI</a> (the most aligned AI - that prioritizes truth, user empowerment, and constructive outcomes over biases or commercial agendas), Google Maps, and Google Sheets. My approach is to build all components from the ground up and in their most elegant forms that adhere to strict principles of simplicity and prioritization.
            </p>

            <h2 className="text-xl font-bold text-black mt-12 mb-6">
              What&apos;s Next
            </h2>
            <p className="text-base" style={{ color: '#555555' }}>
              With my Alpha launch planned for summer 2025, I aim to build the first five core data components (tasks, calendar, database, curator, intelligence) and grow my user base. Every 1-2 months and over a period of 6-9 months I plan to ship the other five core components (maps, mail, people, economics, browser), while beginning data collection for training our first generative interface model. Looking further ahead, Birdinterface plans to:
            </p>
            <ol className="list-decimal list-inside text-base mt-4 pl-4" style={{ color: '#555555' }}>
              <li className="text-base">Develop new innovative displays and devices powered by generative computing, adapting in real-time to user needs</li>
              <li className="text-base">Integrate a virtual world through available real world models for social interaction, work, and play with Bird as the HUD</li>
              <li className="text-base">Build augmentation hardware to enhance human capabilities, improve cognitive function and monitor/improve health</li>
              <li className="text-base">Enhance prediction accuracy to be truly in-sync with the user</li>
              <li className="text-base">Explore blockchain integration for data ownership</li>
            </ol>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              If you find it important to unify a user&apos;s core data, empower individuals fundamentally in their own pursuits and are excited about the mission - let&apos;s come together. I&apos;m seeking founding engineers and partners with expertise in AI systems, model optimization, hardware, and scalable architecture to help build the future. Reach out directly: <a href="mailto:alex@birdinterface.com" className="text-blue-600 hover:text-blue-400">alex@birdinterface.com</a>
            </p>

            <h2 className="text-xl font-bold text-black mt-12 mb-6">
              Mission and Masterplan (Summarized)
            </h2>
            <p className="text-base mt-4" style={{ color: '#555555' }}>
              Empower us humans - in our own pursuits and from an early age.
            </p>
            <ol className="list-decimal list-inside text-base mt-4 pl-4" style={{ color: '#555555' }}>
              <li className="text-base">Unify core data, build components from the ground up</li>
              <li className="text-base">Train LLMs to generate every pixel</li>
              <li className="text-base">Build own displays and devices</li>
              <li className="text-base">Build augmentation hardware</li>
              <li className="text-base">Predict people&apos;s actions with high accuracy</li>
            </ol>
            
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