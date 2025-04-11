"use client";

import { Bold } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';

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
      <div className="min-h-screen flex flex-col items-center justify-start pt-32 bg-black relative">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative w-64 h-64 mb-2 z-10">
          <Image
            src="/images/Birdwhite.png"
            alt="Bird Interface Logo"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>
        <h1 className="text-white text-3xl font-light z-10 mb-12">An intelligent personal interface.</h1>
        
        <form onSubmit={handleSubmit} className="z-10 w-full max-w-md px-4">
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
    </>
  );
};

export default Welcome; 