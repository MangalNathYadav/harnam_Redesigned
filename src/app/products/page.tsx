"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { ref, onValue, set, get } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Filter, Star, Info, ChevronRight, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
}

interface CartItem extends Product {
    quantity: number;
}

export default function ProductsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState({ category: "all", sort: "default" });
    const [guestId, setGuestId] = useState("");
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Initialize Guest Session
    useEffect(() => {
        let gid = localStorage.getItem("guestId");
        if (!gid || !gid.startsWith("guest_")) {
            gid = "guest_" + Math.random().toString(36).substr(2, 12);
            localStorage.setItem("guestId", gid);
        }
        setGuestId(gid);
    }, []);

    // Sync Products from Firebase
    useEffect(() => {
        const productsRef = ref(db, "products");
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const productList = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    name: val.name || "",
                    description: val.description || "",
                    price: val.price || 0,
                    stock: val.stock ?? val.inStock ?? 0,
                    category: val.category || "all",
                    image: val.imageBase64 || val.image || "/placeholder.png",
                    rating: val.rating || 4.5,
                    offer: val.offer || "",
                }));
                setProducts(productList);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

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

    const addToCart = async (product: Product) => {
        const cartPath = user ? `users/${user.uid}/cart` : `guest_carts/${guestId}/cart`;
        const cartRef = ref(db, cartPath);

        try {
            const snapshot = await get(cartRef);
            let currentCart: CartItem[] = snapshot.val() || [];
            if (!Array.isArray(currentCart)) currentCart = Object.values(currentCart);

            const existingIndex = currentCart.findIndex(item => item.id === product.id);
            if (existingIndex > -1) {
                currentCart[existingIndex].quantity += 1;
            } else {
                currentCart.push({ ...product, quantity: 1 });
            }

            await set(cartRef, currentCart);
            showNotification(`${product.name} added to cart`, "success");
        } catch (error) {
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
        } catch (error) {
            showNotification("Update failed", "error");
        }
    };

    const showNotification = (message: string, type: "success" | "error") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredProducts = products
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && (filter.category === "all" || p.category === filter.category))
        .sort((a, b) => {
            if (filter.sort === "price-asc") return a.price - b.price;
            if (filter.sort === "price-desc") return b.price - a.price;
            return 0;
        });

    return (
        <div className="min-h-screen bg-[#fdfcfd] pt-20 pb-20">
            <div className="container mx-auto px-6">
                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between animate-in">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search premium spices..."
                            className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            className="px-6 py-3 rounded-full border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                            value={filter.category}
                            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                        >
                            <option value="all">All Categories</option>
                            <option value="Blends">Blends</option>
                            <option value="Veg">Veg</option>
                            <option value="Non-Veg">Non-Veg</option>
                        </select>

                        <select
                            className="px-6 py-3 rounded-full border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                            value={filter.sort}
                            onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
                        >
                            <option value="default">Sort: Default</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
                    >
                        <AnimatePresence>
                            {filteredProducts.map((product) => {
                                const cartItem = cartItems.find(item => item.id === product.id);
                                return (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                                        }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => router.push(`/products/${product.id}`)}
                                        className="group bg-white rounded-xl border border-border p-3 md:p-4 hover:shadow-xl smooth-transition relative shadow-sm cursor-pointer"
                                    >
                                        {product.offer && (
                                            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 bg-secondary text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                {product.offer}
                                            </div>
                                        )}

                                        <div className="relative h-40 md:h-64 w-full rounded-lg overflow-hidden bg-zinc-50 mb-3 md:mb-4 border border-border/50">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 smooth-transition"
                                            />
                                        </div>

                                        <div className="px-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-sm md:text-lg leading-tight tracking-tight line-clamp-1">{product.name}</h3>
                                                <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-lg">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs font-bold">{product.rating}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2 mb-3 md:mb-6 min-h-0 md:min-h-[40px]">
                                                {product.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-2 md:pt-2 border-t border-border/50">
                                                <span className="text-base md:text-xl font-bold text-primary">₹{product.price}</span>

                                                {cartItem ? (
                                                    <div className="flex items-center gap-2 md:gap-3 bg-zinc-50 rounded-full px-2 py-1 border border-border" onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }} className="w-7 h-7 md:w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center hover:bg-zinc-100 smooth-transition">
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-xs md:text-sm font-bold w-4 text-center">{cartItem.quantity}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }} className="w-7 h-7 md:w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 smooth-transition">
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                        disabled={product.stock <= 0}
                                                        className="flex items-center gap-2 bg-primary text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold hover:opacity-90 smooth-transition shadow-lg shadow-primary/10 disabled:opacity-50"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Notifications */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: 50, x: "-50%" }}
                            className={`fixed bottom-10 left-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm ${notification.type === "success" ? "bg-green-600" : "bg-red-600"
                                }`}
                        >
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-40">
                        <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">No spices found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
