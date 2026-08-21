"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (footerRef.current) {
      gsap.fromTo(footerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 0.5,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 95%',
          }
        }
      );
    }
  }, []);

  return (
    <footer ref={footerRef} style={{ opacity: 0 }}>
      <span>© {currentYear} Devendra Pandey</span>
      <span>Made somewhere between class and a deadline.</span>
    </footer>
  );
}
