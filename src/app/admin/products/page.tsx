"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import {
    Sparkles,
    Plus,
    Search,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Tag,
    IndianRupee,
    Package,
    X,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: 0,
        category: "Veg",
        stock: 50,
        image: "/assets/images/sabji.jpeg",
        rating: 4.8,
        offer: ""
    });

    useEffect(() => {
        const productsRef = ref(db, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setProducts(Object.entries(data).map(([id, val]: [string, any]) => ({
                    ...val,
                    firebaseId: id
                })));
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const productsRef = ref(db, 'products');

        if (editingProduct) {
            await set(ref(db, `products/${editingProduct.firebaseId}`), {
                ...form,
                id: editingProduct.id
            });
        } else {
            const newProdRef = push(productsRef);
            await set(newProdRef, {
                ...form,
                id: `p${Date.now()}`
            });
        }

        setIsModalOpen(false);
        setEditingProduct(null);
        setForm({
            name: "", description: "", price: 0, category: "Veg",
            stock: 50, image: "/assets/images/sabji.jpeg", rating: 4.8, offer: ""
        });
    };

    const deleteProduct = async (firebaseId: string) => {
        if (confirm("Are you sure you want to delete this spice?")) {
            await remove(ref(db, `products/${firebaseId}`));
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Product <span className="gradient-text">Inventory</span></h1>
                    <p className="text-zinc-400 font-bold text-sm">Manage your premium spice collection.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Find a spice..."
                            className="pl-12 pr-6 py-3 bg-white border border-border rounded-2xl w-full md:w-64 outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                    >
                        <Plus size={18} /> New Spice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((product) => (
                    <motion.div
                        key={product.firebaseId}
                        layout
                        className="bg-white rounded-[2rem] border border-border p-6 shadow-sm hover:shadow-xl smooth-transition group"
                    >
                        <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-zinc-50 mb-6 border border-zinc-100">
                            <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 smooth-transition" />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 smooth-transition translate-y-2 group-hover:translate-y-0 text-white">
                                <button
                                    onClick={() => {
                                        setEditingProduct(product);
                                        setForm({ ...product });
                                        setIsModalOpen(true);
                                    }}
                                    className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/40 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => deleteProduct(product.firebaseId)}
                                    className="p-3 bg-red-500/20 backdrop-blur-md rounded-xl hover:bg-red-500/40 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-black text-zinc-900 group-hover:text-primary smooth-transition">{product.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{product.category}</p>
                                </div>
                                <span className="text-lg font-black text-primary">₹{product.price}</span>
                            </div>

                            <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 border-t border-zinc-50 pt-4">
                                <span className="flex items-center gap-1.5"><Package size={14} className="text-zinc-300" /> {product.stock} Stock</span>
                                <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-zinc-300" /> {product.rating} Rating</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 overflow-hidden"
                        >
                            <h2 className="text-2xl font-black mb-8">{editingProduct ? "Edit" : "New"} <span className="gradient-text">Spice Blend</span></h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Full Name</label>
                                        <input required className="checkout-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Royal Chicken Masala" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Category</label>
                                        <select className="checkout-input appearance-none" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            <option value="Veg">Veg</option>
                                            <option value="Non-Veg">Non-Veg</option>
                                            <option value="Blends">Blends</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Description</label>
                                    <textarea required className="checkout-input min-h-[100px] py-4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the aroma and usage..." />
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Price (₹)</label>
                                        <input type="number" required className="checkout-input" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Stock Qty</label>
                                        <input type="number" required className="checkout-input" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Offer Text</label>
                                        <input className="checkout-input" value={form.offer} onChange={e => setForm({ ...form, offer: e.target.value })} placeholder="e.g. NEW" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Image Source</label>
                                    <input required className="checkout-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="/assets/images/..." />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="checkout-btn-secondary px-8">Discard</button>
                                    <button type="submit" className="checkout-btn flex-1 h-14 uppercase tracking-widest text-xs">
                                        {editingProduct ? "Update Spice" : "Publish to Store"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
