"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTheme, Theme } from './ThemeProvider';
import gsap from 'gsap';

const themeLabels: Record<Theme, string> = {
  network: 'Network',
  rdr2: 'Red Dead 2',
  lis: 'Life is Strange',
  cyberpunk: 'Cyberpunk',
  sifu: 'Sifu',
  cozy: 'Cozy',
  ocean: 'Ocean',
  forest: 'Forest',
  light: 'Light',
  dark: 'Dark'
};

export function Header() {
  const { theme, setTheme, themes } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Close dropdown when tapping outside on mobile
  const handleClickOutside = useCallback((e: MouseEvent | TouchEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    const mobile = window.matchMedia('(pointer: coarse)').matches;
    setIsMobile(mobile);

    // Entrance animation — slide in from top with opacity
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.3,
        }
      );
    }

    // Add/remove scrolled class for backdrop blur on scroll
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 100) {
          headerRef.current.classList.add('scrolled');
        } else {
          headerRef.current.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleThemeButtonClick = () => {
    if (isMobile) {
      // On mobile: toggle dropdown open/close
      setMenuOpen(prev => !prev);
    } else {
      // On desktop: cycle to next theme
      handleToggle();
    }
  };

  return (
    <header className="site-header" ref={headerRef} style={{ opacity: 0 }}>
      <Link href="/game" className="wordmark interactive">
        DP.
      </Link>
      <div className="nav-actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div 
          className="theme-dropdown" 
          ref={dropdownRef}
          onMouseEnter={() => !isMobile && setMenuOpen(true)}
          onMouseLeave={() => !isMobile && setMenuOpen(false)}
          style={{ position: 'relative' }}
        >
          <button 
            className="interactive"
            onClick={handleThemeButtonClick}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.5rem',
              opacity: 0.8,
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🌓
          </button>
          
          <div 
            className="theme-menu" 
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'rgba(10, 10, 10, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '0.5rem',
              display: menuOpen ? 'flex' : 'none',
              flexDirection: 'column',
              gap: '0.2rem',
              minWidth: '160px'
            }}
          >
            {themes.map((t) => (
              <button 
                key={t}
                className="interactive"
                onClick={() => {
                  setTheme(t);
                  setMenuOpen(false);
                }}
                style={{
                  background: t === theme ? 'rgba(255,255,255,0.15)' : 'none',
                  border: 'none',
                  color: t === theme ? 'var(--accent)' : '#fff',
                  textAlign: 'left',
                  padding: '0.6rem 1rem',
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: t === theme ? 600 : 400,
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  minHeight: '40px',
                }}
              >
                {themeLabels[t]}
              </button>
            ))}
          </div>
        </div>
        
        <a className="nav-contact interactive" href="mailto:contact.me@devendrapandey.in">
          Say hello <span>↗</span>
        </a>
      </div>
    </header>
  );
}

