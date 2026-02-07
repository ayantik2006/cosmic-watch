"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    User,
    MessageSquare,
} from "lucide-react";
import * as socketIO from "socket.io-client";
import axios from "axios";

// Handle potential import variations across socket.io versions
const io = (socketIO as any).io || (socketIO as any).default || socketIO;

interface Message {
    id: string;
    sender: string;
    text: string;
    timestamp: string;
    isMe: boolean;
    role?: 'Commander' | 'Scientist' | 'Observer';
    avatar?: string;
    email: string;
}

export default function CommunityPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [profile, setProfile] = useState<{ name: string, photoURL: string, email: string } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("/api/user-profile");
                setProfile(res.data);
            } catch (err) {
                console.error("DEBUG: Failed to load profile", err);
            }
        };
        fetchProfile();
    }, []);

    // Initial fetch and polling fallback
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get("/api/messages");
                if (res.data.messages) {
                    const mapped = res.data.messages.map((m: any) => ({
                        id: m._id,
                        sender: m.sender,
                        text: m.text,
                        timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isMe: profile?.email === m.email,
                        avatar: m.avatar,
                        email: m.email,
                    }));

                    setMessages(prev => {
                        // Merge logic: keep local optimistic messages that haven't been saved yet
                        const nonTempMessages = prev.filter(m => !m.id.startsWith("temp-"));
                        const merged = [...mapped];

                        // If we have a mapped message with same text and timestamp as a temp one, it's the same one
                        // But IDs are more reliable once swapped.

                        // For simplicity, if we have new messages from server, we update the list
                        // but keep temp ones that aren't in the mapped list yet.
                        const tempOnes = prev.filter(m => m.id.startsWith("temp-"));

                        // Avoid unnecessary updates
                        if (JSON.stringify(nonTempMessages) === JSON.stringify(mapped)) return prev;

                        return [...mapped, ...tempOnes];
                    });
                }
            } catch (err) {
                console.error("DEBUG: Failed to fetch messages", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [profile]);

    // Socket initialization
    useEffect(() => {
        if (!profile) return;

        const socketInitializer = async () => {
            console.log("DEBUG: Attempting socket connection...");
            try {
                // We keep the attempt to initialize the server, 
                // but we know it might 404 in this environment
                await axios.get("/api/socket");

                const socketInstance = io(window.location.origin, {
                    path: "/api/socket",
                    reconnection: true,
                });

                socketRef.current = socketInstance;

                socketInstance.on("connect", () => {
                    console.log("DEBUG: Socket Connected!");
                });

                socketInstance.on("receive-message", (message: any) => {
                    setMessages((prev) => {
                        if (prev.some(m => m.id === message.id)) return prev;
                        return [...prev, {
                            ...message,
                            isMe: profile?.email === message.email
                        }].sort((a, b) => a.id.startsWith("temp-") ? 1 : -1); // Keep temp ones at end
                    });
                });
            } catch (e) {
                console.warn("DEBUG: Socket initialization failed, falling back to polling.");
            }
        };

        socketInitializer();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [profile]);

    // Update isMe once profile is available
    useEffect(() => {
        if (profile) {
            setMessages(prev => prev.map(m => ({
                ...m,
                isMe: m.email === profile.email
            })));
        }
    }, [profile]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const textToSubmit = inputText.trim();

        if (!textToSubmit || !profile) {
            console.warn("DEBUG: Send failed - empty text or no profile");
            return;
        }

        console.log("DEBUG: Preparing to send message via API:", textToSubmit);
        setInputText("");

        // Optimistic UI Update
        const tempId = "temp-" + Date.now();
        const optimisticMsg: Message = {
            id: tempId,
            sender: profile.name,
            text: textToSubmit,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            avatar: profile.photoURL,
            email: profile.email,
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            // RELIABLE DB PERSISTENCE via App Router API
            const res = await axios.post("/api/messages", { text: textToSubmit });

            if (res.status === 200) {
                const savedMsg = res.data.message;
                console.log("DEBUG: Message saved successfully via API", savedMsg._id);

                // Update the optimistic message with real DB ID
                setMessages(prev => prev.map(m => m.id === tempId ? {
                    ...m,
                    id: savedMsg._id,
                    timestamp: new Date(savedMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                } : m));

                // Also emit to socket for real-time (if connected)
                if (socketRef.current && socketRef.current.connected) {
                    console.log("DEBUG: Emitting broadcast event to socket...");
                    socketRef.current.emit("send-message", {
                        id: savedMsg._id,
                        sender: savedMsg.sender,
                        text: savedMsg.text,
                        email: savedMsg.email,
                        avatar: savedMsg.avatar,
                        timestamp: new Date(savedMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                } else {
                    console.warn("DEBUG: Socket not connected, but message was saved to DB.");
                }
            }
        } catch (err: any) {
            console.error("DEBUG: Failed to save message via API", err.message);
            // Optionally remove the optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    return (
        <div className="min-h-screen bg-black text-slate-200 pt-17 pb-2 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto h-[calc(100vh-110px)] flex flex-col gap-6">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                    >
                    </motion.div>
                </header>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-h-0">

                    {/* Chat Window */}
                    <main className="flex-1 bg-slate-900/10 border border-blue-500/20 rounded-[2.5rem] flex flex-col overflow-hidden backdrop-blur-sm relative shadow-2xl">

                        {/* Messages Sub-Header */}
                        <div className="p-6 border-b border-blue-500/20 flex items-center justify-between bg-slate-950/20">
                            <div className="flex items-center gap-4">
                                <div className="px-6 h-10 rounded-2xl border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold uppercase tracking-tight">
                                    Community Chatroom
                                </div>
                            </div>
                        </div>

                        {/* Messages History */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth custom-scrollbar"
                        >
                            <AnimatePresence initial={false}>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className="w-10 h-10 rounded-full shrink-0 border border-slate-700 bg-slate-800 overflow-hidden self-start mt-1">
                                                {msg.avatar ? (
                                                    <img src={msg.avatar} alt={msg.sender} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} space-y-1`}>
                                                <div className="flex items-center gap-3 px-1">
                                                    <span className="text-[11px] font-bold text-slate-300">
                                                        {msg.isMe ? "You" : msg.sender}
                                                    </span>
                                                    <span className="text-[13px] font-mono text-slate-500">
                                                        {msg.timestamp}
                                                    </span>
                                                </div>

                                                <div className={`
                                                    p-2 px-4 rounded-3xl text-sm relative border transition-all duration-300 shadow-lg
                                                    ${msg.isMe
                                                        ? 'bg-linear-to-br from-cyan-600 to-blue-700 text-white border-white/10 rounded-tr-none'
                                                        : 'bg-slate-900 border-slate-800 text-slate-300 rounded-tl-none'
                                                    }
                                                `}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Message Input */}
                        <div className="p-6 bg-slate-950/40 backdrop-blur-md border-t border-slate-800">
                            <form
                                onSubmit={handleSendMessage}
                                className="relative flex items-center gap-3"
                            >
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="TYPE DISPATCH TRANSMISSION..."
                                        className="w-full bg-black/60 border border-blue-500/40 rounded-2xl py-4 pl-5 pr-12 text-xs font-mono tracking-wide focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="p-4 bg-blue-400/80 text-black rounded-2xl hover:bg-blue-400 transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-600 shadow-lg shadow-cyan-500/20"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                            <div className="mt-3">
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </div>
    );
}
