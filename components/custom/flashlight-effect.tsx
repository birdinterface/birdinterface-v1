"use client";
import React, { useState, useEffect, useRef } from 'react';
const FlashlightEffect: React.FC = () => {
  const [position, setPosition] = useState({ x: -200, y: -200 }); // Initial position off-screen
  const heroRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Try to find the hero section by a known class or ID if possible
    // For now, let's assume the parent it's directly placed into is the intended hero section container
    // Or, ideally, pass a ref to the hero section if this component is used more generally.
    // This example will attach the listener to the window for simplicity,
    // but for a specific hero section, it's better to attach to that element.
    const heroElement = document.querySelector('.hero-section-for-flashlight'); // Added a marker class
    if (heroElement) {
      heroRef.current = heroElement as HTMLDivElement;
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        // Fallback to window-relative coordinates if hero section not found
        setPosition({ x: e.clientX, y: e.clientY });
      }
    };
    const currentHeroRef = heroRef.current;
    if (currentHeroRef) {
      currentHeroRef.addEventListener('mousemove', handleMouseMove);
      currentHeroRef.addEventListener('mouseleave', () => {
        setPosition({ x: -200, y: -200 }); // Move off-screen when mouse leaves
      });
      return () => {
        currentHeroRef.removeEventListener('mousemove', handleMouseMove);
        currentHeroRef.removeEventListener('mouseleave', () => {
          setPosition({ x: -200, y: -200 });
        });
      };
    } else {
      // If hero section isn't specifically targeted, use window
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(
          circle at ${position.x}px ${position.y}px,
          rgba(255, 255, 255, 0.15) 0px,    /* Softer, less intense center */
          rgba(255, 255, 255, 0.1) 75px,   /* Wider core light area with softer intensity */
          rgba(255, 255, 255, 0.05) 150px,  /* Start of a very soft, broad vignette */
          rgba(255, 255, 255, 0.01) 200px, /* Further softening the edge */
          transparent 225px               /* Completely transparent at 225px radius (450px diameter) */
        )`,
      }}
    />
  );
};
export default FlashlightEffect; 