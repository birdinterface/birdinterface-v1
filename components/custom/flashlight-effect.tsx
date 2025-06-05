"use client";
import React, { useState, useEffect } from 'react';

const FlashlightEffect: React.FC = () => {
  const [position, setPosition] = useState({ x: -200, y: -200 }); // Initial position off-screen

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Since the flashlight div is fixed positioned, we use viewport coordinates directly
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleMouseLeave = () => {
      setPosition({ x: -200, y: -200 }); // Move off-screen when mouse leaves
    };

    // Add event listeners to the window for global mouse tracking
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(
          circle at ${position.x}px ${position.y}px,
          rgba(200, 200, 255, 0.2) 0px,    /* Light purple-blue-white center */
          rgba(180, 180, 245, 0.15) 50px,  /* Soft purple-blue */
          rgba(160, 160, 225, 0.1) 100px,  /* Purple-blue transition */
          rgba(140, 140, 205, 0.05) 150px, /* Smokey purple-blue */
          rgba(120, 120, 185, 0.02) 200px, /* Fading purple-blue smoke */
          transparent 225px                /* Completely transparent */
        )`,
      }}
    />
  );
};

export default FlashlightEffect; 