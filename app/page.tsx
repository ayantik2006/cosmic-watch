"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Github, Linkedin } from "lucide-react";

import Earth3D from "../components/Earth3D";
import FeaturesJourney from "../components/FeaturesJourney";
import RiskExplanation from "../components/RiskExplanation";
import { auth } from "@/firebase/auth";

export default function Home() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  /* -----------------------------
     Check login
  ----------------------------- */
  useEffect(() => {
    const checkLogin = async () => {
      try {
        await axios.post("/api/check-login", {}, { withCredentials: true });
        // router.replace("/dashboard");
      } catch { }
      setAuthChecked(true);
    };
    checkLogin();
  }, [router]);

  /* -----------------------------
     Google Login
  ----------------------------- */
  const handleGoogleSignIn = useCallback(async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      const idToken = await user.getIdToken();

      await axios.post("/api/login", { idToken }, { withCredentials: true });
      router.push("/dashboard");
    } catch (err) {
      if (
        err instanceof FirebaseError &&
        err.code !== "auth/popup-closed-by-user"
      ) {
        console.error(err.code);
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, [isLoggingIn, router]);

  if (!authChecked) return null;

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden selection:bg-blue-500/30">

      {/* ================= BACKGROUND ================= */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/40 to-black" />
        <Earth3D />
      </div>

      {/* ================= HERO ================= */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-28">
        <div className="max-w-5xl text-center space-y-10 animate-fade-in-up">

          <h1
            className="text-6xl md:text-8xl font-extrabold tracking-tight
            bg-linear-to-b from-white via-white/80 to-white/40
            bg-clip-text text-transparent drop-shadow-2xl"
          >
            COSMIC WATCH
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Real-time monitoring of Near-Earth Objects using live orbital data,
            predictive modeling, and collision-risk intelligence.
          </p>
        </div>

        <div className="absolute bottom-10 animate-bounce text-slate-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="relative z-10 py-32 bg-slate-900/80 backdrop-blur-xl
        rounded-t-[10rem] lg:rounded-t-[20rem] border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6">

          <header className="text-center mb-32">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Planetary Intelligence
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg">
              From detection to prediction — Cosmic Watch transforms raw space
              telemetry into actionable planetary-defense insights.
            </p>
          </header>

          <FeaturesJourney />

          <div className="mt-40">
            <RiskExplanation />
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="h-10 relative z-10 pt-1 pb-12 border-t border-white/5 bg-black/80 backdrop-blur-md flex justify-center w-full">
        <div className="max-w-7xl mx-auto px-6 pt-3">
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"> */}

            {/* Column 1: Brand */}
            {/* <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-blue-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold tracking-tighter">COSMIC WATCH</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Leveraging distributed telemetry and orbital intelligence to safeguard Earth from near-space threats.
              </p>
            </div> */}

            {/* Column 2: Navigation */}
            {/* <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-6">Operations</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="/asteroids" className="text-slate-400 hover:text-white transition">Asteroid Monitor</a></li>
                <li><a href="/categories" className="text-slate-400 hover:text-white transition">Hazard Analysis</a></li>
                <li><a href="/community" className="text-slate-400 hover:text-white transition">Dispatch Core</a></li>
              </ul>
            </div> */}

            {/* Column 3: Resources */}
            {/* <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-6">Intelligence</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition">Telemetry API</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">Impact Models</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">Network Status</a></li>
              </ul>
            </div> */}

            {/* Column 4: Contact/Social */}
            {/* <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-6">Connect</h4>
              <div className="flex gap-4">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                  <Github className="w-5 h-5 text-slate-300" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                  <Linkedin className="w-5 h-5 text-slate-300" />
                </a>
              </div>
            </div> */}

          {/* </div> */}

          {/* <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              © {new Date().getFullYear()} Team Momentum // GLOBAL DEFENSE INITIATIVE
            </div>
            <div className="flex gap-8 text-[11px] font-bold uppercase tracking-tighter text-slate-600">
              <a href="#" className="hover:text-blue-400 transition">Privacy Protocol</a>
              <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition">Contact Command</a>
            </div>
          </div> */}
          <div className="text-neutral-400">
            Built with ❤️ by Team Momentum
          </div>
          {/* <div className="flex gap-2">
            <Linkedin className="w-5 h-5 text-slate-300" />
          </div> */}
        </div>
      </footer>
    </main>
  );
}