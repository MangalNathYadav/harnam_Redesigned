"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import {
    Users,
    ShoppingBag,
    TrendingUp,
    IndianRupee,
    Clock,
    Sparkles,
    Plus,
    Palette
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Order {
    orderId: string;
    timestamp: number;
    status: string;
    customer: {
        firstName: string;
        lastName: string;
        city: string;
    };
    pricing: {
        total: number;
    };
}

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        pendingOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    useEffect(() => {
        const ordersRef = ref(db, 'orders');
        onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const orders = Object.values(data as Record<string, Order>);
                const revenue = orders.reduce((sum: number, o) => sum + (o.pricing?.total || 0), 0);
                const pending = orders.filter((o) => o.status === "Processing" || o.status === "Placed").length;

                setMetrics(prev => ({
                    ...prev,
                    totalOrders: orders.length,
                    totalRevenue: revenue,
                    pendingOrders: pending
                }));

                setRecentOrders(orders.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5));
            }
        });

        const usersRef = ref(db, 'users');
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMetrics(prev => ({ ...prev, totalUsers: Object.keys(data).length }));
            }
        });
    }, []);

    const cards = [
        { label: "Total Revenue", value: `₹${metrics.totalRevenue.toLocaleString()}`, icon: <IndianRupee />, color: "bg-green-500", trend: "+12.5%" },
        { label: "Total Orders", value: metrics.totalOrders, icon: <ShoppingBag />, color: "bg-blue-500", trend: "+8.2%" },
        { label: "Pending Orders", value: metrics.pendingOrders, icon: <Clock />, color: "bg-orange-500", trend: "Current" },
        { label: "Total Users", value: metrics.totalUsers, icon: <Users />, color: "bg-purple-500", trend: "+4.1%" },
    ];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Dashboard <span className="gradient-text">Overview</span></h1>
                <p className="text-zinc-400 font-bold text-sm">Welcome back! Here&apos;s what&apos;s happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border border-border shadow-sm hover:shadow-xl smooth-transition"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl text-white ${card.color} shadow-lg shadow-current/20`}>
                                {card.icon}
                            </div>
                            <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <TrendingUp size={10} /> {card.trend}
                            </span>
                        </div>
                        <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-1">{card.label}</p>
                        <h3 className="text-2xl font-black text-zinc-900">{card.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-border p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black">Recent Orders</h3>
                        <Link href="/admin/orders" className="text-xs font-bold text-primary hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50 rounded-xl">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-zinc-400">Order ID</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-zinc-400">Customer</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-zinc-400">Amount</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-zinc-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {recentOrders.map((order) => (
                                    <tr key={order.orderId} className="group hover:bg-zinc-50/50 smooth-transition">
                                        <td className="px-4 py-4 text-sm font-bold text-zinc-400">#{order.orderId}</td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-bold text-zinc-900">{order.customer?.firstName} {order.customer?.lastName}</p>
                                            <p className="text-[10px] text-zinc-400 font-medium">{order.customer?.city}</p>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-black text-primary">₹{order.pricing?.total}</td>
                                        <td className="px-4 py-4">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${order.status === "Delivered" ? "bg-green-50 text-green-600" :
                                                order.status === "Shipped" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-border p-8 shadow-sm">
                        <h3 className="text-xl font-black mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Add Product", icon: <Plus size={16} />, color: "bg-primary", href: "/admin/products" },
                                { label: "View Orders", icon: <ShoppingBag size={16} />, color: "bg-secondary", href: "/admin/orders" },
                                { label: "Manage Users", icon: <Users size={16} />, color: "bg-zinc-900", href: "/admin/users" },
                                { label: "Site Theme", icon: <Palette size={16} />, color: "bg-purple-600", href: "/admin/presets" },
                            ].map((action, i) => (
                                <Link key={i} href={action.href} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 smooth-transition group">
                                    <div className={`w-10 h-10 rounded-xl ${action.color} text-white flex items-center justify-center shadow-lg shadow-current/10`}>
                                        {action.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-zinc-500 group-hover:text-zinc-900">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-purple-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary/20">
                        <Sparkles className="w-8 h-8 mb-4 opacity-50" />
                        <h4 className="text-lg font-black mb-2">Summer Festival?</h4>
                        <p className="text-xs font-medium text-white/70 mb-6 font-sans">Toggle festival decorations and special offers in one click.</p>
                        <Link href="/admin/presets" className="w-full bg-white text-primary py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center">
                            Open Presets
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
