"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import BlackHoleScene from './BlackHoleScene';

export default function BlackHoleIntro() {
  const [isFinished, setIsFinished] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent scrolling during intro
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClick = () => {
    if (hasClicked) return;
    setHasClicked(true);

    if (textRef.current) {
      gsap.to(textRef.current, { opacity: 0, duration: 0.5, ease: 'power2.out' });
    }

    const progressObj = { value: 0 };
    const maskObj = { radius: -20 }; // Start below 0 so there's no abrupt hole
    
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        setIsFinished(true);
      }
    });

    // 1. Animate the sphere burst (progress goes 0 -> 1)
    tl.to(progressObj, {
      value: 1,
      duration: 5,
      ease: 'power1.inOut',
      onUpdate: () => {
        setProgress(progressObj.value);
      }
    }, 0);

    // 2. Animate the hole opening in the background to reveal the website from inside the sphere
    tl.to(maskObj, {
      radius: 150, // Expand hole to 150% to cover the whole screen
      duration: 4,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (bgRef.current) {
          // A softer transparent circle in the center that grows, starting completely closed
          const r = maskObj.radius;
          const maskString = `radial-gradient(circle, transparent ${r}%, black ${r + 20}%)`;
          bgRef.current.style.maskImage = maskString;
          (bgRef.current.style as any).webkitMaskImage = maskString;
        }
      }
    }, 0); // Start expanding the hole immediately on click

    // 3. Just as a fallback, fade out the whole container at the very end to remove the DOM cleanly
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 1.0,
      ease: 'power2.inOut'
    }, "-=1.0");
  };

  if (isFinished) return null;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        cursor: hasClicked ? 'default' : 'pointer',
      }}
    >
      {/* Solid background with expanding hole mask to reveal website from inside */}
      <div 
        ref={bgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#02050f',
          zIndex: 1,
          WebkitMaskImage: 'radial-gradient(circle, transparent 0%, black 0%)',
          maskImage: 'radial-gradient(circle, transparent 0%, black 0%)'
        }}
      />

      <div 
        ref={textRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.875rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          zIndex: 10,
          fontFamily: 'sans-serif'
        }}
      >
        Click Me
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}>
        <Canvas
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1}
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ alpha: true, antialias: false }} // alpha: true so canvas is transparent
        >
          <BlackHoleScene progress={progress} />
        </Canvas>
      </div>
    </div>
  );
}
