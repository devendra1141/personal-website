"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

export function ConsentBanner() {
  const { consentGiven, setConsent } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || consentGiven !== null) {
    return null;
  }

  return (
    <div className="consent-banner">
      <p>Can we save your theme preference in your browser?</p>
      <div className="consent-actions">
        <button className="consent-btn yes interactive" onClick={() => setConsent(true)}>Sure</button>
        <button className="consent-btn no interactive" onClick={() => setConsent(false)}>No thanks</button>
      </div>
    </div>
  );
}
