"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { Package, Truck, Calendar, ArrowRight, ShoppingBag, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        const guestId = localStorage.getItem("guestId");
        if (!user && !guestId) {
            setLoading(false);
            return;
        }

        const ordersRef = ref(db, 'orders');
        // We'll filter client-side for now as RTDB indexing can be tricky for multi-field queries without rules setup
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const allOrders = Object.values(data);
                const filtered = allOrders.filter((o: any) =>
                    user ? o.userId === user.uid : o.guestId === guestId
                ).sort((a: any, b: any) => b.timestamp - a.timestamp);
                setOrders(filtered);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    return (
        <div className="min-h-screen bg-[#fdfcfd]">
            <Navbar />
            <div className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <header className="mb-12">
                        <h1 className="text-4xl font-black tracking-tight mb-2">Your <span className="gradient-text">Orders</span></h1>
                        <p className="text-zinc-500 font-medium tracking-wide border-l-4 border-primary pl-4">
                            Track and manage your spice shipments
                        </p>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Clock className="w-12 h-12 text-primary animate-spin-slow mb-4 opacity-20" />
                            <p className="font-bold text-zinc-400">Fetching your orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border border-border p-16 text-center shadow-xl shadow-zinc-100/50">
                            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="w-8 h-8 text-zinc-300" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-zinc-900">No orders yet</h2>
                            <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Start your journey into authentic Indian spices today.</p>
                            <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover-lift shadow-lg shadow-primary/20">
                                Explore Collection <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order, index) => (
                                <motion.div
                                    key={order.orderId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm hover:shadow-xl hover:border-primary/20 smooth-transition group"
                                >
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    {order.status}
                                                </span>
                                                <span className="text-xs font-bold text-zinc-400">#{order.orderId}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-zinc-900">
                                                Order from {new Date(order.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-xl font-black text-primary">₹{order.pricing.total}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 items-center bg-zinc-50/50 rounded-2xl p-6 border border-zinc-50">
                                        <div className="flex -space-x-3">
                                            {order.items.slice(0, 4).map((item: any, i: number) => (
                                                <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-zinc-100 relative shadow-sm">
                                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                </div>
                                            ))}
                                            {order.items.length > 4 && (
                                                <div className="w-12 h-12 rounded-full border-2 border-white bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600 relative z-10">
                                                    +{order.items.length - 4}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end">
                                            <Link
                                                href={`/orders/${order.orderId}`}
                                                className="flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-4 smooth-transition"
                                            >
                                                Track Shipment <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 border-t border-zinc-50">
                                        <div className="flex items-center gap-2 text-zinc-500">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-medium">Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-500">
                                            <Truck className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-medium">{order.paymentMethod}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
