"use client";

import { useEffect, useState } from "react";

export const MovingBackground = () => {
  const [positions, setPositions] = useState<{ 
    x: number; 
    y: number; 
    orbit: number; 
    angle: number; 
    speed: number; 
    color: number;
  }[]>([]);

  useEffect(() => {
    const calculateImages = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const orbits = 4; // Number of circular orbits
      const baseItemsPerOrbit = 8; // Base number of logos for the innermost orbit
      
      const newPositions = [];
      
      for (let orbit = 0; orbit < orbits; orbit++) {
        const radius = 100 + (orbit * 100); // Increasing radius for each orbit
        const itemsPerOrbit = baseItemsPerOrbit + (orbit * 4); // Increase items as orbit grows
        
        for (let i = 0; i < itemsPerOrbit; i++) {
          const angle = (i * 2 * Math.PI) / itemsPerOrbit;
          newPositions.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            orbit: radius,
            angle: angle,
            speed: orbit % 2 === 0 ? 0.001 : -0.001, // Alternate direction
            color: Math.floor(Math.random() * 0xFFFFFF)
          });
        }
      }

      setPositions(newPositions);
    };

    calculateImages();
    window.addEventListener('resize', calculateImages);

    let animationId: number;
    const animate = () => {
      setPositions(prev => prev.map(pos => {
        const newAngle = pos.angle + pos.speed;
        return {
          ...pos,
          angle: newAngle,
          x: window.innerWidth/2 + pos.orbit * Math.cos(newAngle),
          y: window.innerHeight/2 + pos.orbit * Math.sin(newAngle),
        };
      }));
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', calculateImages);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute w-24 h-24"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="-2 -2 36 36" fill="none"><path d="M15.9999 0C11.3795 0 0 11.3792 0 15.9999C0 20.6206 11.3795 32 15.9999 32C20.6203 32 32 20.6204 32 15.9999C32 11.3794 20.6205 0 15.9999 0ZM13.5066 25.1492C11.5582 24.6183 6.31981 15.455 6.85083 13.5066C7.38185 11.5581 16.545 6.31979 18.4933 6.8508C20.4418 7.38173 25.6802 16.5449 25.1492 18.4934C24.6182 20.4418 15.455 25.6802 13.5066 25.1492Z" fill={`#${pos.color.toString(16).padStart(6, '0')}`}/></svg>
        </div>
      ))}
    </div>
  );
}; 