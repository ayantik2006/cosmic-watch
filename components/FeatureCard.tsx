"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export default function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative h-full p-6 bg-slate-900 border border-slate-700/50 rounded-xl shadow-lg ring-1 ring-white/10"
            >
                <div className="flex flex-col h-full bg-slate-900 ">
                    <div className="flex items-center justify-center w-12 h-12 mb-4 bg-primary/10 rounded-full transition-all duration-300 group-hover:mb-2 group-hover:scale-90 origin-top-left">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 z-10">{title}</h3>
                    
                    <motion.div 
                        initial={{ opacity: 0.6, y: 5 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="text-slate-400 text-sm leading-relaxed"
                    >
                         {description}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
