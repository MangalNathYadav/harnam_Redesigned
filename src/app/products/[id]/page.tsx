"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { ref, onValue, set, get } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import {
    ShoppingCart,
    Star,
    ArrowLeft,
    Plus,
    Minus,
    ShieldCheck,
    Truck,
    RefreshCcw,
    ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image: string;
    rating: number;
    offer?: string;
    fullDescription?: string;
}

interface CartItem extends Product {
    quantity: number;
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [guestId, setGuestId] = useState("");
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const id = params.id as string;

    // Initialize Guest Session
    useEffect(() => {
        let gid = localStorage.getItem("guestId");
        if (!gid) {
            gid = "guest_" + Math.random().toString(36).substr(2, 12);
            localStorage.setItem("guestId", gid);
        }
        const timer = setTimeout(() => setGuestId(gid as string), 0);
        return () => clearTimeout(timer);
    }, []);

    // Sync Product & Similar Products
    useEffect(() => {
        if (!id) return;

        const productRef = ref(db, `products/${id}`);
        const unsubscribe = onValue(productRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
                const currentProduct = {
                    id,
                    name: val.name || "",
                    description: val.description || "",
                    fullDescription: val.fullDescription || val.description || "",
                    price: val.price || 0,
                    stock: val.stock ?? val.inStock ?? 0,
                    category: val.category || "all",
                    image: val.imageBase64 || val.image || "/placeholder.png",
                    rating: val.rating || 4.5,
                    offer: val.offer || "",
                };
                setProduct(currentProduct);

                // Fetch other products
                const allProductsRef = ref(db, "products");
                get(allProductsRef).then((allSnapshot) => {
                    const allData = allSnapshot.val();
                    if (allData) {
                        const others = Object.entries(allData as Record<string, Record<string, unknown>>)
                            .map(([pid, pval]) => ({
                                id: pid,
                                name: (pval.name as string) || "",
                                description: (pval.description as string) || "",
                                price: (pval.price as number) || 0,
                                stock: (pval.stock as number) ?? (pval.inStock as number) ?? 0,
                                category: (pval.category as string) || "all",
                                image: (pval.imageBase64 as string) || (pval.image as string) || "/placeholder.png",
                                rating: (pval.rating as number) || 4.5,
                            }))
                            .filter(p => p.id !== id)
                            .sort(() => Math.random() - 0.5) // Shuffle for variety
                            .slice(0, 4);
                        setSimilarProducts(others);
                    }
                });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    // Sync Cart
    useEffect(() => {
        if (!guestId && !user) return;
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
        });
        return () => unsubscribe();
    }, [user, guestId]);

    const addToCart = async (targetProduct: Product) => {
        const cartPath = user ? `users/${user.uid}/cart` : `guest_carts/${guestId}/cart`;
        const cartRef = ref(db, cartPath);

        try {
            const snapshot = await get(cartRef);
            let currentCart: CartItem[] = snapshot.val() || [];
            if (!Array.isArray(currentCart)) currentCart = Object.values(currentCart);

            const existingIndex = currentCart.findIndex(item => item.id === targetProduct.id);
            if (existingIndex > -1) {
                currentCart[existingIndex].quantity = (currentCart[existingIndex].quantity || 1) + 1;
            } else {
                currentCart.push({ ...targetProduct, quantity: 1 });
            }

            await set(cartRef, currentCart);
            showNotification(`${targetProduct.name} added to cart`, "success");
        } catch {
            showNotification("Failed to add to cart", "error");
        }
    };

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
        } catch {
            showNotification("Update failed", "error");
        }
    };

    const showNotification = (message: string, type: "success" | "error") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfcfd]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfcfd] px-6">
                <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                <button onClick={() => router.push("/products")} className="px-8 py-3 bg-primary text-white rounded-full font-bold">
                    Back to Spices
                </button>
            </div>
        );
    }

    const currentCartItem = cartItems.find(item => item.id === product.id);

    return (
        <div className="min-h-screen bg-[#fdfcfd] pb-20">
            <Navbar />

            <div className="container mx-auto px-6 pt-24 md:pt-32">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-500 hover:text-primary smooth-transition mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Spices</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="aspect-square relative rounded-3xl overflow-hidden bg-white border border-border shadow-2xl">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {product.offer && (
                                <div className="absolute top-6 left-6 bg-secondary text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                    {product.offer}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                                    {product.category}
                                </span>
                                <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 px-3 py-1 rounded-full">
                                    <Star className="w-3 h-3 fill-yellow-400" />
                                    <span className="text-xs font-bold">{product.rating}</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 mb-4">{product.name}</h1>
                            <p className="text-zinc-500 text-lg leading-relaxed">{product.fullDescription}</p>
                        </div>

                        <div className="flex items-center gap-6 mb-10">
                            <span className="text-4xl font-black text-primary">₹{product.price}</span>
                            <div className={`text-xs font-bold px-4 py-1.5 rounded-full ${product.stock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                            </div>
                        </div>

                        {/* Add to Cart Section */}
                        <div className="flex items-center gap-4 mb-12">
                            {currentCartItem ? (
                                <div className="flex items-center gap-6 bg-zinc-100 p-2 rounded-2xl border border-zinc-200">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => updateQuantity(product.id, -1)}
                                            className="w-12 h-12 rounded-xl bg-white border border-border shadow-sm flex items-center justify-center hover:bg-zinc-50 smooth-transition"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-xl font-black w-8 text-center">{currentCartItem.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(product.id, 1)}
                                            className="w-12 h-12 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center hover:opacity-90 smooth-transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="h-8 w-px bg-zinc-300 hidden md:block" />
                                    <button
                                        onClick={() => router.push("/cart")}
                                        className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline"
                                    >
                                        View Cart <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-primary text-white px-12 py-5 rounded-2xl text-lg font-black hover-lift smooth-transition shadow-2xl shadow-primary/30 disabled:opacity-50"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </button>
                            )}
                        </div>

                        {/* USP Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-10">
                            {[
                                { icon: ShieldCheck, label: "Pure & Organic", sub: "No additives" },
                                { icon: Truck, label: "Fast Delivery", sub: "Within 2-4 days" },
                                { icon: RefreshCcw, label: "Easy Returns", sub: "7 days policy" }
                            ].map((usp, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-primary">
                                        <usp.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tighter">{usp.label}</p>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase">{usp.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Other Products Section */}
                <div className="mt-24 md:mt-32">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic">Other <span className="text-primary">Spices</span></h2>
                        <Link href="/products" className="text-sm font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                            See All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {similarProducts.map((p) => (
                            <motion.div
                                key={p.id}
                                whileHover={{ y: -10 }}
                                onClick={() => router.push(`/products/${p.id}`)}
                                className="group bg-white rounded-2xl border border-border p-4 cursor-pointer shadow-sm hover:shadow-xl smooth-transition"
                            >
                                <div className="aspect-square relative rounded-xl overflow-hidden mb-4 bg-zinc-50 border border-border/50">
                                    <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-110 smooth-transition" />
                                </div>
                                <h3 className="font-bold text-sm mb-1 line-clamp-1">{p.name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-primary font-black">₹{p.price}</span>
                                    <div className="flex items-center gap-1 bg-zinc-50 px-2 py-0.5 rounded-lg">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-[10px] font-bold">{p.rating}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 50, x: "-50%" }}
                        className={`fixed bottom-10 left-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
