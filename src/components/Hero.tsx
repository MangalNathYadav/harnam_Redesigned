"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { ArrowRight, ChevronDown, Sparkles, Flame } from "lucide-react";
import { motion, Variants, AnimatePresence } from "framer-motion";

import { SitePresets } from "@/types/database";

type Particle =
    | { type: 'snow'; width: number; height: number; left: number; duration: number; delay: number }
    | { type: 'rain'; left: number; duration: number; delay: number }
    | { type: 'flower'; color: string; size: number; left: number; duration: number; delay: number };

const EnvironmentalEffects = ({ presets }: { presets: SitePresets | null }) => {
    const effect = presets?.activePresetId;

    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (!effect) {
            const timer = setTimeout(() => setParticles([]), 0);
            return () => clearTimeout(timer);
        }

        if (effect === 'winter' || effect === 'christmas') {
            const snow = [...Array(30)].map(() => ({
                type: 'snow' as const,
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                left: Math.random() * 100,
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 5,
            }));
            setTimeout(() => setParticles(snow), 0);
            return;
        }

        if (effect === 'monsoon') {
            const rain = [...Array(50)].map(() => ({
                type: 'rain' as const,
                left: Math.random() * 100,
                duration: Math.random() * 0.5 + 0.5,
                delay: Math.random() * 2,
            }));
            setTimeout(() => setParticles(rain), 0);
            return;
        }

        if (effect === 'spring' || effect === 'holi') {
            const colors = ['bg-pink-200', 'bg-red-200', 'bg-yellow-200', 'bg-purple-200'];
            const flowers = [...Array(20)].map(() => ({
                type: 'flower' as const,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 10 + 5,
                left: Math.random() * 100,
                duration: Math.random() * 5 + 5,
                delay: Math.random() * 10,
            }));
            setTimeout(() => setParticles(flowers), 0);
            return;
        }

        setTimeout(() => setParticles([]), 0);
    }, [effect]);

    if (!effect || particles.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {particles.map((p, i) => {
                if (p.type === 'snow') {
                    return (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full opacity-60 animate-fall"
                            style={{
                                width: p.width + 'px',
                                height: p.height + 'px',
                                left: p.left + '%',
                                animationDuration: p.duration + 's',
                                animationDelay: p.delay + 's',
                                filter: 'blur(1px)'
                            }}
                        />
                    );
                }
                if (p.type === 'rain') {
                    return (
                        <div
                            key={i}
                            className="absolute bg-white/30 animate-rain"
                            style={{
                                width: '1px',
                                height: '40px',
                                left: p.left + '%',
                                animationDuration: p.duration + 's',
                                animationDelay: p.delay + 's',
                            }}
                        />
                    );
                }
                if (p.type === 'flower') {
                    return (
                        <div
                            key={i}
                            className={`absolute rounded-full opacity-40 animate-flower ${p.color}`}
                            style={{
                                width: p.size + 'px',
                                height: p.size + 'px',
                                left: p.left + '%',
                                animationDuration: p.duration + 's',
                                animationDelay: p.delay + 's',
                            }}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};

const Hero = () => {
    const [presets, setPresets] = useState<SitePresets | null>(null);

    useEffect(() => {
        const presetsRef = ref(db, 'site_presets');
        const unsubscribe = onValue(presetsRef, (snapshot) => {
            const data = snapshot.val() as SitePresets;
            if (data) setPresets(data);
        });
        return () => unsubscribe();
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const getThemeOverlay = () => {
        if (!presets) return "bg-gradient-to-b from-black/60 via-black/30 to-black/60";
        switch (presets.activeTheme) {
            case "Midnight Spice": return "bg-gradient-to-b from-zinc-950/80 via-zinc-900/40 to-zinc-950/80";
            case "Holi Colors": return "bg-gradient-to-b from-pink-900/40 via-purple-900/20 to-indigo-900/40";
            case "Monsoon Special": return "bg-gradient-to-b from-blue-900/40 via-cyan-900/20 to-blue-900/40";
            case "Royal Tradition": return "bg-gradient-to-b from-orange-950/60 via-amber-900/40 to-orange-950/60";
            case "Winter Warm": return "bg-gradient-to-b from-sky-950/60 via-blue-900/40 to-sky-950/60";
            default: return "bg-gradient-to-b from-black/60 via-black/30 to-black/60";
        }
    };

    const [imageError, setImageError] = useState(false);

    const getFallBackGradient = () => {
        if (!presets) return "bg-zinc-950";
        switch (presets.activeTheme) {
            case "Midnight Spice": return "bg-[radial-gradient(circle_at_top_right,_var(--color-primary)_0%,_#09090b_100%)]";
            case "Holi Colors": return "bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700";
            case "Monsoon Special": return "bg-gradient-to-br from-blue-700 via-cyan-800 to-zinc-950";
            case "Royal Tradition": return "bg-gradient-to-br from-amber-600 via-orange-800 to-zinc-950";
            case "Winter Warm": return "bg-gradient-to-br from-sky-400 via-blue-600 to-slate-900";
            default: return "bg-zinc-950";
        }
    };

    return (
        <section className="relative h-[100vh] w-full flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-zinc-950">
            {/* Background with Ken Burns Effect */}
            <motion.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                className="absolute inset-0 z-0"
            >
                {(!presets?.heroVideo || imageError || presets.heroVideo === "/assets/hero_banner.png") ? (
                    <div className={`absolute inset-0 ${getFallBackGradient()} opacity-80`} />
                ) : (
                    <Image
                        src={presets.heroVideo}
                        alt="Premium Spices Hero"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                        onError={() => setImageError(true)}
                    />
                )}
                <div className={`absolute inset-0 ${getThemeOverlay()} backdrop-blur-[1px]`}></div>
            </motion.div>

            <EnvironmentalEffects presets={presets} />

            {/* Festival Overlay Effects */}
            <AnimatePresence>
                {presets?.isFestivalMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-5 bg-[radial-gradient(circle_at_center,_var(--color-secondary)_0%,_transparent_70%)] pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Content Section */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-20 max-w-5xl px-4"
            >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8">
                    {presets?.isFestivalMode ? <Flame className="w-4 h-4 text-secondary animate-pulse" /> : <Sparkles className="w-4 h-4 text-secondary" />}
                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">
                        {presets?.isFestivalMode ? presets.festivalName : "Premium Quality Spices"}
                    </span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black mb-8 text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
                    Authentic <br /> <span className="text-secondary italic">Indian Spices</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-white/80 text-lg md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                    {presets?.isFestivalMode ? presets.offerBanner : "Experience the rich, handcrafted legacy of traditional Indian spices, curated for the modern palate."}
                </motion.p>

                <motion.div variants={itemVariants}>
                    <Link
                        href="/products"
                        className="relative overflow-hidden bg-secondary hover:bg-secondary/90 text-white font-black px-12 py-6 rounded-full shadow-[0_20px_50px_rgba(234,179,8,0.3)] transition-all flex items-center gap-4 mx-auto w-fit group"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] -translate-x-full group-hover:animate-shimmer"></div>

                        <span className="relative z-10 text-lg">Explore Products</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform relative z-10" />
                    </Link>
                </motion.div>
            </motion.div>

            {/* Scroll Down Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">Scroll</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <ChevronDown className="w-6 h-6 text-secondary/60" />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
