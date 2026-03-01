"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Package, MapPin, Truck, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface OrderTimeline {
    status: string;
    message: string;
    timestamp: string;
}

interface Order {
    orderId: string;
    status: string;
    timeline: OrderTimeline[];
    customer: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    items: OrderItem[];
    pricing: {
        total: number;
        subtotal: number;
        shipping: number;
    };
    paymentMethod: string;
}

export default function OrderTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const { loading: authLoading } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        const ordersRef = ref(db, 'orders');
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const found = Object.values(data as Record<string, Order>).find((o) => o.orderId === params.id);
                setOrder(found || null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [params.id, authLoading]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Clock className="animate-spin text-primary" /></div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

    const steps = [
        { label: "Ordered", status: "Confirmed", icon: <CheckCircle2 className="w-5 h-5 text-white" /> },
        { label: "Processing", status: "Processing", icon: <Package className="w-5 h-5 text-white" /> },
        { label: "Shipped", status: "Shipped", icon: <Truck className="w-5 h-5 text-white" /> },
        { label: "Delivered", status: "Delivered", icon: <MapPin className="w-5 h-5 text-white" /> }
    ];

    const currentStepIndex = steps.findIndex(s => s.status === order.status);

    return (
        <div className="min-h-screen bg-[#fdfcfd]">
            <Navbar />
            <div className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 font-bold text-sm mb-12 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Orders
                    </button>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Tracking Details */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-zinc-100/50 border border-zinc-50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Truck className="w-32 h-32" />
                                </div>

                                <h1 className="text-3xl font-black mb-2">Track <span className="gradient-text">Shipment</span></h1>
                                <p className="text-zinc-400 font-bold text-xs mb-10">ORDER ID: {order.orderId}</p>

                                {/* Visual Timeline */}
                                <div className="relative pt-8 pb-12 px-4">
                                    <div className="absolute top-24 left-8 right-8 h-1 bg-zinc-100 hidden md:block">
                                        <div
                                            className="h-full bg-primary smooth-transition"
                                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 relative z-10">
                                        {steps.map((step, idx) => {
                                            const isActive = idx <= currentStepIndex;
                                            return (
                                                <div key={idx} className="flex md:flex-col items-center gap-6 md:gap-4 text-center">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center smooth-transition ${isActive ? 'bg-primary shadow-xl shadow-primary/30' : 'bg-zinc-100 text-zinc-300'}`}>
                                                        {isActive ? step.icon : <div className="w-2 h-2 rounded-full bg-current" />}
                                                    </div>
                                                    <div>
                                                        <p className={`font-black uppercase tracking-tighter text-xs ${isActive ? 'text-zinc-900' : 'text-zinc-300'}`}>{step.label}</p>
                                                        <p className="text-[10px] text-zinc-400 font-bold mt-1">
                                                            {isActive && order.timeline.find((t) => t.status === step.status)?.timestamp
                                                                ? new Date(order.timeline.find((t) => t.status === step.status)!.timestamp).toLocaleDateString()
                                                                : 'TBA'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="border-t border-zinc-50 pt-10 mt-10">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-primary" /> Order Updates
                                    </h3>
                                    <div className="space-y-6">
                                        {order.timeline.map((t, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 shadow-lg shadow-primary/50" />
                                                <div>
                                                    <p className="font-bold text-sm text-zinc-900">{t.status} - {t.message}</p>
                                                    <p className="text-xs text-zinc-400 font-medium">{new Date(t.timestamp).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-[2rem] p-8 border border-zinc-50 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin className="text-primary w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 mb-2">Delivery Address</h4>
                                        <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                            {order.customer.firstName} {order.customer.lastName}<br />
                                            {order.customer.address}<br />
                                            {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-[2rem] p-8 border border-zinc-50 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center shrink-0">
                                        <ShieldCheck className="text-primary w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 mb-2">Payment Info</h4>
                                        <p className="text-sm text-zinc-500 font-medium">Method: {order.paymentMethod}</p>
                                        <p className="text-sm text-zinc-500 font-medium">Order Total: ₹{order.pricing.total}</p>
                                        <p className="text-xs text-secondary font-black mt-2">Cash to be paid on arrival</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-50 shadow-xl shadow-zinc-100/30">
                                <h3 className="text-xl font-bold mb-8">Items Ordered</h3>
                                <div className="space-y-6">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-50 shrink-0 shadow-sm">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-zinc-900 truncate">{item.name}</h4>
                                                <p className="text-xs text-zinc-400 font-bold">Qty: {item.quantity}</p>
                                                <p className="text-xs text-primary font-black mt-1">₹{item.price * item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-8 border-t border-zinc-100">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-zinc-500 font-medium">Subtotal</span>
                                        <span className="font-bold text-zinc-900">₹{order.pricing.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-4">
                                        <span className="text-zinc-500 font-medium">Shipping</span>
                                        <span className="font-bold text-zinc-900">₹{order.pricing.shipping}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl">
                                        <span className="font-bold text-zinc-900">Total</span>
                                        <span className="text-xl font-black text-primary">₹{order.pricing.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
