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
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative">
      <div 
        className="absolute inset-0" 
                      style={{ 
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative w-64 h-64 mb-8 z-10">
                              <Image
          src="/images/Birdwhite.png"
          alt="Bird Interface Logo"
          layout="fill"
          objectFit="contain"
          priority
        />
      </div>
      <h2 className="text-white text-2xl font-light z-10">Something great is coming.</h2>
    </div>
  );
};

export default Welcome; 