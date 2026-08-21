import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Trail } from '@react-three/drei';
import * as THREE from 'three';

interface DragonflyProps {
  progress: number;
}

export default function Dragonfly({ progress }: DragonflyProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/dragonfly.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Play the first animation if it exists (usually flying/flapping)
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0];
      firstAction?.play();
    }
  }, [actions]);

  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime();
    
    // Base orbit path
    const orbitRadius = 2.0;
    const speed = 1.5;
    
    // Calculate position
    const x = Math.sin(t * speed) * orbitRadius;
    const y = Math.sin(t * speed * 2) * 0.5; // slight bobbing
    const z = Math.cos(t * speed) * orbitRadius;
    
    // Calculate target position (slightly ahead) to face movement direction
    const nextT = t + 0.1;
    const nextX = Math.sin(nextT * speed) * orbitRadius;
    const nextY = Math.sin(nextT * speed * 2) * 0.5;
    const nextZ = Math.cos(nextT * speed) * orbitRadius;

    // Apply burst/fly-away effect
    const burstScale = Math.pow(progress, 3) * 20.0; // Rapidly shoot away
    
    // The dragonfly flies outward on the burst
    const burstDir = new THREE.Vector3(x, y, z).normalize();
    const finalPos = new THREE.Vector3(x, y, z).add(burstDir.multiplyScalar(burstScale));
    const finalNextPos = new THREE.Vector3(nextX, nextY, nextZ).add(burstDir.multiplyScalar(burstScale));

    group.current.position.copy(finalPos);
    group.current.lookAt(finalNextPos);
  });

  return (
    <group ref={group} scale={0.05}>
      <Trail
        width={0.2}
        length={20}
        color={new THREE.Color(0.2, 0.6, 1.0)} // Blue haze
        attenuation={(t) => t * t} // Taper off
      >
        <primitive object={scene} />
      </Trail>
    </group>
  );
}

useGLTF.preload('/dragonfly.glb');
