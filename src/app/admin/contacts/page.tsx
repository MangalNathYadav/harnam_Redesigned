"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, remove } from "firebase/database";
import {
    MessageSquare,
    User,
    Mail,
    Calendar,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminContacts() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Based on previous research, contact forms were stored in 'contacts/'
        const contactsRef = ref(db, 'contacts');
        const unsubscribe = onValue(contactsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMessages(Object.entries(data).map(([id, val]: [string, any]) => ({
                    ...val,
                    firebaseId: id
                })).sort((a: any, b: any) => b.timestamp - a.timestamp));
            } else {
                setMessages([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const deleteMessage = async (firebaseId: string) => {
        if (confirm("Delete this message?")) {
            await remove(ref(db, `contacts/${firebaseId}`));
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Customer <span className="gradient-text">Voices</span></h1>
                <p className="text-zinc-400 font-bold text-sm">Monitor and respond to site inquiries.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : messages.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-border p-20 text-center">
                    <MessageSquare size={48} className="mx-auto text-zinc-200 mb-6" />
                    <h3 className="text-xl font-bold text-zinc-900">No messages yet</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto mt-2">All quiet on the customer front. We'll update you here as soon as someone reaches out.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {messages.map((item, idx) => (
                        <motion.div
                            key={item.firebaseId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2.5rem] border border-border p-8 shadow-sm hover:shadow-xl smooth-transition group relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-64 space-y-4 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-100">
                                            {item.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-zinc-900">{item.name}</p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2 text-zinc-500">
                                            <Mail size={14} className="text-zinc-300" />
                                            <span className="text-xs font-medium truncate">{item.email}</span>
                                        </div>
                                        {item.phone && (
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Clock size={14} className="text-zinc-300" />
                                                <span className="text-xs font-medium">{item.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="bg-zinc-50/50 p-6 rounded-3xl border border-zinc-50 min-h-[100px] relative">
                                        <span className="absolute top-4 right-4 text-primary opacity-20"><MessageSquare size={32} /></span>
                                        <p className="text-sm font-medium text-zinc-600 leading-relaxed italic">
                                            "{item.message}"
                                        </p>
                                    </div>
                                </div>
                                <div className="md:w-16 flex flex-row md:flex-col items-center justify-end gap-3">
                                    <button
                                        onClick={() => deleteMessage(item.firebaseId)}
                                        className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white smooth-transition"
                                        title="Delete message"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        className="p-3 bg-green-50 text-green-500 rounded-2xl hover:bg-green-500 hover:text-white smooth-transition"
                                        title="Mark as resolved"
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
