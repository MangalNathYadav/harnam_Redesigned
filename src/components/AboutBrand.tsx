"use client";

import Image from "next/image";
import { Leaf, Award, CheckCircle } from "lucide-react";

const AboutBrand = () => {
    return (
        <section className="w-full py-24 px-6 container mx-auto max-w-7xl">
            <div className="bg-white/40 backdrop-blur-sm rounded-[3.5rem] p-8 md:p-20 border border-white/50 shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tighter">
                            About <span className="text-secondary">Us</span>
                        </h2>

                        <p className="text-gray-700 leading-relaxed mb-10 text-lg md:text-xl font-medium opacity-90">
                            Founded in 1985, our journey began in a small spice shop in the heart of the markets. What started as a passion project evolving into a legacy of trust and flavor that spans generations.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-10">
                            {[
                                { icon: Leaf, text: "Premium Ingredients" },
                                { icon: CheckCircle, text: "Traditional Methods" },
                                { icon: Award, text: "Quality Certified" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white px-6 py-4 rounded-full shadow-md border border-border/10 hover:-translate-y-1 transition-all">
                                    <item.icon className="w-6 h-6 text-secondary" />
                                    <span className="text-sm font-bold text-gray-900">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-5 bg-white shadow-xl p-5 rounded-[2rem] border border-zinc-50 w-fit">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-secondary/20 p-1">
                                <Image src="/assets/founder.png" alt="Founder" width={64} height={64} className="object-cover rounded-full" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-1">Our Heritage</div>
                                <div className="text-xl font-black text-gray-900">Shri Harnam Singh</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[400px] md:h-[500px] w-full rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                        <Image
                            src="/assets/about_plantation.png"
                            alt="Spice Plantation"
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutBrand;
