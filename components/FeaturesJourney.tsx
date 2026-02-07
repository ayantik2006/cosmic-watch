"use client";

import { Radar, Globe, Activity, AlertTriangle } from "lucide-react";

const features = [
  {
    title: "Detection Layer",
    description:
      "Continuous ingestion of Near-Earth Object data streams from astronomical surveys.",
    icon: Radar,
  },
  {
    title: "Trajectory Engine",
    description:
      "High-precision orbital propagation and future path simulation.",
    icon: Globe,
  },
  {
    title: "Risk Computation",
    description:
      "Velocity, proximity, and uncertainty analysis using weighted models.",
    icon: Activity,
  },
  {
    title: "Alert & Classification",
    description:
      "Automated threat categorization and priority-based alerts.",
    icon: AlertTriangle,
  },
];

export default function FeaturesJourney() {
  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <div
            key={i}
            className="relative bg-black/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
          >
            <div className="w-12 h-12 mb-6 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-400" />
            </div>

            <h3 className="text-xl font-bold mb-3">
              {f.title}
            </h3>

            <p className="text-slate-400 leading-relaxed text-sm">
              {f.description}
            </p>

            <span className="absolute top-4 right-4 text-xs text-slate-500">
              0{i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}