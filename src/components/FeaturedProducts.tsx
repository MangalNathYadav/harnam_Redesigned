"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/database";
import { Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const FeaturedProducts = () => {
    const [featured, setFeatured] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const productsRef = ref(db, "products");
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data)
                    .map(([id, val]) => {
                        const productData = val as Product;
                        return { ...productData, id };
                    })
                    .sort(() => 0.5 - Math.random()) // Randomize for "featured" feel
                    .slice(0, 4);
                setFeatured(list);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return null;

    return (
        <section className="w-full py-20 px-6 container mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
                <Link href="/products" className="text-secondary font-bold text-base flex items-center gap-1 hover:underline">
                    View All <ChevronRight className="w-5 h-5" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featured.map((product) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-4 flex flex-col items-center hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                        <div className="w-full aspect-[4/5] relative rounded-2xl overflow-hidden mb-4 bg-zinc-50 border border-border/50">
                            <Image
                                src={product.imageBase64 || product.image || "/placeholder.png"}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover"
                            />
                        </div>
                        <h3 className="text-sm font-bold text-gray-800 mb-1 text-center line-clamp-2 h-10">{product.name}</h3>
                        <div className="text-secondary font-extrabold text-lg mb-2">₹{product.price}</div>
                        <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1 rounded-full">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-gray-700">{product.rating || "4.5"}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedProducts;
