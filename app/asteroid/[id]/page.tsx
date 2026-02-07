"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
    ShieldAlert,
    Orbit,
    Activity,
    TriangleAlert,
    Binary,
    ExternalLink,
    Clock,
    Layers,
    Zap,
    ChevronLeft,
    Bookmark,
    BookmarkCheck,
    RefreshCw,
    Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AsteroidOrbit3D from "@/components/AsteroidOrbit3D";
import { EncounterTrendsChart, AsteroidSizeChart } from "@/components/AsteroidCharts";

interface AsteroidPageProps {
    params: Promise<{ id: string }>;
}

export default function AsteroidDetailPage({ params }: AsteroidPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [asteroid, setAsteroid] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const fetchSavedStatus = useCallback(async () => {
        try {
            const resp = await axios.post("/api/get-saved-asteroids");
            if (resp.data.savedAsteroids) {
                const found = resp.data.savedAsteroids.some((a: any) => a.id === id);
                setIsSaved(found);
            }
        } catch (err) {
            console.error("Error fetching saved status:", err);
        }
    }, [id]);

    const checkLoginStatus = useCallback(async () => {
        try {
            const resp = await axios.post("/api/check-login");
            if (resp.status === 200) {
                setIsLoggedIn(true);
                fetchSavedStatus();
            }
        } catch (err) {
            setIsLoggedIn(false);
        }
    }, [fetchSavedStatus]);

    useEffect(() => {
        const fetchAsteroid = async () => {
            try {
                const res = await axios.post("/api/asteroid", { asteroidId: id });
                setAsteroid(res.data.asteroid);
            } catch (err: any) {
                setError(err.response?.data?.details || "Failed to sync telemetry data.");
            } finally {
                setLoading(false);
            }
        };
        fetchAsteroid();
        checkLoginStatus();
    }, [id, checkLoginStatus]);

    const handleSaveAsteroid = async () => {
        if (!isLoggedIn || !asteroid) return;
        setSaveLoading(true);
        try {
            // Map detail card data to the list item format expected by save-asteroid
            const asteroidFormatted = {
                id: asteroid.id,
                name: asteroid.name,
                close_approach_date: asteroid.close_approach_data[0]?.close_approach_date,
                diameter_m: asteroid.estimated_diameter.meters.estimated_diameter_max,
                velocity_km_s: parseFloat(asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second),
                miss_distance_km: parseFloat(asteroid.close_approach_data[0]?.miss_distance.kilometers),
                hazardous: asteroid.is_potentially_hazardous_asteroid,
                riskScore: asteroid.is_potentially_hazardous_asteroid ? 85 : 12, // Simplified for detail page context
                riskLevel: asteroid.is_potentially_hazardous_asteroid ? 'HIGH' : 'LOW'
            };

            const resp = await axios.post("/api/save-asteroid", { asteroid: asteroidFormatted });
            if (resp.status === 200) {
                setIsSaved(true);
            }
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="space-y-4 text-center">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
                <div className="text-blue-400 font-mono text-xs uppercase tracking-widest animate-pulse">
                    Establishing Uplink to NASA Telemetry...
                </div>
            </div>
        </div>
    );

    if (error || !asteroid) return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-md text-center">
                <TriangleAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">TELEMETRY SYNC ERROR</h2>
                <p className="text-slate-400 text-sm mb-6">{error || "Object data unreachable."}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-500 text-white rounded-full text-xs font-bold uppercase tracking-widest"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );

    // Data helpers
    const orbitalData = asteroid.orbital_data;
    const sizeData = asteroid.estimated_diameter;
    const encounters = asteroid.close_approach_data;

    // Prepare chart data
    const encounterTrendData = encounters.map((e: any) => ({
        date: e.close_approach_date,
        velocity: parseFloat(e.relative_velocity.kilometers_per_second),
        distance: parseFloat(e.miss_distance.astronomical) * 10, // Scaled for visibility
    }));

    const minDiameterM = sizeData.meters.estimated_diameter_min;
    const maxDiameterM = sizeData.meters.estimated_diameter_max;

    return (
        <main className="min-h-screen bg-black text-slate-200 selection:bg-blue-500/30 font-sans pb-24">

            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-32 relative z-10">

                {/* Navigation & Actions Row */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-mono text-xs uppercase tracking-[0.2em]"
                    >
                        <div className="w-8 h-8 rounded-full border border-white/5 bg-white/5 flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all">
                            <ChevronLeft size={16} />
                        </div>
                        Back to Mission Control
                    </button>

                    {isLoggedIn && (
                        <button
                            onClick={handleSaveAsteroid}
                            disabled={saveLoading || isSaved}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${isSaved
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black"
                                : "bg-white/5 text-slate-300 border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400"
                                } disabled:opacity-80`}
                        >
                            {saveLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            {isSaved ? "Saved to Catalog" : "Bookmark Telemetry"}
                        </button>
                    )}
                </div>

                {/* Header Section */}
                <header className="mb-12 border-b border-white/5 pb-12 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-[10px] font-bold uppercase tracking-tighter">
                                OBJECT IDENTIFIED
                            </span>
                            <span className="text-slate-500 text-[10px] font-mono">NEO_REF: {asteroid.id}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white uppercase italic">
                            {asteroid.name}
                        </h1>
                        <p className="text-slate-400 max-w-xl text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            Orbit Class: <span className="text-blue-300 font-bold">{orbitalData.orbit_class.orbit_class_type}</span>
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <a
                            href={asteroid.nasa_jpl_url}
                            target="_blank"
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition text-sm font-bold uppercase tracking-widest text-slate-300"
                        >
                            JPL Lookup <ExternalLink size={14} />
                        </a>
                        <div className={`flex items-center gap-2 px-6 py-3 ${asteroid.is_potentially_hazardous_asteroid ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"} border rounded-2xl text-sm font-bold uppercase tracking-widest`}>
                            {asteroid.is_potentially_hazardous_asteroid ? <TriangleAlert size={14} /> : <ShieldAlert size={14} />}
                            {asteroid.is_potentially_hazardous_asteroid ? "Hazardous" : "Safe"}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* 1. Identification Section */}
                        <Section
                            title="1. Asteroid Identification & Discovery"
                            icon={Binary}
                            description="Full designation and tracking credentials from NASA Planetary Defense Coordination Office."
                        >
                            <div className="grid md:grid-cols-2 gap-6 bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                                <DataField label="Designation" value={asteroid.designation} />
                                <DataField label="Tracking ID" value={asteroid.id} />
                                <DataField label="Potentially Hazardous" value={asteroid.is_potentially_hazardous_asteroid ? "YES" : "NO"} highlight={asteroid.is_potentially_hazardous_asteroid} />
                                <DataField label="Sentry Tracking" value={asteroid.is_sentry_object ? "ACTIVE" : "NONE"} highlight={asteroid.is_sentry_object} />
                                <div className="md:col-span-2 pt-6 border-t border-white/5 leading-relaxed text-sm text-slate-400">
                                    This celestial body is registered as <strong>{asteroid.name}</strong>. It is meticulously
                                    tracked by NASA and the Jet Propulsion Laboratory (JPL). Its classification as a
                                    Near-Earth Object (NEO) means its orbit brings it within 1.3 astronomical units of the Sun,
                                    allowing for regular Earth-vicinity encounters.
                                </div>
                            </div>
                        </Section>

                        {/* 2. Physical Characteristics */}
                        <Section
                            title="2. Physical Characteristics & Size Analysis"
                            icon={Activity}
                            description="Luminosity-based size estimates and kinetic potential evaluation."
                        >
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 space-y-6">
                                    <DataField
                                        label="Absolute Magnitude (H)"
                                        value={asteroid.absolute_magnitude_h}
                                        sub="Brightness index at 1 AU distance."
                                    />
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Estimated Diameter Ranges</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <UnitBox label="Kilometers" min={sizeData.kilometers.estimated_diameter_min} max={sizeData.kilometers.estimated_diameter_max} unit="km" />
                                            <UnitBox label="Meters" min={sizeData.meters.estimated_diameter_min} max={sizeData.meters.estimated_diameter_max} unit="m" />
                                            <UnitBox label="Miles" min={sizeData.miles.estimated_diameter_min} max={sizeData.miles.estimated_diameter_max} unit="mi" />
                                            <UnitBox label="Feet" min={sizeData.feet.estimated_diameter_min} max={sizeData.feet.estimated_diameter_max} unit="ft" />
                                        </div>
                                    </div>
                                </div>
                                <AsteroidSizeChart min={minDiameterM} max={maxDiameterM} />
                            </div>
                        </Section>

                        {/* 3. Close Approach Event Analysis */}
                        <Section
                            title="3. Close Approach Event Analysis"
                            icon={Target}
                            description="Detailed encounter history including relative velocity and lunar-distance proximity."
                        >
                            <div className="space-y-8">
                                <EncounterTrendsChart data={encounterTrendData} />

                                <div className="overflow-x-auto rounded-3xl border border-white/5 bg-slate-900/40">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead className="bg-[#0f172a] text-[10px] uppercase font-bold tracking-widest text-slate-500">
                                            <tr>
                                                <th className="px-6 py-4">Date (Full)</th>
                                                <th className="px-6 py-4">Velocity (km/s)</th>
                                                <th className="px-6 py-4">Miss Distance (AU)</th>
                                                <th className="px-6 py-4">Miss Distance (LD)</th>
                                                <th className="px-6 py-4 text-right">Target</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {encounters.map((e: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-white/2 transition-colors group">
                                                    <td className="px-6 py-4 font-mono text-blue-400">{e.close_approach_date_full}</td>
                                                    <td className="px-6 py-4 text-slate-300">{parseFloat(e.relative_velocity.kilometers_per_second).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-slate-300">{parseFloat(e.miss_distance.astronomical).toFixed(4)}</td>
                                                    <td className="px-6 py-4 text-slate-300">{parseFloat(e.miss_distance.lunar).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right text-slate-500 font-bold group-hover:text-blue-400 transition-colors uppercase">{e.orbiting_body}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Right Column - Orbital & Risk */}
                    <div className="lg:col-span-4 space-y-12">

                        {/* 4. Orbital Mechanics */}
                        <Section title="4. Orbital Dynamics" icon={Orbit}>
                            <div className="space-y-6">
                                <AsteroidOrbit3D data={orbitalData} />

                                <div className="grid grid-cols-2 gap-4">
                                    <OrbitalMetric label="Eccentricity" value={orbitalData.eccentricity} />
                                    <OrbitalMetric label="Inclination" value={`${orbitalData.inclination}°`} />
                                    <OrbitalMetric label="Mean Motion" value={orbitalData.mean_motion} />
                                    <OrbitalMetric label="Orbital Period" value={`${orbitalData.orbital_period} Days`} />
                                    <div className="col-span-2 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                                        <div className="text-[10px] font-bold text-slate-600 uppercase mb-2">Min Orbit Intersection (MOID)</div>
                                        <div className="text-2xl font-bold font-mono text-cyan-400">{orbitalData.minimum_orbit_intersection} AU</div>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* 5 & 6. Classification & Risk */}
                        <div className="space-y-8">
                            <div className="bg-linear-to-br from-blue-500/10 to-transparent p-8 rounded-[2.5rem] border border-blue-500/20">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-blue-400" />
                                    5. Scientific Class
                                </h3>
                                <div className="text-3xl font-bold text-blue-400 mb-2">{orbitalData.orbit_class.orbit_class_type}</div>
                                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                    {orbitalData.orbit_class.orbit_class_description}
                                </p>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-600">Range: {orbitalData.orbit_class.orbit_class_range}</div>
                            </div>

                            <div className="bg-linear-to-br from-red-500/10 to-transparent p-8 rounded-[2.5rem] border border-red-500/20">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-red-400" />
                                    6. Threat Evaluation
                                </h3>
                                <div className="space-y-4">
                                    <RiskStatus label="Hazard Status" value={asteroid.is_potentially_hazardous_asteroid ? "CRITICAL" : "NEGATIVE"} active={asteroid.is_potentially_hazardous_asteroid} />
                                    <RiskStatus label="Sentry Object" value={asteroid.is_sentry_object ? "TRUE" : "FALSE"} active={asteroid.is_sentry_object} />
                                    <div className="h-px bg-white/5 my-4" />
                                    <p className="text-sm text-slate-400 leading-relaxed italic">
                                        Based on the MOID of {orbitalData.minimum_orbit_intersection} AU, this object
                                        {asteroid.is_potentially_hazardous_asteroid ? " meets the threshold for PHA classification." : " does not meet current priority hazard criteria."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 7. Summary Conclusion */}
                        <Section title="7. Mission Conclusion" icon={Zap}>
                            <div className="bg-blue-500/20 p-8 rounded-[2.5rem] text-gray-400">
                                <h4 className="font-black text-xs uppercase tracking-widest mb-4 opacity-50">Final Summary</h4>
                                <p className="text-lg font-bold leading-tight mb-8">
                                    Scientific assessment categorizes this object as a
                                    {asteroid.is_potentially_hazardous_asteroid ? " High Precision Threat " : " Low Risk Scientific Subject "}
                                    requiring {asteroid.is_potentially_hazardous_asteroid ? " constant observation." : " opportunistic tracking."}
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-[2px] bg-black/20" />
                                    <div className="text-[10px] font-black uppercase tracking-tighter">Confidence Index: 98.4%</div>
                                </div>
                            </div>
                        </Section>

                    </div>
                </div>
            </div>
        </main>
    );
}

// UI Components
function Section({ title, icon: Icon, description, children }: any) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-4 border-l-4 border-blue-500 pl-4 py-2">
                <Icon className="w-6 h-6 text-blue-400" />
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">{title}</h2>
                    {description && <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">{description}</p>}
                </div>
            </div>
            <div>{children}</div>
        </section>
    );
}

function DataField({ label, value, sub, highlight }: any) {
    return (
        <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</div>
            <div className={`text-2xl font-mono ${highlight ? "text-red-400" : "text-white"}`}>{value}</div>
            {sub && <div className="text-[10px] text-slate-500 font-medium">{sub}</div>}
        </div>
    );
}

function UnitBox({ label, min, max, unit }: any) {
    return (
        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <div className="text-[9px] font-bold text-slate-600 uppercase mb-1">{label}</div>
            <div className="text-xs font-mono text-blue-300">
                {parseFloat(min).toFixed(2)} - {parseFloat(max).toFixed(2)} <span className="text-[10px] opacity-50">{unit}</span>
            </div>
        </div>
    );
}

function OrbitalMetric({ label, value }: any) {
    return (
        <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition">
            <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">{label}</div>
            <div className="text-sm font-mono text-white truncate">{parseFloat(value) ? parseFloat(value).toFixed(6) : value}</div>
        </div>
    );
}

function RiskStatus({ label, value, active }: any) {
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-widest">{label}</span>
            <span className={`px-3 py-1 rounded-full font-black tracking-tighter ${active ? "bg-red-500 text-white" : "bg-white/10 text-slate-400"}`}>
                {value}
            </span>
        </div>
    );
}
