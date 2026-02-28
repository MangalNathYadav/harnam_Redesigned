"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
    {
        avatar: "/assets/founder.png",
        stars: 5,
        text: "The best masala brand I’ve ever used! The flavors are so authentic and fresh. Reminds me of home cooking.",
        author: "Priya S., Delhi"
    },
    {
        avatar: "/assets/arav_photo.png",
        stars: 4,
        text: "Fast delivery and amazing quality. My family loves every dish I make with Demonlord Spices.",
        author: "Rahul M., Kanpur"
    },
    {
        avatar: "/assets/abhishek_photo.jpeg",
        stars: 5,
        text: "I recommend these spices to all my chef friends. The potency and aroma are unmatched in the market!",
        author: "Chef K., Lucknow"
    }
];

const Testimonials = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    const next = () => setIndex((prev) => (prev + 1) % testimonials.length);

    return (
        <section className="w-full py-24 px-6 container mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">What Our Customers Say</h2>

            <div className="relative max-w-4xl mx-auto bg-white rounded-[3.5rem] shadow-2xl shadow-purple-100/30 p-10 md:p-20 border border-white/50 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg bg-zinc-100">
                            <Image src={testimonials[index].avatar} alt={testimonials[index].author} width={96} height={96} className="object-cover" />
                        </div>
                        <div className="flex gap-1 mb-4">
                            {[...Array(testimonials[index].stars)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <p className="text-gray-600 italic text-lg leading-relaxed mb-6 font-medium">
                            &ldquo;{testimonials[index].text}&rdquo;
                        </p>
                        <div className="text-secondary font-bold text-sm tracking-widest uppercase">— {testimonials[index].author}</div>
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-center items-center gap-6 mt-10">
                    <button onClick={prev} className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center hover:bg-secondary hover:text-white transition-all shadow-sm">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                        {testimonials.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === idx ? 'w-8 bg-secondary' : 'w-2 bg-zinc-200'}`}
                            ></div>
                        ))}
                    </div>
                    <button onClick={next} className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center hover:bg-secondary hover:text-white transition-all shadow-sm">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
