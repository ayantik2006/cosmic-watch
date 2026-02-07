"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

const Earth = () => {
    const earthRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);

    const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
        "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg",
        "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg",
        "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg",
        "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png"
    ]);

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        if (earthRef.current) {
            earthRef.current.rotation.y = elapsedTime / 6;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y = elapsedTime / 5;
        }
    });

    return (
        <>
            <mesh ref={earthRef} scale={[2.5, 2.5, 2.5]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshPhongMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    specularMap={specularMap}
                    shininess={5}
                />
            </mesh>
            <mesh ref={cloudsRef} scale={[2.53, 2.53, 2.53]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.15}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </>
    );
};

const Asteroid = ({ position, speed, size }: { position: [number, number, number], speed: number, size: number }) => {
    const ref = useRef<THREE.Mesh>(null);
    const texture = useLoader(THREE.TextureLoader, "/asteroid.jpg");

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime() * speed;
            ref.current.position.x = position[0] * Math.cos(t) - position[2] * Math.sin(t);
            ref.current.position.z = position[0] * Math.sin(t) + position[2] * Math.cos(t);

            // Self-rotation for realism
            ref.current.rotation.x += 0.01;
            ref.current.rotation.y += 0.02;
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial map={texture} roughness={0.8} metalness={0.2} />
        </mesh>
    );
}


export default function Earth3D() {
    return (
        <div className="absolute inset-0 z-10 h-full w-full">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                gl={{
                    powerPreference: "high-performance",
                    alpha: true,
                    antialias: true,
                    stencil: false,
                    depth: true
                }}
                dpr={[1, 2]} // Optimize for high DPI displays
            >
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Suspense fallback={null}>
                    <Earth />
                    <Asteroid position={[4, 0, 0]} speed={0.5} size={0.12} />
                    <Asteroid position={[5, 1.5, 0]} speed={0.3} size={0.1} />
                    <Asteroid position={[6, -1, 0]} speed={0.2} size={0.15} />
                </Suspense>
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} enablePan={false} />
            </Canvas>
        </div>
    );
}
