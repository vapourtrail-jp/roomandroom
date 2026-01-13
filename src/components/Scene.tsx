'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Experience from './Experience';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

export default function Scene() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
            <Canvas shadows camera={{ position: [0, 0, 5], fov: 35 }}>
                <Suspense fallback={null}>
                    <Experience />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                    <Environment preset="city" />
                    <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} far={10} />
                </Suspense>
            </Canvas>
        </div>
    );
}
