"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { ref, push, serverTimestamp } from "firebase/database";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

const ContactSection = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            await push(ref(db, 'contacts'), {
                ...form,
                timestamp: serverTimestamp(),
                status: 'pending'
            });
            setStatus({ type: 'success', message: 'Message sent successfully!' });
            setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch {
            setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        }
        setLoading(false);
        setTimeout(() => setStatus(null), 5000);
    };

    return (
        <section className="w-full py-24 px-6 container mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">Get In Touch</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { icon: MapPin, title: "Our Store", val: "Awas Vikas Hanspuram, Naubasta Kanpur" },
                            { icon: Phone, title: "Support", val: "+91 8840838599" },
                            { icon: Mail, title: "Email", val: "harnammasale@gmail.com" },
                            { icon: Clock, title: "Business Hours", val: "Mon - Sat: 9:00 AM - 6:00 PM" }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-8 border border-border/20 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:border-secondary transition-all">
                                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{item.title}</h3>
                                <p className="text-sm font-bold text-gray-800">{item.val}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-secondary/5 rounded-[2.5rem] p-10 border border-secondary/10">
                        <h4 className="text-xl font-bold mb-4">Visit Our Developer Page</h4>
                        <p className="text-gray-600 mb-6">Want to see more of our digital footprint? Explore our developers official portal.</p>
                        <a href="https://dev.harnamfoods.com" target="_blank" className="font-bold text-secondary underline hover:text-black transition-colors">dev.harnamfoods.com</a>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-border/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16"></div>
                    <h3 className="text-2xl font-bold mb-8 text-gray-900">Send us a Message</h3>
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="checkout-input"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="checkout-input"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <input
                            type="tel"
                            placeholder="Phone Number (Optional)"
                            className="checkout-input"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                        <textarea
                            placeholder="Write your message here..."
                            rows={5}
                            className="checkout-input resize-none"
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            required
                        />

                        {status && (
                            <div className={`p-4 rounded-2xl text-sm font-bold text-center ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {status.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="checkout-btn group py-5"
                        >
                            {loading ? 'Sending...' : 'Send Message Now'}
                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
