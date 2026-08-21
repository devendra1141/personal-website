"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!titleRef.current || !heroRef.current) return;

    const tl = gsap.timeline({ delay: 0.5 });

    // Animate each letter with a stagger
    const letters = titleRef.current.querySelectorAll('.letter');
    tl.to(letters, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.03,
      ease: 'power4.out',
    });

    // Fade in the intro paragraph with a slight upward drift
    tl.to('.intro', {
      opacity: 0.8,
      y: 0,
      duration: 1.2,
      ease: 'power2.out',
    }, '-=0.4');

    // Fade in the scroll indicator
    tl.to('.scroll-indicator', {
      opacity: 0.5,
      duration: 1,
      ease: 'power2.out',
    }, '-=0.8');

    // Subtle floating animation on intro text
    gsap.to('.intro', {
      y: -6,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 2.5,
    });

  }, []);

  // Helper to split text into individual letter spans
  const renderLetters = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} className="letter">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <section className="hero section-container" id="top" ref={heroRef}>
      <h1 ref={titleRef}>
        <span className="line-wrapper">
          <span className="line" style={{ transform: 'none' }}>
            {renderLetters('Devendra')}
          </span>
        </span>
        <span className="line-wrapper">
          <span className="line" style={{ transform: 'none' }}>
            {renderLetters('Pandey.')}
          </span>
        </span>
      </h1>
      
      <div className="hero-bottom">
        <p className="intro" style={{ transform: 'translateY(20px)' }}>
          Welcome to my corner of the web. I'm a student blending the worlds of commerce, networking, and creative development to build immersive digital experiences.
        </p>
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </div>
    </section>
  );
}
