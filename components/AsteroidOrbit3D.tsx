"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Line } from "@react-three/drei";
import * as THREE from "three";

interface OrbitalData {
    eccentricity: string;
    semi_major_axis: string;
    inclination: string;
    ascending_node_longitude: string;
    perihelion_argument: string;
    perihelion_distance: string;
    aphelion_distance: string;
}

const OrbitPath = ({ data }: { data: OrbitalData }) => {
    const e = parseFloat(data.eccentricity);
    const a = parseFloat(data.semi_major_axis);
    const i = (parseFloat(data.inclination) * Math.PI) / 180;
    const Omega = (parseFloat(data.ascending_node_longitude) * Math.PI) / 180;
    const w = (parseFloat(data.perihelion_argument) * Math.PI) / 180;

    // Generate orbit points
    const points = useMemo(() => {
        const pts = [];
        for (let theta = 0; theta <= Math.PI * 2; theta += 0.05) {
            // 1. Orbital radius in polar coordinates
            const r = (a * (1 - e ** 2)) / (1 + e * Math.cos(theta));

            // 2. Position in the orbital plane (perifocal coordinate system)
            const x_prime = r * Math.cos(theta);
            const y_prime = r * Math.sin(theta);

            // 3. Transform to 3D space using Euler angles
            // This is a simplified rotation for visualization purposes
            const x =
                (Math.cos(Omega) * Math.cos(w) - Math.sin(Omega) * Math.sin(w) * Math.cos(i)) * x_prime +
                (-Math.cos(Omega) * Math.sin(w) - Math.sin(Omega) * Math.cos(w) * Math.cos(i)) * y_prime;

            const y =
                (Math.sin(Omega) * Math.cos(w) + Math.cos(Omega) * Math.sin(w) * Math.cos(i)) * x_prime +
                (-Math.sin(Omega) * Math.sin(w) + Math.cos(Omega) * Math.cos(w) * Math.cos(i)) * y_prime;

            const z = (Math.sin(w) * Math.sin(i)) * x_prime + (Math.cos(w) * Math.sin(i)) * y_prime;

            pts.push(new THREE.Vector3(x * 3, z * 3, -y * 3)); // Scale up and swap coordinates for Three.js
        }
        pts.push(pts[0]); // Close the loop
        return pts;
    }, [a, e, i, Omega, w]);

    const asteroidRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (asteroidRef.current) {
            const t = clock.getElapsedTime() * 0.2;
            // Simple orbital motion along the generated points
            const index = Math.floor((t % points.length) * (points.length / 50)) % points.length;
            const target = points[index];
            asteroidRef.current.position.lerp(target, 0.1);
            asteroidRef.current.rotation.y += 0.02;
        }
    });

    return (
        <>
            <Line points={points} color="#60a5fa" lineWidth={1} transparent opacity={0.5} />
            <mesh ref={asteroidRef}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#94a3b8" emissive="#1e293b" />
            </mesh>
        </>
    );
};

export default function AsteroidOrbit3D({ data }: { data: OrbitalData }) {
    return (
        <div className="w-full h-[400px] bg-slate-950/50 rounded-2xl border border-blue-500/20 overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                    Live Orbital Projection
                </div>
            </div>

            <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                {/* Sun */}
                <mesh>
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2} />
                </mesh>

                {/* Earth Orbit Reference (Simplified) */}
                <Line
                    points={new Array(64).fill(0).map((_, idx) => {
                        const angle = (idx / 64) * Math.PI * 2;
                        return new THREE.Vector3(Math.cos(angle) * 3, 0, Math.sin(angle) * 3);
                    })}
                    color="#3b82f6"
                    lineWidth={0.5}
                    transparent
                    opacity={0.2}
                />

                <OrbitPath data={data} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <OrbitControls enableZoom={true} enablePan={false} />
            </Canvas>

            <div className="absolute bottom-4 right-4 text-[9px] font-mono text-slate-500">
                SCALE: 1 UNIT = ~1 AU (VISUAL)
            </div>
        </div>
    );
}
