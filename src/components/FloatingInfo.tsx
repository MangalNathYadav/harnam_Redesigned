"use client";

import { useState } from "react";
import { Info, X, Instagram, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const FloatingInfo = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="hidden md:flex fixed bottom-24 right-6 w-14 h-14 bg-secondary text-white rounded-full shadow-2xl items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border-4 border-white"
            >
                <Info className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-[3rem] w-full max-w-md p-8 pb-12 shadow-2xl border-t border-purple-100/50"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold tracking-tighter">
                                    Demonlord <span className="text-secondary">Spices</span>
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <p className="text-gray-600 mb-8 font-medium leading-relaxed">
                                Experience the authentic taste of India with our premium, handcrafted spice collection. Quality you can trust since 1985.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <Link
                                    href="/products"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 bg-purple-50 p-4 rounded-2xl hover:bg-purple-100 transition-colors"
                                >
                                    <ShoppingBag className="w-5 h-5 text-secondary" />
                                    <span className="text-sm font-bold text-gray-900">Shop Now</span>
                                </Link>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl hover:bg-zinc-100 transition-colors"
                                >
                                    <Instagram className="w-5 h-5 text-secondary" />
                                    <span className="text-sm font-bold text-gray-900">Follow Us</span>
                                </a>
                            </div>

                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-center border-t border-zinc-100 pt-6">
                                © 2026 Demonlord Spices • All Rights Reserved
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingInfo;
