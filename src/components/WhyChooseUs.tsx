"use client";

import { Leaf, Scale, Truck, Award } from "lucide-react";

const WhyChooseUs = () => {
    const benefits = [
        { icon: Leaf, title: "100% Natural Ingredients" },
        { icon: Scale, title: "Perfectly Balanced Flavors" },
        { icon: Truck, title: "Fast & Safe Delivery" },
        { icon: Award, title: "Trusted Since 2025" }
    ];

    return (
        <section className="w-full py-20 px-6 container mx-auto max-w-7xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight">
                Why <span className="text-secondary">Choose Us?</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {benefits.map((benefit, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center justify-center bg-white rounded-[2rem] shadow-sm border border-gray-50 p-10 text-center hover:shadow-lg transition-all border-l-4 border-l-secondary"
                    >
                        <benefit.icon className="w-10 h-10 text-secondary mb-5" />
                        <span className="text-sm md:text-base font-bold leading-tight text-gray-800">{benefit.title}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WhyChooseUs;
