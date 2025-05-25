'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { MessageIcon, VercelIcon } from './icons';
import { preloadImages, preloadDataUrls } from '../../utils/preloadImages';

// Call the preload function
preloadImages();
preloadDataUrls();

export const Overview = () => {
  useEffect(() => {
    preloadImages();
    preloadDataUrls();
  }, []);

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl flex flex-col leading-relaxed text-center max-w-xl">
        <h1 className="text-4xl flex flex-col items-center">
          <Image src="/images/blur.png" alt="Blur effect" className="size-[300px]" style={{ filter: 'blur(35px)' }} draggable={false} width={300} height={300} />
        </h1>
      </div>
    </motion.div>
  );
};



