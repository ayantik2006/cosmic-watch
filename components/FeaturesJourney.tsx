"use client";

import React, { useRef } from "react";
import { Radar, Globe, Activity, AlertTriangle } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const dotTop = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const dotOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  return (
    <div ref={containerRef} className="relative max-w-4xl mx-auto py-20 px-4">
      {/* The Path Line */}
      <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 hidden md:block" />

      {/* The Progression Line (Animated) */}
      <motion.div
        style={{ scaleY: smoothProgress, transformOrigin: "top" }}
        className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-blue-500 to-cyan-400 -translate-x-1/2 hidden md:block"
      />

      {/* The Moving Dot */}
      <motion.div
        style={{
          top: dotTop,
          opacity: dotOpacity
        }}
        className="absolute left-8 lg:left-1/2 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] -translate-x-1/2 z-20 hidden md:flex items-center justify-center"
      >
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      </motion.div>

      <div className="space-y-24">
        {features.map((f, i) => {
          const Icon = f.icon;
          const isEven = i % 2 === 0;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isEven ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`relative flex flex-col ${isEven ? 'md:items-end md:text-right md:pr-16 lg:pr-24' : 'md:items-start md:text-left md:pl-16 lg:pl-24'} md:w-1/2 ${!isEven && 'md:ml-auto'}`}
            >
              {/* Mobile Dot */}
              <div className="absolute left-[-1.6rem] top-8 w-3 h-3 rounded-full bg-blue-500 md:hidden z-10 border-4 border-black box-content" />

              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-500 hover:bg-white/[0.07] w-full shadow-2xl">
                <span className={`absolute -top-6 ${isEven ? 'right-8' : 'left-8'} font-mono text-4xl lg:text-6xl text-white/5 font-black group-hover:text-blue-500/10 transition-colors pointer-events-none`}>
                  0{i + 1}
                </span>

                <div className={`w-14 h-14 mb-8 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-500/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ${isEven ? 'md:ml-auto' : ''}`}>
                  <Icon className="w-7 h-7 text-blue-400" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">
                  {f.title}
                </h3>

                <p className="text-slate-400 leading-relaxed text-sm lg:text-base max-w-sm">
                  {f.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}