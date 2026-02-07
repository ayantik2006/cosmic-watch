"use client";

import {
  ShieldAlert,
  Gauge,
  Orbit,
  TriangleAlert,
  Zap,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

export default function RiskExplanation() {
  return (
    <section className="relative max-w-7xl mx-auto py-24">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="mb-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <Activity size={12} /> Analytical Metrics
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-4 tracking-tighter bg-linear-to-b from-white to-slate-500 bg-clip-text text-transparent italic uppercase">
            Threat Assessment Console
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Our proprietary algorithm evaluates every Near-Earth Object using
            <span className="text-white"> orbital</span> and <span className="text-white">kinetic</span> parameters to calculate absolute impact probability.
          </p>
        </motion.div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {/* Orbital Distance */}
        <Panel
          index={0}
          icon={Orbit}
          title="Orbital Distance"
          description="Minimum predicted distance between Earth and the object during closest approach."
          meta="Astronomical Units"
          color="blue"
          status="Tracking"
        />

        {/* Relative Velocity */}
        <Panel
          index={1}
          icon={Gauge}
          title="Relative Velocity"
          description="Higher velocities reduce reaction time and exponentially increase potential impact energy."
          meta="Kilometers / Sec"
          color="cyan"
          status="Syncing"
        />

        {/* Size Estimation */}
        <Panel
          index={2}
          icon={TriangleAlert}
          title="Size Estimation"
          description="Estimated diameter determines kinetic impact potential and the resultant damage radius."
          meta="Metric: Meters"
          color="amber"
          status="Calibrated"
        />

        {/* Composite Risk */}
        <Panel
          index={3}
          icon={ShieldAlert}
          title="Risk Engine 1.0"
          description="Weighted aggregation of distance, velocity, and size used to classify threat levels."
          meta="Composite Index"
          color="blue"
          status="Observing"
          isEngine
        />
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-6 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">
          <span>Algorithm Hash: 0x7E3...A1F</span>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <span>Telemetry Verified: NASA_AM01</span>
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
  index,
  color,
  status,
  isEngine
}: {
  icon: any;
  title: string;
  description: string;
  meta: string;
  index: number;
  color: string;
  status: string;
  isEngine?: boolean;
}) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-[#0a0f1a] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl hover:border-blue-500/40 transition-all duration-500 overflow-hidden"
    >
      {/* Background Icon Accent */}
      <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none">
        <Icon size={160} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6 ${colors[color] || colors.blue}`}>
            <Icon size={22} />
          </div>
          <h3 className="font-bold text-white tracking-tight text-lg leading-tight uppercase italic">{title}</h3>
        </div>

        {/* Segmented signal bar */}
        <div className="flex gap-1 mb-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-xs transition-all duration-1000 ${i < (isEngine ? 6 : 4) ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]' : 'bg-white/5'}`}
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mb-10 h-16 line-clamp-3">
          {description}
        </p>

        <div className="flex items-center justify-between border-t border-white/5 pt-6 font-mono">
          <div className="flex flex-col gap-1">
            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Metric</div>
            <div className="text-[10px] text-blue-400/60 font-black tracking-widest uppercase">{meta}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Status</div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isEngine ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400/50'}`} />
              <span className="text-[10px] text-white font-bold uppercase tracking-widest">{status}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
