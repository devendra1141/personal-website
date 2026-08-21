"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function Contact() {
  const containerRef = useRef<HTMLElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (containerRef.current) {
      // Section number reveal
      const sectionNum = containerRef.current.querySelector('.section-number');
      if (sectionNum) {
        gsap.fromTo(sectionNum,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
            },
            onComplete: () => {
              (sectionNum as HTMLElement).classList.add('revealed');
            }
          }
        );
      }

      // Letter-by-letter stagger on heading
      const letters = containerRef.current.querySelectorAll('.contact-letter');
      gsap.to(letters, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.02,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      });

      // Email link fade in
      if (emailRef.current) {
        gsap.fromTo(emailRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
            }
          }
        );
      }
    }

    // Magnetic hover effect on email link
    const emailEl = emailRef.current;
    if (!emailEl) return;

    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = emailEl.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(emailEl, {
        x: x * 0.15,
        y: y * 0.15,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(emailEl, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    emailEl.addEventListener('mousemove', handleMouseMove);
    emailEl.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      emailEl.removeEventListener('mousemove', handleMouseMove);
      emailEl.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Split heading text into letter spans, preserving <br>
  const renderHeadingLetters = () => {
    const line1 = "Let's connect and";
    const line2 = "talk.";
    
    return (
      <>
        {line1.split('').map((char, i) => (
          <span key={`l1-${i}`} className="contact-letter">
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
        <br />
        {line2.split('').map((char, i) => (
          <span key={`l2-${i}`} className="contact-letter">
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </>
    );
  };

  return (
    <section className="contact section-container" aria-labelledby="contact-title" ref={containerRef}>
      <p className="section-number">02 / CONTACT</p>
      <h2 id="contact-title">
        {renderHeadingLetters()}
      </h2>
      <a className="email-link interactive" href="mailto:contact.me@devendrapandey.in" ref={emailRef}>
        contact.me@devendrapandey.in <span>↗</span>
      </a>
    </section>
  );
}
