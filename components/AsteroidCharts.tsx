"use client";

import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from "recharts";

interface EncounterData {
    date: string;
    velocity: number;
    distance: number;
}

interface SizeData {
    name: string;
    min: number;
    max: number;
    color: string;
}

export const EncounterTrendsChart = ({ data }: { data: EncounterData[] }) => {
    return (
        <div className="w-full h-[300px] bg-slate-900/40 p-6 rounded-2xl border border-blue-500/10 backdrop-blur-sm">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Encounter Delta: Velocity vs. Distance
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" }}
                        itemStyle={{ color: "#94a3b8" }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="velocity"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="distance"
                        stroke="#94a3b8"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const AsteroidSizeChart = ({ min, max }: { min: number, max: number }) => {
    const comparisonData: SizeData[] = [
        { name: "This Asteroid", min, max, color: "#3b82f6" },
        { name: "Eiffel Tower", min: 300, max: 330, color: "#1e293b" },
        { name: "Empire State", min: 380, max: 443, color: "#1e293b" },
        { name: "Burj Khalifa", min: 828, max: 830, color: "#1e293b" },
    ];

    return (
        <div className="w-full h-[300px] bg-slate-900/40 p-6 rounded-2xl border border-blue-500/10 backdrop-blur-sm">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                Kinetic Scale: Comparative Diameter (Meters)
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#94a3b8"
                        fontSize={10}
                        width={80}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Bar dataKey="max" radius={[0, 4, 4, 0]}>
                        {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={index === 0 ? 1 : 0.4} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
