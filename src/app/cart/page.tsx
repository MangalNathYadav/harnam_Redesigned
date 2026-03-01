"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, onValue, set, get } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, CreditCard, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SitePresets } from "@/types/database";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
}

export default function CartPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [guestId, setGuestId] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            const gid = localStorage.getItem("guestId");
            if (gid) setGuestId(gid);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!guestId && !user) {
            const timer = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(timer);
        }
        const cartPath = user ? `users/${user.uid}/cart` : `guest_carts/${guestId}/cart`;
        const cartRef = ref(db, cartPath);

        const unsubscribe = onValue(cartRef, (snapshot) => {
            const data = snapshot.val();
            let items: CartItem[] = [];
            if (Array.isArray(data)) {
                items = data;
            } else if (data && typeof data === "object") {
                items = Object.values(data);
            }
            setCartItems(items);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, guestId]);

    const updateQuantity = async (productId: string, delta: number) => {
        const cartPath = user ? `users/${user.uid}/cart` : `guest_carts/${guestId}/cart`;
        const cartRef = ref(db, cartPath);

        try {
            const snapshot = await get(cartRef);
            let currentCart: CartItem[] = snapshot.val() || [];
            if (!Array.isArray(currentCart)) currentCart = Object.values(currentCart);

            const updatedCart = currentCart.map(item => {
                if (item.id === productId) {
                    const newQty = (item.quantity || 1) + delta;
                    return { ...item, quantity: Math.max(0, newQty) };
                }
                return item;
            }).filter(item => item.quantity > 0);

            await set(cartRef, updatedCart);
        } catch (error) {
            console.error("Cart update failed", error);
        }
    };

    const removeItem = (productId: string) => {
        updateQuantity(productId, -9999);
    };

    const [presets, setPresets] = useState<SitePresets | null>(null);

    useEffect(() => {
        onValue(ref(db, 'site_presets'), (snapshot) => {
            setPresets(snapshot.val());
        });
    }, []);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const platformCharge = Math.max(1, Math.ceil(cartItems.length / 2));
    const deliveryCharge = cartItems.length > 0 ? 15 + (cartItems.length - 1) * 10 : 0;

    // Festival Discount Logic
    const discountPercent = (presets?.isFestivalMode && presets?.discountPercent) ? presets.discountPercent : 0;
    const discountAmount = (subtotal * discountPercent) / 100;

    const total = subtotal + platformCharge + deliveryCharge - discountAmount;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfcfd] pt-28 pb-20">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="flex items-center gap-4 mb-12 animate-in">
                    <h1 className="text-4xl font-bold tracking-tighter">Your <span className="gradient-text">Spice Cart</span></h1>
                    <div className="bg-primary/10 px-4 py-1 rounded-full text-primary font-bold text-sm">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-border shadow-sm animate-in">
                        <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-20" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Your cart is feeling a bit light</h3>
                        <p className="text-muted-foreground mb-10 max-w-sm mx-auto">
                            Add some authentic Indian spices to your kitchen and experience the true taste of tradition.
                        </p>
                        <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover-lift smooth-transition shadow-xl shadow-primary/20">
                            Browse Products <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-12 items-start">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group bg-white rounded-2xl border border-border p-4 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-zinc-50 border border-border/50 shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                                                {item.category}
                                            </div>
                                            <h3 className="font-bold text-lg mb-1 truncate">{item.name}</h3>
                                            <div className="text-primary font-bold">₹{item.price}</div>
                                        </div>

                                        <div className="flex flex-col items-end gap-4">
                                            <div className="flex items-center gap-4 bg-zinc-50 rounded-full px-2 py-1 border border-border">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center hover:bg-zinc-100 smooth-transition">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 smooth-transition">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 smooth-transition p-2">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm lg:sticky lg:top-32 animate-in" style={{ animationDelay: '0.1s' }}>
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Platform Charge</span>
                                    <span className="font-bold">₹{platformCharge.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Charge</span>
                                    <span className="font-bold">₹{deliveryCharge.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 bg-green-50 p-2 rounded-lg border border-green-100 italic">
                                        <span className="flex items-center gap-2 font-bold"><Zap size={14} /> {presets?.festivalName || "Festival"} Discount</span>
                                        <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="h-px bg-border my-2"></div>
                                <div className="flex justify-between text-lg">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-primary">₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-primary text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover-lift smooth-transition shadow-xl shadow-primary/20"
                            >
                                Proceed to Checkout <ArrowRight className="w-4 h-4" />
                            </button>

                            <p className="text-[10px] text-center text-muted-foreground mt-6 leading-relaxed">
                                By proceeding, you agree to our Terms of Service. Secure payments powered by international standards.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
