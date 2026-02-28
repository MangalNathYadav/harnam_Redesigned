"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, User, LogOut, Info, X, Mail, Phone, Instagram, Facebook, Twitter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "./AuthModal";

const Navbar = () => {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (pathname === "/") {
                setScrolled(window.scrollY > 20);
            } else {
                setScrolled(true);
            }
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [pathname]);

    useEffect(() => {
        const guestId = localStorage.getItem("guestId");
        if (!user && !guestId) return;
        const cartPath = user ? `users/${user.uid}/cart` : `guest_carts/${guestId}/cart`;
        const cartRef = ref(db, cartPath);
        const unsubscribe = onValue(cartRef, (snapshot) => {
            const data = snapshot.val() as Record<string, { quantity: number }> | { quantity: number }[] | null;
            let count = 0;
            if (data) {
                if (Array.isArray(data)) {
                    count = data.reduce((sum: number, item) => sum + (item.quantity || 0), 0);
                } else {
                    count = Object.values(data).reduce((sum: number, item) => sum + (item.quantity || 0), 0);
                }
            }
            setCartCount(count);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 smooth-transition ${scrolled ? "py-2 md:py-4" : "py-2.5 md:py-6"}`}>
            <div className="container mx-auto px-4 md:px-6">
                <div className={`
                    relative flex justify-between items-center h-13 md:h-16 px-4 md:px-6 
                    ${scrolled ? 'glass-morphism shadow-lg' : 'bg-transparent'} 
                    rounded-[20px] md:rounded-[24px] smooth-transition
                `}>
                    {/* Mobile: Logo Left, Text Center, Info Right */}
                    <div className="flex md:hidden items-center justify-between w-full h-full relative">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="relative h-9 w-24 block">
                                <Image
                                    src="/assets/harnam_masale_logo.png"
                                    alt="Harnam Masale Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </Link>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-black tracking-tighter uppercase leading-none text-zinc-900">Harnam <span className="text-primary">Masale</span></span>
                                <span className="text-[11px] font-bold text-zinc-400 leading-none mt-1">Purity in every pinch ✨</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setInfoOpen(!infoOpen)}
                            className={`p-2 rounded-full smooth-transition ${infoOpen ? 'bg-primary text-white scale-105' : 'bg-black/5 text-zinc-600'}`}
                        >
                            {infoOpen ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Desktop Layout (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center justify-between w-full gap-8">
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-4 min-w-[200px]">
                            <Link href="/" className="relative h-10 w-32 block">
                                <Image
                                    src="/assets/harnam_masale_logo.png"
                                    alt="Harnam Masale Logo"
                                    fill
                                    className="object-contain smooth-transition"
                                    priority
                                />
                            </Link>
                            <div className="flex flex-col">
                                <span className={`text-sm font-black tracking-tighter uppercase leading-none ${scrolled ? "text-zinc-900" : "text-white"}`}>Harnam <span className="text-primary">Masale</span></span>
                                <span className={`text-[10px] font-bold leading-none mt-1 ${scrolled ? "text-zinc-400" : "text-white/60"}`}>Purity in every pinch ✨</span>
                            </div>
                        </div>

                        {/* Navigation Links (Centered) */}
                        <div className="flex items-center gap-10">
                            <Link href="/" className={`text-xs font-black smooth-transition uppercase tracking-[0.2em] ${scrolled ? "text-zinc-600 hover:text-primary" : "text-white/80 hover:text-white"}`}>Home</Link>
                            <Link href="/products" className={`text-xs font-black smooth-transition uppercase tracking-[0.2em] ${scrolled ? "text-zinc-600 hover:text-primary" : "text-white/80 hover:text-white"}`}>Spices</Link>
                        </div>

                        {/* Actions (Right) */}
                        <div className="flex items-center gap-6 min-w-[200px] justify-end">
                            <Link href="/cart" className="relative p-2 group">
                                <ShoppingCart className={`w-5 h-5 smooth-transition ${scrolled ? "text-zinc-600 group-hover:text-primary" : "text-white group-hover:text-primary-light"}`} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            <div className={`w-px h-4 ${scrolled ? "bg-border" : "bg-white/20"}`} />

                            {user ? (
                                <div className="flex items-center gap-3">
                                    <Link href="/profile" className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest smooth-transition ${scrolled
                                        ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                                        : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
                                        }`}>
                                        <User className="w-3.5 h-3.5" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        className={`p-2.5 rounded-full smooth-transition border ${scrolled
                                            ? "border-border text-zinc-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                                            : "border-white/20 text-white/60 hover:text-white hover:bg-white/10"
                                            }`}
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAuthModalOpen(true)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover-lift smooth-transition shadow-lg ${scrolled
                                        ? "bg-primary text-white shadow-primary/20"
                                        : "bg-white text-primary border border-white/20 hover:bg-zinc-50"
                                        }`}
                                >
                                    <User className="w-3.5 h-3.5" />
                                    Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {infoOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed inset-x-6 top-24 z-[110] glass-morphism rounded-[24px] p-8 border border-white/40 shadow-2xl md:hidden"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black tracking-tighter uppercase">Harnam <span className="text-primary">Info</span></h3>
                            <button onClick={() => setInfoOpen(false)} className="p-2 bg-black/5 rounded-full"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-8 text-[10px] font-black uppercase tracking-widest opacity-60">
                            <div className="space-y-4">
                                <Link href="/contact" className="block hover:text-primary">Support</Link>
                                <Link href="/privacy" className="block hover:text-primary">Privacy</Link>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary lowercase tracking-normal font-bold">
                                    <Mail className="w-3 h-3" /> hello@harnam.com
                                </div>
                                <div className="flex items-center gap-2 text-primary lowercase tracking-normal font-bold">
                                    <Phone className="w-3 h-3" /> +91 9876543210
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-6 border-t border-black/5">
                            {[Instagram, Facebook, Twitter].map((Icon, i) => (
                                <button key={i} className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                    <Icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </nav>
    );
};

export default Navbar;
