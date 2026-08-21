"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 24;
const BIRD_X = 80;
const GRAVITY = 0.45;
const JUMP_FORCE = -7.5;
const PIPE_WIDTH = 52;
const PIPE_GAP = 150;
const PIPE_SPEED = 2.5;
const PIPE_SPAWN_INTERVAL = 1800;

interface Pipe {
  x: number;
  topHeight: number;
  scored: boolean;
}

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const birdY = useRef(CANVAS_HEIGHT / 2);
  const birdVelocity = useRef(0);
  const pipes = useRef<Pipe[]>([]);
  const score = useRef(0);
  const bestScore = useRef(0);
  const gameState = useRef<'idle' | 'playing' | 'dead'>('idle');
  const lastPipeSpawn = useRef(0);
  const frameCount = useRef(0);
  
  const [displayScore, setDisplayScore] = useState(0);
  const [displayBest, setDisplayBest] = useState(0);
  const [uiState, setUiState] = useState<'idle' | 'playing' | 'dead'>('idle');
  const [canvasScale, setCanvasScale] = useState(1);

  // Responsive canvas scaling
  useEffect(() => {
    const updateScale = () => {
      const maxW = Math.min(window.innerWidth - 32, CANVAS_WIDTH);
      const maxH = Math.min(window.innerHeight - 200, CANVAS_HEIGHT);
      const scale = Math.min(maxW / CANVAS_WIDTH, maxH / CANVAS_HEIGHT, 1);
      setCanvasScale(scale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Load best score
  useEffect(() => {
    const saved = localStorage.getItem('flappy-best');
    if (saved) {
      bestScore.current = parseInt(saved, 10);
      setDisplayBest(bestScore.current);
    }
  }, []);

  const resetGame = useCallback(() => {
    birdY.current = CANVAS_HEIGHT / 2;
    birdVelocity.current = 0;
    pipes.current = [];
    score.current = 0;
    lastPipeSpawn.current = 0;
    frameCount.current = 0;
    setDisplayScore(0);
  }, []);

  const jump = useCallback(() => {
    if (gameState.current === 'idle') {
      resetGame();
      gameState.current = 'playing';
      setUiState('playing');
      birdVelocity.current = JUMP_FORCE;
    } else if (gameState.current === 'playing') {
      birdVelocity.current = JUMP_FORCE;
    } else if (gameState.current === 'dead') {
      resetGame();
      gameState.current = 'playing';
      setUiState('playing');
      birdVelocity.current = JUMP_FORCE;
    }
  }, [resetGame]);

  // Input handlers
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const gameLoop = () => {
      frameCount.current++;

      // ─── Update ───
      if (gameState.current === 'playing') {
        // Bird physics
        birdVelocity.current += GRAVITY;
        birdY.current += birdVelocity.current;

        // Spawn pipes
        if (frameCount.current - lastPipeSpawn.current > PIPE_SPAWN_INTERVAL / 16.67) {
          const minTop = 60;
          const maxTop = CANVAS_HEIGHT - PIPE_GAP - 60;
          const topHeight = minTop + Math.random() * (maxTop - minTop);
          pipes.current.push({ x: CANVAS_WIDTH, topHeight, scored: false });
          lastPipeSpawn.current = frameCount.current;
        }

        // Move pipes
        for (const pipe of pipes.current) {
          pipe.x -= PIPE_SPEED;

          // Score
          if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X) {
            pipe.scored = true;
            score.current++;
            setDisplayScore(score.current);
          }
        }

        // Remove off-screen pipes
        pipes.current = pipes.current.filter(p => p.x > -PIPE_WIDTH);

        // Collision detection
        const birdTop = birdY.current - BIRD_SIZE / 2;
        const birdBottom = birdY.current + BIRD_SIZE / 2;
        const birdLeft = BIRD_X - BIRD_SIZE / 2;
        const birdRight = BIRD_X + BIRD_SIZE / 2;

        // Floor/ceiling
        if (birdBottom > CANVAS_HEIGHT - 40 || birdTop < 0) {
          gameState.current = 'dead';
          setUiState('dead');
          if (score.current > bestScore.current) {
            bestScore.current = score.current;
            setDisplayBest(bestScore.current);
            localStorage.setItem('flappy-best', String(bestScore.current));
          }
        }

        // Pipes
        for (const pipe of pipes.current) {
          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + PIPE_WIDTH;

          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
              gameState.current = 'dead';
              setUiState('dead');
              if (score.current > bestScore.current) {
                bestScore.current = score.current;
                setDisplayBest(bestScore.current);
                localStorage.setItem('flappy-best', String(bestScore.current));
              }
            }
          }
        }
      }

      // ─── Draw ───
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGrad.addColorStop(0, '#0a0a1a');
      skyGrad.addColorStop(0.6, '#0d1117');
      skyGrad.addColorStop(1, '#161b22');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let i = 0; i < 30; i++) {
        const sx = (i * 137 + frameCount.current * 0.1) % CANVAS_WIDTH;
        const sy = (i * 97) % (CANVAS_HEIGHT - 100);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Ground
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);
      ctx.fillStyle = '#16213e';
      ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 3);

      // Ground pattern
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for (let gx = -(frameCount.current * 2) % 20; gx < CANVAS_WIDTH; gx += 20) {
        ctx.fillRect(gx, CANVAS_HEIGHT - 37, 10, 37);
      }

      // Pipes
      for (const pipe of pipes.current) {
        // Pipe gradient
        const pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        pipeGrad.addColorStop(0, '#00d4aa');
        pipeGrad.addColorStop(0.5, '#00f0cc');
        pipeGrad.addColorStop(1, '#00b894');

        // Top pipe
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        // Top pipe cap
        ctx.fillStyle = '#00f0cc';
        ctx.fillRect(pipe.x - 4, pipe.topHeight - 20, PIPE_WIDTH + 8, 20);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(pipe.x - 4, pipe.topHeight - 20, PIPE_WIDTH + 8, 20);

        // Bottom pipe
        ctx.fillStyle = pipeGrad;
        const bottomY = pipe.topHeight + PIPE_GAP;
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - bottomY - 40);
        // Bottom pipe cap
        ctx.fillStyle = '#00f0cc';
        ctx.fillRect(pipe.x - 4, bottomY, PIPE_WIDTH + 8, 20);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeRect(pipe.x - 4, bottomY, PIPE_WIDTH + 8, 20);

        // Pipe shine
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(pipe.x + 6, 0, 4, pipe.topHeight);
        ctx.fillRect(pipe.x + 6, bottomY, 4, CANVAS_HEIGHT - bottomY - 40);
      }

      // Bird
      const birdAngle = Math.min(Math.max(birdVelocity.current * 3, -30), 90) * (Math.PI / 180);
      ctx.save();
      ctx.translate(BIRD_X, birdY.current);
      ctx.rotate(birdAngle);

      // Body
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(0, 0, BIRD_SIZE / 2 + 2, BIRD_SIZE / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Body glow
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Wing
      const wingFlap = Math.sin(frameCount.current * 0.3) * 4;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(-4, wingFlap, 8, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(6, -4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(7.5, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(BIRD_SIZE / 2, -2);
      ctx.lineTo(BIRD_SIZE / 2 + 8, 1);
      ctx.lineTo(BIRD_SIZE / 2, 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Score (in-game)
      if (gameState.current === 'playing') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 4;
        ctx.strokeText(String(score.current), CANVAS_WIDTH / 2, 70);
        ctx.fillText(String(score.current), CANVAS_WIDTH / 2, 70);
      }

      // Idle screen
      if (gameState.current === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#00f0cc';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FLAPPY BIRD', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '16px monospace';
        ctx.fillText('TAP or SPACE to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
        
        // Bobbing bird animation on idle
        birdY.current = CANVAS_HEIGHT / 2 + Math.sin(frameCount.current * 0.05) * 15;
      }

      // Dead screen
      if (gameState.current === 'dead') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.fillText(`Score: ${score.current}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 15);
        
        ctx.fillStyle = '#fbbf24';
        ctx.font = '16px monospace';
        ctx.fillText(`Best: ${bestScore.current}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '14px monospace';
        ctx.fillText('TAP or SPACE to retry', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#020202',
      color: '#fff',
      fontFamily: '"Outfit", monospace',
      padding: '1rem',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 'clamp(1rem, 3vw, 2rem)',
        left: 'clamp(1rem, 3vw, 2rem)',
      }}>
        <Link
          href="/"
          className="interactive"
          style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            opacity: 0.7,
            transition: 'opacity 0.3s',
          }}
        >
          ← Back
        </Link>
      </div>

      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
          letterSpacing: '0.15em',
          color: '#00f0cc',
          margin: '0 0 0.5rem',
          fontFamily: 'monospace',
        }}>
          FLAPPY BIRD
        </h1>
        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
          opacity: 0.7,
          fontFamily: 'monospace',
        }}>
          <span>Score: {displayScore}</span>
          <span>Best: {displayBest}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={jump}
        onTouchStart={(e) => {
          e.preventDefault();
          jump();
        }}
        style={{
          width: CANVAS_WIDTH * canvasScale,
          height: CANVAS_HEIGHT * canvasScale,
          borderRadius: '8px',
          border: '1px solid rgba(0,240,204,0.2)',
          cursor: 'pointer',
          touchAction: 'none',
        }}
      />

      <p style={{
        marginTop: '1rem',
        fontSize: 'clamp(0.65rem, 1.8vw, 0.8rem)',
        opacity: 0.4,
        fontFamily: 'monospace',
        textAlign: 'center',
      }}>
        Press SPACE or tap to flap
      </p>
    </div>
  );
}
