"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Eye, EyeOff, Sparkles, ChevronRight } from "lucide-react";


export default function AdminLogin() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [credentials, setCredentials] = useState({
        username: "",
        password: ""
    });

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        // Check if already logged in
        if (typeof window !== 'undefined' && localStorage.getItem('harnam_admin_auth') === 'true') {
            router.push('/admin');
        }
        return () => clearTimeout(timer);
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Artificial delay for premium feel
        await new Promise(r => setTimeout(r, 1500));

        if (credentials.username === "harnam" && credentials.password === "harnam@masale") {
            localStorage.setItem("harnam_admin_auth", "true");
            localStorage.setItem("harnam_admin_user", credentials.username);
            router.push("/admin");
        } else {
            setError("Invalid credentials. Please try again.");
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-inter">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-20" />

            <div className="w-full max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
                >
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                            <Lock className="text-primary w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter mb-2 italic">Admin <span className="text-primary">Gate</span></h1>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em]">Harnam Foods Management</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Identification</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors w-4 h-4" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Username"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-bold outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-zinc-700"
                                    value={credentials.username}
                                    onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Access Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors w-4 h-4" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Password"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-white text-sm font-bold outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-zinc-700"
                                    value={credentials.password}
                                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black p-4 rounded-xl text-center uppercase tracking-wider"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 smooth-transition overflow-hidden relative group disabled:opacity-50"
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>AUTHENTICATING</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <span>ENTER MANAGEMENT</span>
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </form>

                    <div className="mt-10 flex items-center justify-center gap-8 opacity-40">
                        <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Secure TLS 1.3</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Lock size={12} className="text-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Encrypted Auth</span>
                        </div>
                    </div>
                </motion.div>

                <p className="text-center mt-8 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                    &copy; 2026 Harnam Foods &bull; Unauthorized Access Prohibited
                </p>
            </div>
        </div>
    );
}
