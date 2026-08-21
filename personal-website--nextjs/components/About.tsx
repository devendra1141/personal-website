"use client";

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    gsap.registerPlugin(ScrollTrigger);
    
    if (containerRef.current) {
      // Section number slides in from left with underline wipe
      if (numberRef.current) {
        gsap.fromTo(numberRef.current,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
            },
            onComplete: () => {
              numberRef.current?.classList.add('revealed');
            }
          }
        );
      }

      // Word-by-word stagger on the about copy
      if (copyRef.current) {
        const wordInners = copyRef.current.querySelectorAll('.word-inner');
        gsap.to(wordInners, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
          }
        });
      }

      // Social links fade in with stagger
      if (socialsRef.current) {
        const links = socialsRef.current.querySelectorAll('.social-link');
        gsap.fromTo(links,
          { opacity: 0, x: -20 },
          {
            opacity: 0.7,
            x: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: socialsRef.current,
              start: 'top 85%',
            }
          }
        );
      }
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSteamClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  // Split text into word spans for stagger animation
  const renderWords = (text: string) => {
    return text.split(' ').map((word, i) => (
      <span key={i} className="word">
        <span className="word-inner">{word}</span>
      </span>
    ));
  };

  const aboutText = "I'm a commerce senior navigating through college life. Beyond the books, I'm a huge networking geek and a passionate gamer always looking for the next adventure.";

  return (
    <>
      <section className="about section-container" aria-label="About Devendra" ref={containerRef}>
        <p className="section-number" ref={numberRef}>01 / ABOUT</p>
        <p className="about-copy" ref={copyRef}>
          {renderWords(aboutText)}
        </p>
        <div className="about-socials" ref={socialsRef}>
          <a 
            href="https://steamcommunity.com/profiles/76561199100453343/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="social-link interactive"
            onClick={handleSteamClick}
          >
            Steam
          </a>
          <div className="social-link interactive">
            hello_world.java
          </div>
        </div>
      </section>
      
      {modalOpen && (
        <div 
          className="steam-modal-overlay" 
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '0.5rem' : '0',
          }}
        >
          <div 
            className="steam-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: isMobile ? '96%' : '80%',
              maxWidth: '1000px',
              height: isMobile ? '85vh' : '80vh',
              background: '#1b2838',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: isMobile ? '8px' : '12px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <button 
              className="interactive"
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: '1.2rem', cursor: 'pointer', zIndex: 10,
                width: '44px', height: '44px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
            <iframe 
              src="https://steamcommunity.com/profiles/76561199100453343/" 
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Steam Profile"
            />
          </div>
        </div>
      )}
    </>
  );
}
