"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Database,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Loader2,
  LogOut,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  photoURL: string;
  savedCount: number;
  joiningDate?: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user-profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">Synching Neural Profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-black text-slate-200 py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-end gap-6"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="relative w-32 h-32 rounded-full border-2 border-slate-800 object-cover"
              />
              <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-full border-4 border-black group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="text-center md:text-left space-y-2 pb-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{profile.name}</span>
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 font-mono text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-cyan-500/50" />
                  {profile.email}
                </div>
                {/* <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-cyan-500/50" />
                  Joined {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
                </div> */}
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                  <Database size={24} />
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Security Status: Verified</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Orbital Catalog</h2>
                <p className="text-slate-400 text-sm">Review your tracked celestial objects and potential impact risks.</p>
              </div>
            </div>
            <div className="mt-8 flex items-end justify-between">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Saved Objects</div>
                <div className="text-5xl font-bold text-white font-mono">{profile.savedCount}</div>
              </div>
              <Link
                href="/saved-asteroids"
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-cyan-400 transition-all active:scale-95 group"
              >
                VIEW CATALOG
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all"></div>
            <div className="space-y-6 relative z-10">
              <h3 className="text-lg font-bold text-white">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/asteroids"
                  className="w-full flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-cyan-500/40 transition-all group/item"
                >
                  <span className="text-sm font-medium">New Observation</span>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover/item:text-cyan-400" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:bg-rose-500/10 hover:border-rose-500/40 transition-all group/logout"
                >
                  <span className="text-sm font-medium text-slate-300 group-hover/logout:text-rose-400">Secure Logout</span>
                  <LogOut className="w-4 h-4 text-slate-600 group-hover/logout:text-rose-400" />
                </button>
              </div>
            </div>
            <div className="mt-8 text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] relative z-10">
              System Node: {profile.email.split('@')[0]}
            </div>
          </motion.div>
        </div>

        {/* <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Deep Space Monitor Alpha 2.4</div>
          <div className="flex gap-6 text-[10px] font-mono text-slate-700 uppercase">
            <span>Connection: Encryption Locked</span>
            <span>Server: Orbital-Node-01</span>
          </div>
        </motion.footer> */}
      </div>
    </div>
  );
}