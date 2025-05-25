'use client';

import React, { useState, useEffect } from 'react';

import styles from './GrainyGradientGlow.module.css';

interface Flare {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

const GrainyGradientGlow: React.FC = () => {
  const [flares, setFlares] = useState<Flare[]>([]);

  const defaultFlareSize = 450;
  const whiteFlareSize = 330;
  const updateInterval = 1000; // Faster update interval (1 second)

  useEffect(() => {
    const baseColors = ['#333333', '#666666', '#999999', '#cccccc', '#ffffff']; // Grayscale colors
    const initialFlares: Flare[] = baseColors.map((color, index) => ({
      id: index,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      color: color,
      // Set size based on color
      size: color === '#f0f0f0' ? whiteFlareSize : defaultFlareSize,
    }));
    setFlares(initialFlares);

    const intervalId = setInterval(() => {
      setFlares((prevFlares) =>
        prevFlares.map((flare) => {
          // Reduce the magnitude of random movement for smoother paths
          const horizontalMove = 8; 
          const verticalMove = 15;   
          // Keep the strong center pull
          const centerPull = 0.1; 

          const randomX = (Math.random() - 0.5) * horizontalMove;
          const randomY = (Math.random() - 0.5) * verticalMove;

          const pullX = (50 - flare.x) * centerPull;
          const pullY = (50 - flare.y) * centerPull;

          const nextX = flare.x + randomX + pullX;
          const nextY = flare.y + randomY + pullY;

          return {
            ...flare,
            // Reduce boundaries to keep flares more central (e.g., 30-70 range)
            x: Math.max(30, Math.min(70, nextX)),
            y: Math.max(30, Math.min(70, nextY)),
          }
        })
      );
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.grainyGradientContainer}>
      <div className={styles.flaresContainer}>
        {flares.map((flare) => (
          <div
            key={flare.id}
            className={styles.flare}
            style={{
              left: `${flare.x}%`,
              top: `${flare.y}%`,
              width: `${flare.size}px`,
              height: `${flare.size}px`,
              backgroundColor: flare.color,
              boxShadow: `0 0 ${flare.size / 2}px ${flare.size / 4}px ${flare.color}`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GrainyGradientGlow; 