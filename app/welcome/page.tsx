"use client";

import { Bold } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import GrainyGradientGlow from '@/app/components/GrainyGradientGlow';

import '../../public/css/normalize.css';
import '../../public/css/webflow.css';
import '../../public/css/advancers-club-ef3cf37311bfc4b53cc064fc.webflow.css';
import '../../public/css/stars.css';

import { PreloadImages } from '@/components/PreloadImages';
import { criticalImages } from '@/lib/images';

const Welcome = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      <div className="relative w-full h-[100dvh]">
        {/* Background Layer (Black + Dot Grid) */}
        <div 
          className="absolute inset-0 bg-black z-0" 
        >
           <div 
            className="absolute inset-0" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>

        {/* Glow Layer (Flares) */} 
        <div className="absolute inset-0 z-10"> 
           <GrainyGradientGlow />
        </div>
        
        {/* Image Grain Overlay Layer (Using <img> tag) */}
        <img 
          src="/images/white_particles_transparent_1920x1080 (1).png" 
          alt="Grain texture" 
          className="absolute inset-0 w-full h-full object-cover z-40 pointer-events-none" // Highest z-index, scales with container
          style={{ 
            opacity: 0.10, // Keeping the user's last opacity
            // Simplified filter aiming for yellow:
            filter: 'grayscale(1) sepia(1) saturate(400%) hue-rotate(-25deg) brightness(1.3)', 
            // Explanation: grayscale->sepia base->saturate->hue-rotate towards yellow->adjust brightness
          }}
        />

        {/* Content Layer (z-index 30, now below grain) */}
        <div className="absolute inset-0 h-[100dvh] flex flex-col items-center justify-start pt-32 overflow-hidden z-30">
          {/* Removed bg-black, z-index handled by parent */}
          <div className="relative w-64 h-64 mb-9"> {/* z-index within this layer if needed */}
            <Image
              src="/images/Birdwhite.png"
              alt="Bird Interface Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
          <h1 className="text-white text-3xl font-light mb-12 text-center px-4 max-w-2xl mx-auto">An intelligent personal interface.</h1>
          
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