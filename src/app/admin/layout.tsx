"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Sparkles,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Simple Admin Check: For now, we'll allow the owner's email or any specific check
    const isAdmin = user?.email === "admin@harnamfoods.com" || user?.email === "shadowxg@gmail.com"; // Example

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfcfd]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>;

    if (!user) return null;

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "Overview", href: "/admin" },
        { icon: <ShoppingBag size={20} />, label: "Orders", href: "/admin/orders" },
        { icon: <Sparkles size={20} />, label: "Products", href: "/admin/products" },
        { icon: <Users size={20} />, label: "Users", href: "/admin/users" },
        { icon: <MessageSquare size={20} />, label: "Contacts", href: "/admin/contacts" },
        { icon: <Settings size={20} />, label: "Presets", href: "/admin/presets" },
        { icon: <Activity size={20} />, label: "Activity Logs", href: "/admin/logs" },
    ];

    return (
        <div className="min-h-screen bg-[#f8f7f8] flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-border transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"
                    } md:relative md:translate-x-0`}
            >
                <div className="h-full flex flex-col p-4">
                    <div className="flex items-center justify-between mb-10 px-2">
                        {sidebarOpen && <span className="text-xl font-black gradient-text">ADMIN</span>}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-zinc-50 rounded-xl smooth-transition"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 hover:text-primary smooth-transition group font-bold text-sm text-zinc-500"
                            >
                                <span className="shrink-0">{item.icon}</span>
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        ))}
                    </nav>

                    <Link
                        href="/"
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 text-zinc-400 smooth-transition font-bold text-sm mt-auto"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Exit Admin</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-auto relative">
                {/* Background Watermark */}
                <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.08]">
                    <Image
                        src="/assets/harnam_masale_logo.png"
                        alt="Watermark"
                        width={800}
                        height={800}
                        className="grayscale rotate-12"
                    />
                </div>

                <div className="relative z-10 min-h-full flex flex-col">
                    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-40">
                        <h2 className="font-bold text-zinc-900">Harnam Foods Management</h2>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-zinc-900">{user.email}</p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Super Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black border-2 border-white shadow-sm">
                                {user.email?.[0].toUpperCase()}
                            </div>
                        </div>
                    </header>

                    <div className="p-8 pb-20 flex-1">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
