"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import {
    Search,
    CheckCircle2,
    XCircle,
    Eye,
    Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface OrderItem {
    id: string;
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
    timestamp: number;
    status: string;
    paymentMethod: string;
    paymentReceived: boolean;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
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
    timeline: OrderTimeline[];
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        const ordersRef = ref(db, 'orders');
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setOrders(Object.values(data as Record<string, Order>).sort((a, b) => b.timestamp - a.timestamp));
            }
        });
        return () => unsubscribe();
    }, []);

    const togglePaymentReceived = async (orderId: string, currentStatus: boolean) => {
        const ordersRef = ref(db, 'orders');
        onValue(ordersRef, async (snapshot) => {
            const data = snapshot.val() as Record<string, Order> | null;
            if (data) {
                const key = Object.keys(data).find(k => data[k].orderId === orderId);
                if (key) {
                    await set(ref(db, `orders/${key}/paymentReceived`), !currentStatus);
                }
            }
        }, { onlyOnce: true });
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        const ordersRef = ref(db, 'orders');
        onValue(ordersRef, async (snapshot) => {
            const data = snapshot.val() as Record<string, Order> | null;
            if (data) {
                const key = Object.keys(data).find(k => data[k].orderId === orderId);
                if (key) {
                    const order = data[key];
                    const updatedTimeline = [
                        ...order.timeline,
                        {
                            status: newStatus,
                            message: `Order marked as ${newStatus}`,
                            timestamp: new Date().toISOString()
                        }
                    ];
                    await set(ref(db, `orders/${key}`), {
                        ...order,
                        status: newStatus,
                        timeline: updatedTimeline
                    });
                }
            }
        }, { onlyOnce: true });
    };

    const filteredOrders = orders.filter(o =>
        o.orderId.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.firstName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Order <span className="gradient-text">Management</span></h1>
                    <p className="text-zinc-400 font-bold text-sm">Monitor and process customer shipments.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search order ID or customer..."
                        className="pl-12 pr-6 py-3 bg-white border border-border rounded-2xl w-full md:w-80 outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Order ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Customer</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredOrders.map((order) => (
                                <tr key={order.orderId} className="group hover:bg-zinc-50/50 smooth-transition">
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-zinc-900 group-hover:text-primary smooth-transition">#{order.orderId}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-500 border border-border">
                                                {order.customer?.firstName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900">{order.customer?.firstName} {order.customer?.lastName}</p>
                                                <p className="text-[10px] text-zinc-400 font-medium">{order.customer?.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-zinc-400">
                                        {new Date(order.timestamp).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-primary">₹{order.pricing?.total}</p>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase">{order.paymentMethod}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={order.status.toLowerCase()}
                                                    onChange={(e) => updateStatus(order.orderId, e.target.value)}
                                                    className={`
                                                        text-xs font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer
                                                        ${order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                                order.status.toLowerCase() === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                                    order.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                        'bg-zinc-100 text-zinc-700'}
                                                    `}
                                                >
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 smooth-transition"
                                                    title="Print Invoice"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {order.paymentMethod === "COD" && (
                                                <button
                                                    onClick={() => togglePaymentReceived(order.orderId, order.paymentReceived)}
                                                    className={`p-2 rounded-xl border smooth-transition ${order.paymentReceived ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}
                                                    title={order.paymentReceived ? "Payment Received" : "Mark as Paid"}
                                                >
                                                    {order.paymentReceived ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-primary smooth-transition shadow-sm"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-auto rounded-[3rem] shadow-2xl p-10"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className="text-2xl font-black">Order Analysis</span>
                                        <span className="text-xs font-bold text-zinc-400">#{selectedOrder.orderId}</span>
                                    </div>
                                    <p className="text-zinc-400 font-medium">Detailed breakdown of customer request and fulfillment.</p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-3 bg-zinc-50 rounded-2xl hover:bg-zinc-100 smooth-transition">
                                    <XCircle size={24} className="text-zinc-300" />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <section>
                                        <h4 className="text-xs font-black uppercase text-zinc-400 tracking-widest mb-4">Items Summary</h4>
                                        <div className="space-y-4">
                                            {selectedOrder.items.map((item, i) => (
                                                <div key={i} className="flex gap-4 items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                                    <div className="w-12 h-12 bg-white rounded-xl border border-border overflow-hidden relative">
                                                        {item.image && (
                                                            <Image src={item.image} alt="" fill className="object-cover" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-zinc-900">{item.name}</p>
                                                        <p className="text-xs text-zinc-400">Qty: {item.quantity} × ₹{item.price}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="text-xs font-black uppercase text-zinc-400 tracking-widest mb-4">Delivery Timeline</h4>
                                        <div className="space-y-4">
                                            {selectedOrder.timeline.map((t, i) => (
                                                <div key={i} className="flex gap-4 relative">
                                                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 z-10" />
                                                    {i !== selectedOrder.timeline.length - 1 && <div className="absolute left-[3.5px] top-4 bottom-0 w-px bg-zinc-100" />}
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900">{t.status}</p>
                                                        <p className="text-xs text-zinc-400">{t.message}</p>
                                                        <p className="text-[10px] text-zinc-300 mt-1">{new Date(t.timestamp).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-8">
                                    <section className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100">
                                        <h4 className="text-xs font-black uppercase text-zinc-400 tracking-widest mb-6">Customer Details</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase">Address</p>
                                                <p className="text-sm font-bold text-zinc-900">{selectedOrder.customer?.address}</p>
                                                <p className="text-sm font-bold text-zinc-900">{selectedOrder.customer?.city}, {selectedOrder.customer?.state} - {selectedOrder.customer?.pincode}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase">Contact</p>
                                                <p className="text-sm font-bold text-zinc-900">{selectedOrder.customer?.email}</p>
                                                <p className="text-sm font-bold text-zinc-900">{selectedOrder.customer?.phone}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="p-8 bg-primary rounded-3xl text-white shadow-xl shadow-primary/20">
                                        <h4 className="text-xs font-black uppercase text-white/50 tracking-widest mb-6">Financial Summary</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between border-b border-white/10 pb-4">
                                                <span className="text-sm font-medium text-white/70">Subtotal</span>
                                                <span className="text-sm font-bold">₹{selectedOrder.pricing?.subtotal}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/10 pb-4">
                                                <span className="text-sm font-medium text-white/70">Shipping</span>
                                                <span className="text-sm font-bold">₹{selectedOrder.pricing?.shipping}</span>
                                            </div>
                                            <div className="flex justify-between pt-2">
                                                <span className="text-lg font-black">Grand Total</span>
                                                <span className="text-2xl font-black">₹{selectedOrder.pricing?.total}</span>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
