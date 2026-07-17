import {useRef} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import type {Mesh} from 'three';

/**
 * The lazy 3D product viewer (§5.1). Imported dynamically and rendered only when
 * the shopper toggles the 3D view on the PDP, so Three.js never loads on the
 * initial page and never runs on the server. A stand-in faceted gem turning
 * slowly to the light — the same gesture as the rest of the house's motion.
 *
 * In production this loads the piece's GLB (e.g. via drei's <useGLTF>) with this
 * primitive as the loading state; the toggle + fallback wiring stays identical.
 */
function Gem() {
  const mesh = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.35;
      mesh.current.rotation.x += delta * 0.08;
    }
  });
  return (
    <mesh ref={mesh}>
      <octahedronGeometry args={[1.15, 0]} />
      <meshStandardMaterial color="#B8975A" metalness={0.9} roughness={0.18} />
    </mesh>
  );
}

export default function ProductViewer3D() {
  return (
    <Canvas
      camera={{position: [0, 0, 3.4], fov: 42}}
      dpr={[1, 2]}
      gl={{antialias: true, alpha: true}}
      style={{width: '100%', height: '100%'}}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <directionalLight position={[-3, -2, -4]} intensity={0.4} color="#24503F" />
      <Gem />
    </Canvas>
  );
}
