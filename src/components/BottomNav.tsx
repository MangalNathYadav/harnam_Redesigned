"use client";

import { Home, ShoppingBag, ShoppingCart, User, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const BottomNav = () => {
    const pathname = usePathname();

    const navItems = [
        { icon: <Home className="w-5 h-5" />, label: "Home", href: "/" },
        { icon: <ShoppingBag className="w-5 h-5" />, label: "Spices", href: "/products" },
        { icon: <ShoppingCart className="w-5 h-5" />, label: "Cart", href: "/cart" },
        { icon: <User className="w-5 h-5" />, label: "Profile", href: "/profile" },
    ];

    return (
        <div className="md:hidden fixed bottom-8 left-6 right-6 z-[100]">
            <nav className="w-full bg-white/95 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[24px] px-6 py-3 flex justify-around items-center relative overflow-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="relative flex flex-col items-center gap-1 group min-w-[50px]"
                        >
                            <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-zinc-400 group-hover:text-zinc-600'}`}>
                                <div className="w-5 h-5">
                                    {item.icon}
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-tight transition-all duration-300 ${isActive ? 'text-primary opacity-100' : 'text-zinc-400 opacity-0 scale-50'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;
