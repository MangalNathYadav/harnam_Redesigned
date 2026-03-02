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
    Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { uploadToCloudinary } from "@/lib/cloudinary";


interface Product {
    firebaseId: string;
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image: string;
    rating: number;
    offer: string;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);


    useEffect(() => {
        const productsRef = ref(db, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setProducts(Object.entries(data as Record<string, Product>).map(([id, val]) => ({
                    ...val,
                    firebaseId: id
                })));
            }
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            let finalImageUrl = form.image;

            if (selectedFile) {
                // Convert to WebP and compress
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    fileType: "image/webp"
                };

                const compressedFile = await imageCompression(selectedFile, options);
                finalImageUrl = await uploadToCloudinary(compressedFile);
            }

            const productsRef = ref(db, 'products');

            if (editingProduct) {
                await set(ref(db, `products/${editingProduct.firebaseId}`), {
                    ...form,
                    image: finalImageUrl,
                    id: editingProduct.id
                });
            } else {
                const newProdRef = push(productsRef);
                await set(newProdRef, {
                    ...form,
                    image: finalImageUrl,
                    id: `p${Date.now()}`
                });
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            setSelectedFile(null);
            setPreviewUrl(null);
            setForm({
                name: "", description: "", price: 0, category: "Veg",
                stock: 50, image: "/assets/images/sabji.jpeg", rating: 4.8, offer: ""
            });
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to save product. Check console for details.");
        } finally {
            setUploading(false);
        }
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
                            <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 smooth-transition" />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 smooth-transition translate-y-2 group-hover:translate-y-0 text-white">
                                <button
                                    onClick={() => {
                                        setEditingProduct(product);
                                        setForm({ ...product });
                                        setPreviewUrl(product.image);
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

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Product Image</label>
                                    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-zinc-100 rounded-[2rem] bg-zinc-50/50 hover:bg-zinc-50 smooth-transition">
                                        {previewUrl ? (
                                            <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-inner">
                                                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setPreviewUrl(null);
                                                    }}
                                                    className="absolute top-4 right-4 p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-600 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 py-8">
                                                <div className="p-4 bg-white rounded-2xl shadow-sm">
                                                    <Package className="w-8 h-8 text-zinc-300" />
                                                </div>
                                                <p className="text-xs font-bold text-zinc-400 mt-2">Drop your image here or browse</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="product-image"
                                        />
                                        <label
                                            htmlFor="product-image"
                                            className="px-6 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-zinc-100 transition-colors shadow-sm"
                                        >
                                            {previewUrl ? "Change Image" : "Choose File"}
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="checkout-btn-secondary px-8"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="checkout-btn flex-1 h-14 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                    >
                                        {uploading ? "Processing..." : (editingProduct ? "Update Spice" : "Publish to Store")}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
                                        )}
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
