"use client";

import { useAuth } from "@/context/AuthContext";
import {
    User,
    Mail,
    LogOut,
    Package,
    TrendingUp,
    MapPin,
    Clock,
    ChevronRight,
    CreditCard,
    ShoppingBag,
    Printer
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

interface Order {
    orderId: string;
    userId: string;
    timestamp: number;
    status: string;
    pricing: { total: number };
    items: { image?: string }[];
}

interface UserProfile {
    lastAddress?: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
        payment?: string;
    };
}

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        // Fetch User Orders for analytics
        const ordersRef = ref(db, 'orders');
        const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const userOrders = Object.values(data as Record<string, Order>).filter((o: Order) => o.userId === user.uid);
                setOrders(userOrders.sort((a, b) => b.timestamp - a.timestamp));
            }
        });

        // Fetch Profile Details (Saved Address)
        const profileRef = ref(db, `users/${user.uid}/profile`);
        const unsubscribeProfile = onValue(profileRef, (snapshot) => {
            setProfile(snapshot.val());
        });

        // Fetch Cart Count
        const cartRef = ref(db, `users/${user.uid}/cart`);
        const unsubscribeCart = onValue(cartRef, (snapshot) => {
            const data = snapshot.val();
            const count = data ? (Array.isArray(data) ? data.length : Object.keys(data).length) : 0;
            setCartCount(count);
        });

        return () => {
            unsubscribeOrders();
            unsubscribeProfile();
            unsubscribeCart();
        };
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#fdfcfd] flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400">
                        <User className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Your spices are waiting</h2>
                    <p className="text-zinc-500 mb-8">Please log in to view your profile and track your orders.</p>
                    <Link href="/products" className="inline-block bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover-lift">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const totalSpend = orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
    const lastOrderDate = orders.length > 0 ? new Date(orders[0].timestamp).toLocaleDateString() : 'N/A';

    return (
        <div className="min-h-screen bg-[#fdfcfd]">
            <Navbar />
            <div className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Sidebar: Profile Info */}
                        <div className="lg:col-span-1 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-2xl border border-border p-8 shadow-sm"
                            >
                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-white shadow-md">
                                        <span className="text-3xl font-black text-primary">
                                            {user.email?.[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-black text-zinc-900">{user.displayName || "Spice Lover"}</h2>
                                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">Authentic Member</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <Mail className="text-zinc-400 w-4 h-4" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase text-zinc-400">Email</p>
                                            <p className="text-xs font-bold text-zinc-900 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <Clock className="text-zinc-400 w-4 h-4" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-zinc-400">Member Since</p>
                                            <p className="text-xs font-bold text-zinc-900">Feb 2026</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => logout()}
                                    className="w-full mt-8 py-4 bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white smooth-transition flex items-center justify-center gap-2"
                                >
                                    <LogOut size={14} />
                                    Logout
                                </button>
                            </motion.div>

                            {/* Cart Summary Card */}
                            <Link href="/cart">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-primary rounded-2xl p-8 text-white shadow-xl shadow-primary/20 group relative overflow-hidden mt-8 block"
                                >
                                    <ShoppingBag className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                                <ShoppingBag size={20} />
                                            </div>
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">Active Cart</span>
                                        </div>
                                        <h3 className="text-2xl font-black mb-1">{cartCount} Items</h3>
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">In your basket</p>
                                        <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                            Checkout Now <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>

                        {/* Main Section: Analytics & Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Analytics Row */}
                            <div className="grid grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-8 rounded-2xl border border-border shadow-sm flex flex-col justify-between"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
                                            <TrendingUp size={24} />
                                        </div>
                                        <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-full">Total Expended</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Spent So Far</p>
                                        <h2 className="text-3xl font-black text-zinc-900 italic">₹{totalSpend.toLocaleString()}</h2>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white p-8 rounded-2xl border border-border shadow-sm flex flex-col justify-between"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                            <Package size={24} />
                                        </div>
                                        <span className="text-[10px] font-black text-zinc-500 bg-zinc-50 px-2 py-1 rounded-full">Order History</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Total Orders</p>
                                        <h2 className="text-3xl font-black text-zinc-900 italic">{orders.length}</h2>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Saved Address & Payment */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl border border-border p-10 shadow-sm"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <MapPin size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black mb-0.5">Primary Address</h3>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Default Delivery Point</p>
                                    </div>
                                </div>

                                {profile?.lastAddress ? (
                                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                                        <h4 className="font-bold text-zinc-900 mb-2 truncate">{profile.lastAddress.firstName} {profile.lastAddress.lastName}</h4>
                                        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                                            {profile.lastAddress.address}, {profile.lastAddress.city}<br />
                                            {profile.lastAddress.state} - {profile.lastAddress.pincode}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary">
                                            <CreditCard size={12} />
                                            LAST PAYMENT: {profile.lastAddress.payment?.toUpperCase()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border-2 border-dashed border-zinc-100 rounded-2xl">
                                        <p className="text-zinc-400 text-sm font-medium mb-4">No address saved yet</p>
                                        <Link href="/products" className="text-xs font-black uppercase text-primary hover:underline">Start an order</Link>
                                    </div>
                                )}
                            </motion.div>

                            {/* Recent Orders List */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl border border-border p-10 shadow-sm"
                            >
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                                            <Clock size={24} className="text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black mb-0.5">Recent Activity</h3>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Order: {lastOrderDate}</p>
                                        </div>
                                    </div>
                                    <Link href="/orders" className="text-xs font-black uppercase text-primary hover:underline">View All</Link>
                                </div>

                                <div className="space-y-4">
                                    {orders.slice(0, 3).map((order, idx) => (
                                        <Link key={idx} href={`/orders/${order.orderId}`} className="flex items-center justify-between p-5 hover:bg-zinc-50 rounded-2xl border border-transparent hover:border-zinc-100 smooth-transition group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden relative border border-border group-hover:scale-95 smooth-transition">
                                                    {order.items[0]?.image && (
                                                        <Image src={order.items[0]?.image} alt="" fill className="object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 italic">#{order.orderId}</p>
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase">{order.items.length} Items • ₹{order.pricing?.total}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.print();
                                                    }}
                                                    className="p-2 rounded-xl bg-zinc-50 text-zinc-400 hover:text-primary hover:bg-zinc-100 transition-colors"
                                                    title="Print Invoice"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${order.status === "Delivered" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <ChevronRight size={16} className="text-zinc-300 group-hover:text-primary smooth-transition" />
                                            </div>
                                        </Link>
                                    ))}
                                    {orders.length === 0 && (
                                        <div className="text-center py-10">
                                            <p className="text-zinc-400 text-sm font-medium">Your order history is empty</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
