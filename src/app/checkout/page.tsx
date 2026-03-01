"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, onValue, set, push, serverTimestamp } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, CreditCard, Truck, User, ArrowLeft, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface Presets {
    isFestivalMode: boolean;
    discountPercent: number;
}

export default function CheckoutPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", phone: "",
        address: "", city: "", state: "", pincode: "",
        payment: "cod"
    });

    useEffect(() => {
        const guestId = localStorage.getItem("guestId");
        if (!user && !guestId) return;
        const cartPath = user ? `users/${user.uid}/cart` : `guest_carts/${guestId}/cart`;
        onValue(ref(db, cartPath), (snapshot) => {
            const data = snapshot.val();
            setCartItems(Array.isArray(data) ? data : (data ? Object.values(data) : []));
        });
    }, [user]);

    const [presets, setPresets] = useState<Presets | null>(null);

    useEffect(() => {
        onValue(ref(db, 'site_presets'), (snapshot) => {
            setPresets(snapshot.val());
        });
    }, []);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = (presets?.isFestivalMode && presets?.discountPercent) ? presets.discountPercent : 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal + 50 - discountAmount; // Simple flat delivery for now

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const placeOrder = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);
        const guestId = localStorage.getItem("guestId");

        const orderRef = ref(db, 'orders');
        const newOrderRef = push(orderRef);
        const orderId = `HNM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const orderData = {
            orderId,
            userId: user?.uid || null,
            guestId: user ? null : guestId,
            customer: { ...form },
            items: cartItems,
            pricing: {
                subtotal,
                shipping: 50,
                total
            },
            timestamp: serverTimestamp(),
            status: "Processing",
            paymentMethod: "COD",
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
            timeline: [
                {
                    status: "Confirmed",
                    message: "Order placed successfully",
                    timestamp: new Date().toISOString()
                },
                {
                    status: "Processing",
                    message: "Preparing your authentic spices",
                    timestamp: new Date().toISOString()
                }
            ]
        };

        try {
            await set(newOrderRef, orderData);

            // Clear cart
            const cartPath = user ? `users/${user.uid}/cart` : `guest_carts/${guestId}/cart`;
            await set(ref(db, cartPath), null);

            // Save address for authenticated user
            if (user) {
                const profileRef = ref(db, `users/${user.uid}/profile`);
                await set(profileRef, {
                    lastAddress: { ...form },
                    updatedAt: serverTimestamp()
                });
            }

            setOrderComplete(true);
            setTimeout(() => {
                router.push('/orders');
            }, 3000);
        } catch (error) {
            console.error("Order placement failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfcfd] px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center bg-white p-12 rounded-[2.5rem] shadow-2xl border border-border"
                >
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Purely Authentic!</h2>
                    <p className="text-muted-foreground mb-12">
                        Your order has been placed successfully. We&apos;re preparing your spices for delivery.
                    </p>
                    <button
                        onClick={() => router.push('/products')}
                        className="w-full bg-primary text-white py-4 rounded-full font-bold hover-lift smooth-transition"
                    >
                        Continue Shopping
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfcfd] pt-28 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid lg:grid-cols-5 gap-16">

                    {/* Main Checkout Section */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-4 mb-10">
                            <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 rounded-full smooth-transition">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-3xl font-bold">Secure <span className="gradient-text">Checkout</span></h1>
                        </div>

                        {/* Stepper */}
                        <div className="flex justify-between mb-16 relative">
                            <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-10"></div>
                            {[1, 2, 3].map((s) => (
                                <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm smooth-transition border ${step >= s ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-muted-foreground border-border"
                                    }`}>
                                    {s === 1 && <User className="w-4 h-4" />}
                                    {s === 2 && <Truck className="w-4 h-4" />}
                                    {s === 3 && <CreditCard className="w-4 h-4" />}
                                </div>
                            ))}
                        </div>

                        {/* Steps */}
                        <div className="bg-white rounded-[2rem] border border-border p-10 shadow-sm min-h-[400px]">
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <h3 className="text-xl font-bold mb-6">Personal Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input placeholder="First Name" className="checkout-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                                        <input placeholder="Last Name" className="checkout-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                                    </div>
                                    <input placeholder="Email Address" className="checkout-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    <input placeholder="Phone Number" className="checkout-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                    <button onClick={handleNext} className="checkout-btn mt-8">Continue to Shipping <ArrowRight className="w-4 h-4" /></button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <h3 className="text-xl font-bold mb-6">Shipping Address</h3>
                                    <input placeholder="House No / Street / Landmark" className="checkout-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input placeholder="City" className="checkout-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                                        <input placeholder="State" className="checkout-input" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                                    </div>
                                    <input placeholder="PIN Code" className="checkout-input" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
                                    <div className="flex gap-4 mt-8">
                                        <button onClick={handleBack} className="checkout-btn-secondary">Back</button>
                                        <button onClick={handleNext} className="checkout-btn">Payment Method <ArrowRight className="w-4 h-4" /></button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <h3 className="text-xl font-bold mb-6">Choose Payment</h3>
                                    <div className="space-y-3">
                                        {["cod", "upi", "card"].map((method) => (
                                            <label key={method} className={`flex items-center justify-between p-6 rounded-2xl border-2 smooth-transition cursor-pointer ${form.payment === method ? "border-primary bg-primary/5 shadow-inner" : "border-border hover:border-primary/50"
                                                }`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.payment === method ? "border-primary bg-primary" : "border-border"
                                                        }`}>
                                                        {form.payment === method && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    <span className="font-bold capitalize">{method === 'cod' ? 'Cash on Delivery' : method.toUpperCase()}</span>
                                                </div>
                                                {method !== 'cod' && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">Coming Soon</span>}
                                                <input type="radio" className="hidden" name="payment" value={method} disabled={method !== 'cod'} checked={form.payment === method} onChange={() => setForm({ ...form, payment: method })} />
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 mt-12">
                                        <button onClick={handleBack} className="checkout-btn-secondary">Back</button>
                                        <button
                                            onClick={placeOrder}
                                            disabled={loading}
                                            className="checkout-btn flex-1 h-16"
                                        >
                                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : `Complete Order • ₹${total.toFixed(2)}`}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2rem] border border-border p-10 shadow-sm sticky top-32">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                Review Order
                            </h3>

                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="font-bold text-sm">₹{item.price * item.quantity}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-t border-border pt-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-bold">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-bold">₹50</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 font-bold italic">
                                        <span>Festival Discount</span>
                                        <span>-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl border-t border-border pt-4 mt-4">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-primary">₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-10 p-6 bg-zinc-50 rounded-2xl flex gap-4 items-start">
                                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-1" />
                                <div className="text-[10px] leading-relaxed text-muted-foreground">
                                    Your transaction is encrypted and secured by global safety standards. We respect your privacy.
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
