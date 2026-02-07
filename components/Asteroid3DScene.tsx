"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Line } from "@react-three/drei";
import { TextureLoader, Vector3 } from "three";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ================= TYPES ================= */

interface Asteroid {
    id: string;
    name: string;
    diameter_m: number;
    miss_distance_km: number;
    riskScore: number;
    riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
}

/* ================= HELPERS ================= */

// Normalize distances so scene scale is stable
const normalizeDistance = (km: number) =>
    THREE.MathUtils.clamp(km / 6_000_000, 2.8, 14);

/* ================= EARTH ================= */

function Earth() {
    const ref = useRef<THREE.Mesh>(null!);
    const earthMap = useLoader(TextureLoader, "/textures/earth.png");

    useFrame(() => {
        ref.current.rotation.y += 0.00045;
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
                map={earthMap}
                roughness={0.9}
                metalness={0}
            />
        </mesh>
    );
}

/* ================= ORBIT ================= */

function OrbitRing({
    radius,
    hovered,
}: {
    radius: number;
    hovered: boolean;
}) {
    const points = useMemo(() => {
        const pts: Vector3[] = [];
        for (let i = 0; i <= 128; i++) {
            const a = (i / 128) * Math.PI * 2;
            pts.push(new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
        }
        return pts;
    }, [radius]);

    return (
        <Line
            points={points}
            color="#64748b"
            lineWidth={hovered ? 1.35 : 1}
            transparent
            opacity={hovered ? 0.45 : 0.25}
        />
    );
}

/* ================= ASTEROID ================= */

function Asteroid({
    asteroid,
    index,
}: {
    asteroid: Asteroid;
    index: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHovered] = useState(false);

    const diffuse = useLoader(TextureLoader, "/textures/asteroid.png");
    const normal = useLoader(TextureLoader, "/textures/asteroid.png");

    const orbitRadius = normalizeDistance(asteroid.miss_distance_km);
    const baseSize = Math.max(0.14, asteroid.diameter_m / 650);

    // Create irregular rocky geometry
    const geometry = useMemo(() => {
        const geo = new THREE.IcosahedronGeometry(baseSize, 3);
        const pos = geo.attributes.position;

        for (let i = 0; i < pos.count; i++) {
            const v = new Vector3().fromBufferAttribute(pos, i);
            v.multiplyScalar(1 + (Math.random() - 0.5) * 0.25);
            pos.setXYZ(i, v.x, v.y, v.z);
        }

        geo.computeVertexNormals();
        return geo;
    }, [baseSize]);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * 0.12 + index;
        meshRef.current.position.set(
            Math.cos(t) * orbitRadius,
            0,
            Math.sin(t) * orbitRadius
        );
        meshRef.current.rotation.y += 0.0013;
    });

    return (
        <>
            <OrbitRing radius={orbitRadius} hovered={hovered} />

            <mesh
                ref={meshRef}
                geometry={geometry}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    map={diffuse}
                    normalMap={normal}
                    roughness={0.98}
                    metalness={0.02}
                    color="#f6f6f6" // dark rock multiplier
                />

                {hovered && (
                    <Html distanceFactor={9}>
                        <div className="bg-black/85 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white w-[190px] pointer-events-none">
                            <div className="font-bold text-cyan-400 mb-1">
                                {asteroid.name}
                            </div>
                            <div>Diameter: {asteroid.diameter_m} m</div>
                            <div>
                                Miss Distance:{" "}
                                {asteroid.miss_distance_km.toLocaleString()} km
                            </div>
                            <div>Risk Score: {asteroid.riskScore}</div>
                        </div>
                    </Html>
                )}
            </mesh>
        </>
    );
}

/* ================= MAIN SCENE ================= */

export default function Asteroid3DScene({
    asteroids,
}: {
    asteroids: Asteroid[];
}) {
    const top10 = useMemo(
        () =>
            [...asteroids]
                .sort((a, b) => b.riskScore - a.riskScore)
                .slice(0, 10),
        [asteroids]
    );

    return (
        <div className="h-[520px] w-full rounded-2xl border border-slate-800 overflow-hidden bg-black">
            <Canvas camera={{ position: [0, 7, 18], fov: 50 }}>
                {/* LIGHTING */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[8, 6, 8]} intensity={1.5} />

                {/* BACKGROUND */}
                <Stars radius={120} depth={60} count={5000} factor={4} fade />

                {/* OBJECTS */}
                <Earth />
                {top10.map((a, i) => (
                    <Asteroid key={a.id} asteroid={a} index={i} />
                ))}

                {/* CONTROLS */}
                <OrbitControls
                    enableZoom
                    minDistance={6}
                    maxDistance={28}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.25}
                />
            </Canvas>
        </div>
    );
}