"use client";

import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Image as DreiImage } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme, Theme } from './ThemeProvider';

const themeConfigs: Record<Theme, {
  colorA: [number, number, number],
  colorB: [number, number, number],
  particleCount: number,
  speed: number,
  plexus: boolean,
  maxDistance: number,
  bgImage?: string
}> = {
  network: { colorA: [0.5, 0.9, 0.6], colorB: [0.35, 0.9, 0.6], particleCount: 120, speed: 0.05, plexus: true, maxDistance: 4.5 },
  cyberpunk: { colorA: [0.95, 0.9, 0.5], colorB: [0.15, 0.9, 0.5], particleCount: 150, speed: 0.06, plexus: false, maxDistance: 0, bgImage: '/cyberpunk.jpg' },
  rdr2: { colorA: [0.05, 0.9, 0.5], colorB: [0.1, 0.9, 0.6], particleCount: 400, speed: 0.02, plexus: false, maxDistance: 0, bgImage: '/rdr2.png' },
  lis: { colorA: [0.12, 0.8, 0.6], colorB: [0.08, 0.7, 0.5], particleCount: 300, speed: 0.015, plexus: false, maxDistance: 0, bgImage: '/lis-room.png' },
  sifu: { colorA: [0.98, 0.8, 0.5], colorB: [0.0, 0.0, 1.0], particleCount: 350, speed: 0.03, plexus: false, maxDistance: 0, bgImage: '/sifu.jpg' },
  cozy: { colorA: [0.09, 0.9, 0.6], colorB: [0.05, 0.8, 0.5], particleCount: 300, speed: 0.01, plexus: false, maxDistance: 0 },
  ocean: { colorA: [0.55, 0.9, 0.5], colorB: [0.65, 0.9, 0.7], particleCount: 350, speed: 0.02, plexus: false, maxDistance: 0 },
  forest: { colorA: [0.3, 0.8, 0.5], colorB: [0.2, 0.9, 0.4], particleCount: 400, speed: 0.01, plexus: false, maxDistance: 0 },
  light: { colorA: [0, 0, 0.8], colorB: [0, 0, 0.9], particleCount: 150, speed: 0.02, plexus: true, maxDistance: 3.5 },
  dark: { colorA: [0, 0, 0.3], colorB: [0, 0, 0.5], particleCount: 150, speed: 0.02, plexus: true, maxDistance: 3.5 }
};

function ThematicScene({ theme, isMobile }: { theme: Theme; isMobile: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const imageRef = useRef<any>(null);
  const { mouse, viewport } = useThree();
  
  const config = themeConfigs[theme];
  // Halve particle count on mobile for performance
  const particleCount = isMobile ? Math.floor(config.particleCount / 2) : config.particleCount;

  const [positions, velocities, colors] = useMemo(() => {
    const count = particleCount;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = [];
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
      
      vel.push(new THREE.Vector3(
        (Math.random() - 0.5) * config.speed,
        (Math.random() - 0.5) * config.speed,
        (Math.random() - 0.5) * config.speed
      ));

      const c = new THREE.Color();
      if (Math.random() > 0.5) {
        c.setHSL(...config.colorA);
      } else {
        c.setHSL(...config.colorB);
      }
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, vel, col];
  }, [config, particleCount]);

  const lineGeometry = useMemo(() => {
    if (!config.plexus) return null;
    const geo = new THREE.BufferGeometry();
    const maxLines = (particleCount * (particleCount - 1)) / 2;
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxLines * 6), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(maxLines * 6), 3));
    return geo;
  }, [config, particleCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const posAttribute = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttribute.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] += velocities[i].x;
      posArray[i * 3 + 1] += velocities[i].y;
      posArray[i * 3 + 2] += velocities[i].z;

      if (posArray[i * 3] > 17.5) posArray[i * 3] = -17.5;
      if (posArray[i * 3] < -17.5) posArray[i * 3] = 17.5;
      if (posArray[i * 3 + 1] > 17.5) posArray[i * 3 + 1] = -17.5;
      if (posArray[i * 3 + 1] < -17.5) posArray[i * 3 + 1] = 17.5;
      if (posArray[i * 3 + 2] > 7.5) posArray[i * 3 + 2] = -7.5;
      if (posArray[i * 3 + 2] < -7.5) posArray[i * 3 + 2] = 7.5;
    }
    posAttribute.needsUpdate = true;

    if (config.plexus && linesRef.current && lineGeometry) {
      const linePosAttr = lineGeometry.attributes.position as THREE.BufferAttribute;
      const lineColorAttr = lineGeometry.attributes.color as THREE.BufferAttribute;
      const linePosArray = linePosAttr.array as Float32Array;
      const lineColorArray = lineColorAttr.array as Float32Array;
      
      let vertexpos = 0;
      let colorpos = 0;
      let numConnected = 0;

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = posArray[i * 3] - posArray[j * 3];
          const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
          const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < config.maxDistance * config.maxDistance) {
            const alpha = 1.0 - (distSq / (config.maxDistance * config.maxDistance));
            
            linePosArray[vertexpos++] = posArray[i * 3];
            linePosArray[vertexpos++] = posArray[i * 3 + 1];
            linePosArray[vertexpos++] = posArray[i * 3 + 2];
            linePosArray[vertexpos++] = posArray[j * 3];
            linePosArray[vertexpos++] = posArray[j * 3 + 1];
            linePosArray[vertexpos++] = posArray[j * 3 + 2];

            lineColorArray[colorpos++] = colors[i * 3] * alpha;
            lineColorArray[colorpos++] = colors[i * 3 + 1] * alpha;
            lineColorArray[colorpos++] = colors[i * 3 + 2] * alpha;
            lineColorArray[colorpos++] = colors[j * 3] * alpha;
            lineColorArray[colorpos++] = colors[j * 3 + 1] * alpha;
            lineColorArray[colorpos++] = colors[j * 3 + 2] * alpha;

            numConnected++;
          }
        }
      }
      lineGeometry.setDrawRange(0, numConnected * 2);
      linePosAttr.needsUpdate = true;
      lineColorAttr.needsUpdate = true;
    }

    const targetX = (mouse.x * viewport.width) / 25;
    const targetY = (mouse.y * viewport.height) / 25;
    
    pointsRef.current.rotation.x += (targetY * 0.05 - pointsRef.current.rotation.x) * 0.05;
    pointsRef.current.rotation.y += (targetX * 0.05 - pointsRef.current.rotation.y) * 0.05;
    
    if (linesRef.current) {
      linesRef.current.rotation.x = pointsRef.current.rotation.x;
      linesRef.current.rotation.y = pointsRef.current.rotation.y;
    }
    
    if (imageRef.current) {
      imageRef.current.position.x += (targetX * 0.1 - imageRef.current.position.x) * 0.02;
      imageRef.current.position.y += (targetY * 0.1 - imageRef.current.position.y) * 0.02;
    }
  });

  return (
    <group>
      {config.bgImage && (
        <Suspense fallback={null}>
          <DreiImage 
            ref={imageRef}
            url={config.bgImage} 
            transparent 
            opacity={0.12} 
            scale={[viewport.width * 1.5, viewport.height * 1.5]} 
            position={[0, 0, -5]} 
          />
        </Suspense>
      )}
      <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={isMobile ? 0.16 : 0.12}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {config.plexus && lineGeometry && (
        <lineSegments ref={linesRef} geometry={lineGeometry} frustumCulled={false}>
          <lineBasicMaterial 
            vertexColors
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            linewidth={1}
          />
        </lineSegments>
      )}
    </group>
  );
}

export default function CanvasBackground() {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, background: '#020202' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} dpr={isMobile ? [1, 1] : [1, 1.5]}>
        <fog attach="fog" args={['#020202', 8, 25]} />
        <ThematicScene key={theme} theme={theme} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
