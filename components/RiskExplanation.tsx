"use client";

import {
  ShieldAlert,
  Gauge,
  Orbit,
  TriangleAlert,
} from "lucide-react";

export default function RiskExplanation() {
  return (
    <section className="relative max-w-7xl mx-auto">

      {/* Header */}
      <header className="mb-20 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
          Threat Assessment Console
        </h2>
        <p className="text-slate-400 max-w-3xl mx-auto text-lg">
          Every object is evaluated using orbital and kinetic parameters to
          determine potential impact risk.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Orbital Distance */}
        <Panel
          icon={Orbit}
          title="Orbital Distance"
          description="Minimum predicted distance between Earth and the object during closest approach."
          meta="Miss Distance (km)"
        />

        {/* Relative Velocity */}
        <Panel
          icon={Gauge}
          title="Relative Velocity"
          description="Higher velocities reduce reaction time and increase potential impact energy."
          meta="km/s at encounter"
        />

        {/* Size Estimation */}
        <Panel
          icon={TriangleAlert}
          title="Size Estimation"
          description="Estimated diameter determines kinetic impact potential and damage radius."
          meta="Diameter (m)"
        />

        {/* Composite Risk */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl
          shadow-[0_0_0_1px_rgba(59,130,246,0.15)]">

          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-blue-300" />
            <h3 className="font-semibold text-slate-100">
              Composite Risk Score
            </h3>
          </div>

          {/* Blue signal bar */}
          <div className="h-1 w-full rounded-full bg-blue-400/30 mb-4">
            <div className="h-full w-[65%] bg-blue-400" />
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            Weighted aggregation of distance, velocity, and size used to classify
            threat level and alert priority.
          </p>

          <div className="mt-6 text-sm text-blue-300 font-medium">
            Status: Under Observation
          </div>
        </div>

      </div>
    </section>
  );
}

/* ---------------- PANEL COMPONENT ---------------- */

function Panel({
  icon: Icon,
  title,
  description,
  meta,
}: {
  icon: any;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl
      hover:border-blue-400/30 transition">

      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5 text-blue-300" />
        <h3 className="font-medium">{title}</h3>
      </div>

      {/* Subtle divider */}
      <div className="h-px bg-blue-400/20 mb-4" />

      <p className="text-slate-400 text-sm leading-relaxed">
        {description}
      </p>

      <div className="mt-6 text-xs text-blue-300 tracking-wide">
        {meta}
      </div>
    </div>
  );
}