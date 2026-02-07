"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Search,
    Calendar,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    AlertTriangle,
    Info,
    Maximize2,
    Wind,
    Target,
    RefreshCw,
    Gauge,
    Orbit,
    Bookmark,
    BookmarkCheck,
} from "lucide-react";
import Asteroid3DScene from "@/components/Asteroid3DScene";

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
}

type SortKey =
    | 'close_approach_date'
    | 'diameter_m'
    | 'velocity_km_s'
    | 'miss_distance_km'
    | 'riskScore'
    | 'hazardous';

export default function AsteroidsPage() {
    const router = useRouter();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
    const [startDate, setStartDate] = useState(formatDate(yesterday));
    const [endDate, setEndDate] = useState(formatDate(today));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [saveLoading, setSaveLoading] = useState<string | null>(null);

    const [sortConfig, setSortConfig] = useState<{
        key: SortKey;
        direction: 'asc' | 'desc';
    }>({
        key: 'close_approach_date',
        direction: 'desc',
    });
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    const fetchAsteroids = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post("/api/asteroid-data", {
                start_date: startDate,
                end_date: endDate,
            });
            setAsteroids(response.data.asteroids || []);
        } catch (err) {
            console.error("Error fetching asteroid data:", err);
            setError("Failed to synchronize with NASA tracking systems. Please verify orbital parameters.");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    const fetchSavedIds = useCallback(async () => {
        try {
            const resp = await axios.post("/api/get-saved-asteroids");
            if (resp.data.savedAsteroids) {
                const ids = new Set<string>(resp.data.savedAsteroids.map((a: Asteroid) => a.id));
                setSavedIds(ids);
            }
        } catch (err) {
            console.error("Error fetching saved IDs:", err);
        }
    }, []);

    const checkLoginStatus = useCallback(async () => {
        try {
            const resp = await axios.post("/api/check-login");
            if (resp.status === 200) {
                setIsLoggedIn(true);
                fetchSavedIds();
            }
        } catch (err) {
            setIsLoggedIn(false);
        }
    }, [fetchSavedIds]);

    useEffect(() => {
        fetchAsteroids();
        checkLoginStatus();
    }, [fetchAsteroids, checkLoginStatus]);

    useEffect(() => {
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
    }, []);

    const handleRefresh = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAsteroids();
    };

    const sortedAsteroids = useMemo(() => {
        const sortableItems = [...asteroids];
        sortableItems.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === 'close_approach_date') {
                aVal = new Date(aVal as string).getTime();
                bVal = new Date(bVal as string).getTime();
            } else if (sortConfig.key === 'hazardous') {
                aVal = aVal ? 1 : 0;
                bVal = bVal ? 1 : 0;
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [asteroids, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSaveAsteroid = async (asteroid: Asteroid) => {
        if (!isLoggedIn) return;
        setSaveLoading(asteroid.id);
        try {
            const resp = await axios.post("/api/save-asteroid", { asteroid });
            if (resp.status === 200) {
                setSavedIds(prev => new Set(prev).add(asteroid.id));
            }
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaveLoading(null);
        }
    };

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

    const hazardousCount = asteroids.filter((a) => a.hazardous).length;
    const avgRisk =
        asteroids.length > 0
            ? Math.round(
                asteroids.reduce((acc, a) => acc + a.riskScore, 0) / asteroids.length
            )
            : 0;

    return (
        <div className="min-h-screen bg-black text-slate-200 py-20 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500/30">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 lg:mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3"
                    >
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-white via-white to-slate-500 bg-clip-text text-transparent">
                            Orbital Catalog
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                            Advanced tracking of Near-Earth Objects (NEOs). Analyzing
                            trajectories, size, and potential impact risks from NASA's
                            database.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 p-4 sm:p-5 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl"
                    >
                        <div className="text-center px-3 sm:px-4 sm:border-r border-slate-800">
                            <div className="text-xs text-slate-500 uppercase font-mono mb-1">
                                Total
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-white">
                                {asteroids.length}
                            </div>
                        </div>
                        <div className="text-center px-3 sm:px-4 sm:border-r border-slate-800">
                            <div className="text-xs text-slate-500 uppercase font-mono mb-1">
                                Hazardous
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-rose-400">
                                {hazardousCount}
                            </div>
                        </div>
                        <div className="text-center px-3 sm:px-4 sm:border-r border-slate-800">
                            <div className="text-xs text-slate-500 uppercase font-mono mb-1">
                                Avg Risk
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-amber-400">
                                {avgRisk}
                            </div>
                        </div>
                        <div className="text-center px-3 sm:px-4">
                            <div className="text-xs text-slate-500 uppercase font-mono mb-1">
                                Status
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-animation" />
                                Active
                            </div>
                        </div>
                    </motion.div>
                </header>

                <section className="mb-6 lg:mb-8 slide-up">
                    <form
                        onSubmit={handleRefresh}
                        className="bg-slate-900/30 p-4 sm:p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm space-y-4"
                    >
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-xs font-mono text-slate-500 uppercase pl-1 flex items-center gap-2">
                                    <Calendar size={12} /> Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono text-sm"
                                />
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-xs font-mono text-slate-500 uppercase pl-1 flex items-center gap-2">
                                    <Calendar size={12} /> End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-4 sm:px-8 py-2 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <RefreshCw size={20} className="spin-animation" />
                                ) : (
                                    <Search size={20} />
                                )}
                                <span className="hidden sm:inline">UPDATE FEED</span>
                                <span className="sm:hidden">UPDATE</span>
                            </button>
                        </div>

                        {/* --- Sorting Row --- */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 border-t border-slate-800/50">
                            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                                <div className="space-y-2 flex-1">
                                    <label className="text-[10px] font-mono text-slate-500 uppercase pl-1 flex items-center gap-2">
                                        <ArrowUpDown size={10} /> Sort Catalog By
                                    </label>
                                    <select
                                        value={sortConfig.key}
                                        onChange={(e) => setSortConfig(prev => ({ ...prev, key: e.target.value as SortKey }))}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/30 transition-all font-mono"
                                    >
                                        <option value="close_approach_date">📅 Approach Date</option>
                                        <option value="riskScore">⚠️ Risk Index</option>
                                        <option value="diameter_m">📏 Obj Diameter</option>
                                        <option value="velocity_km_s">🚀 Velocity</option>
                                        <option value="miss_distance_km">🎯 Miss Distance</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-slate-500 uppercase pl-1 flex items-center gap-2">
                                        Direction
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                                        className="w-full sm:w-auto px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        {sortConfig.direction === 'asc' ? 'ASCENDING' : 'DESCENDING'}
                                    </button>
                                </div>
                            </div>
                            <div className="hidden sm:block w-px h-8 bg-slate-800 mx-2" />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500 uppercase whitespace-nowrap">View Mode:</span>
                                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('table')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-mono transition-all ${viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        TABLE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('cards')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-mono transition-all ${viewMode === 'cards' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        CARDS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-start gap-3 slide-up">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-8">
                    <div className="w-full max-w-7xl">
                        <div className="text-center mb-8">
                            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
                                Near-Earth <span className="text-cyan-400">Asteroid Tracker</span>
                            </h1>
                            <p className="text-slate-400 text-lg">Interactive 3D visualization of potentially hazardous asteroids</p>
                        </div>
                        <Asteroid3DScene asteroids={asteroids} />
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <section className="relative overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/20 backdrop-blur-lg shadow-2xl slide-up">
                        <div className="min-w-[900px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/60 border-b border-slate-800">
                                        <th className="p-4 lg:p-5 text-xs font-mono uppercase text-slate-500 tracking-wider">
                                            Object Info
                                        </th>
                                        <th
                                            className="p-4 lg:p-5 text-xs font-mono uppercase text-slate-500 tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                                            onClick={() => requestSort('close_approach_date')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Approach {getSortIcon('close_approach_date')}
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 lg:p-5 text-xs font-mono uppercase text-slate-500 tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                                            onClick={() => requestSort('diameter_m')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Diameter {getSortIcon('diameter_m')}
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 lg:p-5 text-xs font-mono uppercase text-slate-500 tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                                            onClick={() => requestSort('velocity_km_s')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Velocity {getSortIcon('velocity_km_s')}
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 lg:p-5 text-xs font-mono uppercase text-slate-500 tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                                            onClick={() => requestSort('miss_distance_km')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Miss Dist {getSortIcon('miss_distance_km')}
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 lg:p-5 text-xs font-mono uppercase text-slate-500 tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                                            onClick={() => requestSort('riskScore')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Risk {getSortIcon('riskScore')}
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 lg:p-5 text-xs font-mono uppercase text-slate-500 tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                                            onClick={() => requestSort('hazardous')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Hazard {getSortIcon('hazardous')}
                                            </div>
                                        </th>
                                        <th className="p-4 lg:p-5 text-xs font-mono uppercase text-slate-500 tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={`skeleton-${i}`} className="skeleton-row">
                                                <td colSpan={7} className="p-6">
                                                    <div className="h-4 bg-slate-800/50 rounded-full w-full skeleton-shimmer" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : sortedAsteroids.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-12 lg:p-20 text-center">
                                                <div className="flex flex-col items-center gap-4 text-slate-500">
                                                    <Orbit size={48} className="opacity-20" />
                                                    <p className="font-mono text-xs sm:text-sm tracking-widest uppercase">
                                                        No orbital objects detected
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedAsteroids.map((asteroid, index) => (
                                            <tr
                                                key={asteroid.id}
                                                onClick={() => router.push(`/asteroid/${asteroid.id}`)}
                                                className="group hover:bg-cyan-500/5 transition-all duration-300 table-row-fade cursor-pointer"
                                                style={{ animationDelay: `${index * 0.05}s` }}
                                            >
                                                <td className="p-4 lg:p-5">
                                                    <div className="space-y-1">
                                                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors text-sm lg:text-base">
                                                            {asteroid.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                                                            {asteroid.id}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 lg:p-5">
                                                    <div className="flex items-center gap-2 text-xs lg:text-sm font-mono text-slate-300">
                                                        <Calendar
                                                            size={14}
                                                            className="text-slate-500 shrink-0"
                                                        />
                                                        <span className="whitespace-nowrap">
                                                            {asteroid.close_approach_date}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 lg:p-5">
                                                    <div className="flex items-center gap-2 text-xs lg:text-sm font-mono text-slate-300">
                                                        <Maximize2
                                                            size={14}
                                                            className="text-slate-500 shrink-0"
                                                        />
                                                        <span className="whitespace-nowrap">
                                                            {asteroid.diameter_m.toLocaleString()} m
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 lg:p-5">
                                                    <div className="flex items-center gap-2 text-xs lg:text-sm font-mono text-slate-300">
                                                        <Wind
                                                            size={14}
                                                            className="text-slate-500 shrink-0"
                                                        />
                                                        <span className="whitespace-nowrap">
                                                            {asteroid.velocity_km_s.toLocaleString()} km/s
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 lg:p-5">
                                                    <div className="flex items-center gap-2 text-xs lg:text-sm font-mono text-slate-300">
                                                        <Target
                                                            size={14}
                                                            className="text-slate-500 shrink-0"
                                                        />
                                                        <span className="whitespace-nowrap">
                                                            {asteroid.miss_distance_km.toLocaleString()} km
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 lg:p-5">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[60px]">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${asteroid.riskScore}%` }}
                                                                    className={`h-full transition-all duration-1000 ${asteroid.riskScore > 75
                                                                        ? 'bg-red-500'
                                                                        : asteroid.riskScore > 50
                                                                            ? 'bg-orange-500'
                                                                            : asteroid.riskScore > 25
                                                                                ? 'bg-yellow-500'
                                                                                : 'bg-emerald-500'
                                                                        }`}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-mono text-slate-400">
                                                                {asteroid.riskScore}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getRiskColor(
                                                                asteroid.riskLevel
                                                            )} w-fit`}
                                                        >
                                                            {asteroid.riskLevel}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 lg:p-5">
                                                    {asteroid.hazardous ? (
                                                        <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full w-fit risk-pulse">
                                                            <AlertTriangle size={12} />
                                                            <span className="hidden lg:inline">Hazardous</span>
                                                            <span className="lg:hidden">Hazard</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border border-slate-800 rounded-full w-fit">
                                                            <Info size={12} />
                                                            <span className="hidden lg:inline">Safe</span>
                                                            <span className="lg:hidden">OK</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 lg:p-5">
                                                    {isLoggedIn && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSaveAsteroid(asteroid);
                                                            }}
                                                            disabled={saveLoading === asteroid.id || savedIds.has(asteroid.id)}
                                                            className={`p-2 rounded-lg border transition-all ${savedIds.has(asteroid.id)
                                                                ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                                                                : "border-slate-700 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 bg-slate-900/40"
                                                                }`}
                                                            title={savedIds.has(asteroid.id) ? "Saved to Catalog" : "Save to Catalog"}
                                                        >
                                                            {saveLoading === asteroid.id ? (
                                                                <RefreshCw size={16} className="spin-animation" />
                                                            ) : savedIds.has(asteroid.id) ? (
                                                                <BookmarkCheck size={16} />
                                                            ) : (
                                                                <Bookmark size={16} onClick={() => handleSaveAsteroid(asteroid)} />
                                                            )}
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/asteroid/${asteroid.id}`}
                                                        className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 bg-slate-900/40 transition-all"
                                                        title="View Detailed Intelligence"
                                                    >
                                                        <Maximize2 size={16} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ) : (
                    <section className="grid gap-4 sm:gap-6 slide-up">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={`skeleton-card-${i}`}
                                    className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 skeleton-shimmer"
                                >
                                    <div className="h-6 bg-slate-800/50 rounded-full w-3/4 mb-4" />
                                    <div className="h-4 bg-slate-800/50 rounded-full w-1/2" />
                                </div>
                            ))
                        ) : sortedAsteroids.length === 0 ? (
                            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 text-center">
                                <div className="flex flex-col items-center gap-4 text-slate-500">
                                    <Orbit size={48} className="opacity-20" />
                                    <p className="font-mono text-sm tracking-widest uppercase">
                                        No orbital objects detected
                                    </p>
                                </div>
                            </div>
                        ) : (
                            sortedAsteroids.map((asteroid, index) => (
                                <div
                                    key={asteroid.id}
                                    onClick={() => router.push(`/asteroid/${asteroid.id}`)}
                                    className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 sm:p-6 hover:border-cyan-500/30 transition-all duration-300 card-fade cursor-pointer"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                                                {asteroid.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-mono uppercase">
                                                ID: {asteroid.id}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isLoggedIn && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSaveAsteroid(asteroid);
                                                    }}
                                                    disabled={saveLoading === asteroid.id || savedIds.has(asteroid.id)}
                                                    className={`p-2 rounded-lg border transition-all ${savedIds.has(asteroid.id)
                                                        ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                                                        : "border-slate-700 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 bg-slate-900/40"
                                                        }`}
                                                >
                                                    {saveLoading === asteroid.id ? (
                                                        <RefreshCw size={14} className="spin-animation" />
                                                    ) : savedIds.has(asteroid.id) ? (
                                                        <BookmarkCheck size={14} />
                                                    ) : (
                                                        <Bookmark size={14} />
                                                    )}
                                                </button>
                                            )}
                                            <Link
                                                href={`/asteroid/${asteroid.id}`}
                                                className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 bg-slate-900/40 transition-all font-bold text-[10px] flex items-center gap-2"
                                            >
                                                <Maximize2 size={14} />
                                                DETAILS
                                            </Link>
                                            {asteroid.hazardous ? (
                                                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full w-fit risk-pulse">
                                                    <AlertTriangle size={14} />
                                                    Hazardous
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-slate-800 rounded-full w-fit">
                                                    <Info size={14} />
                                                    Safe
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                                        <div className="bg-slate-950/50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                <Calendar size={12} />
                                                Approach Date
                                            </div>
                                            <div className="text-sm font-mono text-white">
                                                {asteroid.close_approach_date}
                                            </div>
                                        </div>
                                        <div className="bg-slate-950/50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                <Maximize2 size={12} />
                                                Diameter
                                            </div>
                                            <div className="text-sm font-mono text-white">
                                                {asteroid.diameter_m.toLocaleString()} m
                                            </div>
                                        </div>
                                        <div className="bg-slate-950/50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                <Wind size={12} />
                                                Velocity
                                            </div>
                                            <div className="text-sm font-mono text-white">
                                                {asteroid.velocity_km_s.toLocaleString()} km/s
                                            </div>
                                        </div>
                                        <div className="bg-slate-950/50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                <Target size={12} />
                                                Miss Distance
                                            </div>
                                            <div className="text-sm font-mono text-white">
                                                {asteroid.miss_distance_km.toLocaleString()} km
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 rounded-xl p-3">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                                            <Gauge size={12} />
                                            Risk Assessment
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${asteroid.riskScore > 75
                                                        ? 'bg-red-500'
                                                        : asteroid.riskScore > 50
                                                            ? 'bg-orange-500'
                                                            : asteroid.riskScore > 25
                                                                ? 'bg-yellow-500'
                                                                : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${asteroid.riskScore}%` }}
                                                />
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-md text-xs font-bold border ${getRiskColor(
                                                    asteroid.riskLevel
                                                )}`}
                                            >
                                                {asteroid.riskLevel} {asteroid.riskScore}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                )}

                <footer className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">
                    <div className="text-center sm:text-left">Generated by NASA NEO API</div>
                    <div className="text-center sm:text-right">
                        Last Update: {new Date().toLocaleTimeString()} UTC
                    </div>
                </footer>
            </div>
        </div>
    );
}
