"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    AlertTriangle,
    Maximize2,
    Wind,
    Target,
    RefreshCw,
    Gauge,
    Orbit,
    Trash2,
    Database,
} from "lucide-react";

interface Asteroid {
    id: string;
    name: string;
    close_approach_date: string;
    diameter_m: number;
    velocity_km_s: number;
    miss_distance_km: number;
    hazardous: boolean;
    riskScore: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    savedAt?: string;
}

type SortKey =
    | 'close_approach_date'
    | 'diameter_m'
    | 'velocity_km_s'
    | 'miss_distance_km'
    | 'riskScore';

export default function SavedAsteroidsPage() {
    const router = useRouter();
    const [savedAsteroids, setSavedAsteroids] = useState<Asteroid[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{
        key: SortKey;
        direction: 'asc' | 'desc';
    }>({
        key: 'riskScore',
        direction: 'desc',
    });
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

    const fetchSavedAsteroids = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post("/api/get-saved-asteroids");
            setSavedAsteroids(response.data.savedAsteroids || []);
        } catch (err) {
            console.error("Error fetching saved asteroids:", err);
            setError("Failed to retrieve your celestial catalog. Please ensure you are logged in.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedAsteroids();
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setViewMode('cards');
            } else {
                setViewMode('table');
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [fetchSavedAsteroids]);

    const handleRemoveAsteroid = async (asteroidId: string) => {
        setRemovingId(asteroidId);
        try {
            await axios.post("/api/remove-asteroid", { asteroidId });
            setSavedAsteroids(prev => prev.filter(a => a.id !== asteroidId));
        } catch (err) {
            console.error("Remove error:", err);
        } finally {
            setRemovingId(null);
        }
    };

    const sortedAsteroids = useMemo(() => {
        const sortableItems = [...savedAsteroids];
        sortableItems.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === 'close_approach_date') {
                aVal = new Date(aVal as string).getTime();
                bVal = new Date(bVal as string).getTime();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [savedAsteroids, sortConfig]);

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'LOW':
                return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'MODERATE':
                return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'HIGH':
                return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'CRITICAL':
                return 'text-red-500 bg-red-500/20 border-red-500/30 font-bold risk-pulse';
            default:
                return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key)
            return <ArrowUpDown size={14} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? (
            <ChevronUp size={14} />
        ) : (
            <ChevronDown size={14} />
        );
    };

    return (
        <div className="min-h-screen bg-black text-slate-200 py-24 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {/* <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-[0.3em]">
                            <Database size={14} /> Personal Vault
                        </div> */}
                        <h1 className="text-4xl lg:text-6xl font-bold bg-linear-to-r from-white via-white to-slate-500 bg-clip-text text-transparent">
                            Saved Asteroids
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-lg max-w-2xl leading-relaxed">
                            Your curated catalog of Near-Earth Objects. Monitored for potential orbital intersections and impact risks.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl"
                    >
                        <div className="text-center px-6 border-r border-slate-800">
                            <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Items</div>
                            <div className="text-3xl font-bold text-white font-mono">{savedAsteroids.length}</div>
                        </div>
                        <div className="px-2">
                            <RefreshCw
                                onClick={fetchSavedAsteroids}
                                className={`w-5 h-5 text-slate-500 hover:text-cyan-400 cursor-pointer transition-all ${loading ? 'animate-spin' : ''}`}
                            />
                        </div>
                    </motion.div>
                </header>

                {error && (
                    <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm flex items-start gap-4">
                        <AlertTriangle size={20} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <RefreshCw className="w-10 h-10 text-cyan-500/50 animate-spin" />
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Accessing Archive...</p>
                    </div>
                ) : sortedAsteroids.length === 0 ? (
                    <section className="py-20 text-center bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl">
                        <Orbit size={64} className="mx-auto text-slate-800 mb-6" />
                        <h2 className="text-xl font-bold text-slate-400 mb-2">Archive Empty</h2>
                        <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">No objects have been bookmarked for tracking.</p>
                    </section>
                ) : (
                    <section className="space-y-6">
                        {/* Simple Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-b border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-slate-500 uppercase">Sort by:</span>
                                <div className="flex gap-2">
                                    {['riskScore', 'close_approach_date', 'diameter_m'].map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setSortConfig(prev => ({
                                                key: key as SortKey,
                                                direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'desc'
                                            }))}
                                            className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-all ${sortConfig.key === key
                                                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                                                : 'border-slate-800 text-slate-500 hover:border-slate-700'
                                                }`}
                                        >
                                            {key.replace('_', ' ').toUpperCase()} {sortConfig.key === key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                                <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 rounded-md text-[10px] font-mono transition-all ${viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'}`}>TABLE</button>
                                <button onClick={() => setViewMode('cards')} className={`px-4 py-1.5 rounded-md text-[10px] font-mono transition-all ${viewMode === 'cards' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'}`}>CARDS</button>
                            </div>
                        </div>

                        {viewMode === 'table' ? (
                            <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm shadow-2xl">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-slate-950/40">
                                            <th className="p-6 text-[10px] font-mono uppercase text-slate-500 tracking-widest">Object Info</th>
                                            <th className="p-6 text-[10px] font-mono uppercase text-slate-500 tracking-widest">Approach</th>
                                            <th className="p-6 text-[10px] font-mono uppercase text-slate-500 tracking-widest text-center">Diameter</th>
                                            <th className="p-6 text-[10px] font-mono uppercase text-slate-500 tracking-widest text-center">Velocity</th>
                                            <th className="p-6 text-[10px] font-mono uppercase text-slate-500 tracking-widest text-center">Miss Dist</th>
                                            <th className="p-6 text-[10px] font-mono uppercase text-slate-500 tracking-widest text-center">Risk</th>
                                            <th className="p-6 text-[10px] font-mono uppercase text-slate-500 tracking-widest text-center">Hazard</th>
                                            <th className="p-6 text-[10px] font-mono uppercase text-slate-500 tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {sortedAsteroids.map(asteroid => (
                                            <tr
                                                key={asteroid.id}
                                                onClick={() => router.push(`/asteroid/${asteroid.id}`)}
                                                className="group hover:bg-white/2 transition-all cursor-pointer"
                                            >
                                                <td className="p-6">
                                                    <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{asteroid.name}</div>
                                                    <div className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">NEO ID: {asteroid.id}</div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                                                        <Calendar size={14} className="text-slate-500 shrink-0" />
                                                        <span className="whitespace-nowrap">{asteroid.close_approach_date}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Maximize2 size={14} className="text-slate-500 opacity-50" />
                                                        <span className="text-xs font-mono text-slate-300">{asteroid.diameter_m.toLocaleString()} m</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Wind size={14} className="text-slate-500 opacity-50" />
                                                        <span className="text-xs font-mono text-slate-300">{asteroid.velocity_km_s.toLocaleString()} km/s</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Target size={14} className="text-slate-500 opacity-50" />
                                                        <span className="text-xs font-mono text-slate-300">{asteroid.miss_distance_km.toLocaleString()} km</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRiskColor(asteroid.riskLevel)}`}>
                                                            {asteroid.riskLevel}
                                                        </div>
                                                        <span className="text-[10px] font-mono text-slate-500">{asteroid.riskScore}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    {asteroid.hazardous ? (
                                                        <div className="flex items-center justify-center gap-1 text-rose-500 animate-pulse">
                                                            <AlertTriangle size={14} />
                                                            <span className="text-[10px] font-bold font-mono">YES</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-mono text-slate-600">NO</span>
                                                    )}
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button
                                                        disabled={removingId === asteroid.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveAsteroid(asteroid.id);
                                                        }}
                                                        className="p-3 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                                        title="Remove from Catalog"
                                                    >
                                                        {removingId === asteroid.id ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Trash2 size={20} />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedAsteroids.map(asteroid => (
                                    <motion.div
                                        layout
                                        key={asteroid.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => router.push(`/asteroid/${asteroid.id}`)}
                                        className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/40 transition-all group relative overflow-hidden cursor-pointer"
                                    >
                                        <div className="absolute top-0 right-0 p-4">
                                            <button
                                                disabled={removingId === asteroid.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveAsteroid(asteroid.id);
                                                }}
                                                className="p-2.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                                            >
                                                {removingId === asteroid.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors pr-10">{asteroid.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">NEO ID: {asteroid.id}</span>
                                                {asteroid.hazardous && (
                                                    <span className="text-[8px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">HAZARDOUS</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                                            <div className="space-y-1">
                                                <div className="text-[9px] uppercase text-slate-500 flex items-center gap-1 font-mono">
                                                    <Calendar size={10} className="opacity-50" /> Date
                                                </div>
                                                <div className="text-xs text-slate-200 font-mono">{asteroid.close_approach_date}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] uppercase text-slate-500 flex items-center gap-1 font-mono">
                                                    <Maximize2 size={10} className="opacity-50" /> Size
                                                </div>
                                                <div className="text-xs text-slate-200 font-mono">{asteroid.diameter_m.toLocaleString()} m</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] uppercase text-slate-500 flex items-center gap-1 font-mono">
                                                    <Wind size={10} className="opacity-50" /> Velocity
                                                </div>
                                                <div className="text-xs text-slate-200 font-mono">{asteroid.velocity_km_s.toLocaleString()} km/s</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] uppercase text-slate-500 flex items-center gap-1 font-mono">
                                                    <Target size={10} className="opacity-50" /> Miss Dist
                                                </div>
                                                <div className="text-xs text-slate-200 font-mono">{asteroid.miss_distance_km.toLocaleString()} km</div>
                                            </div>
                                        </div>

                                        <div className="bg-black/40 rounded-2xl p-4 border border-slate-800/50">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[9px] uppercase text-slate-500 font-mono">Risk Assessment</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRiskColor(asteroid.riskLevel)}`}>{asteroid.riskLevel}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${asteroid.riskScore}%` }}
                                                        className="h-full bg-cyan-500"
                                                    />
                                                </div>
                                                <span className="text-xs font-mono text-cyan-400">{asteroid.riskScore}%</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* <footer className="mt-20 py-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Celestial Archive Beta 1.0</div>
                    <div className="flex gap-6 text-[10px] font-mono text-slate-700 uppercase">
                        <span>Secure Storage Connection: Active</span>
                        <span>Last Sync: {new Date().toLocaleTimeString()}</span>
                    </div>
                </footer> */}
            </div>
        </div>
    );
}
