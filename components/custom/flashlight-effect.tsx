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