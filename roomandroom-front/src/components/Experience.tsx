'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Float, MeshDistortMaterial, Sphere, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function Experience() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[1, 2, 3]} intensity={1.5} />
            <spotLight position={[-5, 5, 5]} angle={0.15} penumbra={1} intensity={2} />

            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <Sphere args={[1, 100, 100]} position={[0, 0, 0]}>
                    <MeshDistortMaterial
                        color="#3b82f6"
                        attach="material"
                        distort={0.5}
                        speed={2}
                        roughness={0.2}
                        metalness={0.8}
                    />
                </Sphere>
            </Float>

            <Float speed={3} rotationIntensity={2} floatIntensity={2}>
                <mesh position={[-2, 1, -2]} scale={0.5}>
                    <boxGeometry />
                    <MeshWobbleMaterial color="#ec4899" factor={1} speed={2} />
                </mesh>
            </Float>

            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
                <mesh position={[2, -1, -1]} scale={0.7}>
                    <torusGeometry args={[1, 0.4, 16, 100]} />
                    <meshStandardMaterial color="#8b5cf6" roughness={0.1} metalness={0.5} />
                </mesh>
            </Float>
        </>
    );
}
