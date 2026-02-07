"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/auth";

export default function Navbar() {
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        checkLoginStatus();
    }, []);

    // Close menu when pathname changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const checkLoginStatus = () => {
        axios.post("/api/check-login", {}, { withCredentials: true })
            .then((res) => {
                if (res.data.email) {
                    setIsLoggedin(true);
                }
            })
            .catch((err) => {
                setIsLoggedin(false);
            });
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsLoggingIn(true);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();
            await axios.post("/api/login", { idToken: idToken }, { withCredentials: true });
            setIsLoggedin(true);
            setIsLoggingIn(false);
            router.refresh();
        } catch (err) {
            console.error(err);
            setIsLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("/api/logout");
            setIsLoggedin(false);
            router.push("/");
            router.refresh();
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Asteroids", href: "/asteroids" },
        { name: "Community", href: "/community" },
        ...(isLoggedin ? [{ name: "Saved", href: "/saved-asteroids" }] : []),
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-md border-b border-white/5">
            <div className="container mx-auto px-3 lg:px-10 h-17 flex items-center justify-between">

                {/* Mobile Menu Button */}
                <div className="flex md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-slate-400 hover:text-white transition-colors"
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-sm tracking-widest uppercase font-bold transition-colors duration-200 ${pathname === link.href
                                ? "text-primary"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Auth Section */}
                <div className="hidden md:flex items-center gap-4">
                    {isLoggedin ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 uppercase font-bold rounded-full hover:bg-white/5 transition-all text-sm text-white"
                            >
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                                <span>Dashboard</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 uppercase font-bold rounded-full hover:bg-red-500/10 transition-all text-sm text-red-400"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>

                            {/* Mobile Dashboard Icon only */}
                            <Link
                                href="/dashboard"
                                className="flex sm:hidden p-2 rounded-full border border-white/10 text-primary"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                            </Link>
                        </>
                    ) : (
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoggingIn}
                            className="px-6 py-2 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 rounded-full text-sm font-bold tracking-wide transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingIn ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ...
                                </span>
                            ) : (
                                "SIGN UP"
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="flex flex-col p-6 gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-lg tracking-widest uppercase font-bold transition-colors ${pathname === link.href
                                    ? "text-primary"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {isLoggedin ? (
                            <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-3 text-slate-400 hover:text-white font-bold uppercase tracking-widest"
                                >
                                    <LayoutDashboard className="w-5 h-5 text-primary" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 text-red-400 hover:text-red-300 font-bold uppercase tracking-widest text-left"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            // <button
                            //     onClick={handleGoogleSignIn}
                            //     disabled={isLoggingIn}
                            //     className="px-6 py-2 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 rounded-full text-sm font-bold tracking-wide transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            // >
                            //     {isLoggingIn ? (
                            //         <div className="flex items-center gap-2">
                            //             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            //             <span>Authenticating...</span>
                            //         </div>
                            //     ) : (
                            //         "Login with Google"
                            //     )}
                            // </button>
                            <button
                                onClick={handleGoogleSignIn}
                                className="flex items-center gap-3 text-blue-400 hover:text-blue-400/90 font-bold uppercase tracking-widest text-left pt-6 border-t border-white/5 cursor-pointer"
                            >
                                {isLoggingIn ? "Authenticating..." : "Login"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
