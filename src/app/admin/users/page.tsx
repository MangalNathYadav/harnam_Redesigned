"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import {
    Users,
    Search,
    Mail,
    Calendar,
    ShieldCheck,
    Smartphone,
    Activity,
    MoreVertical,
    UserCircle,
    ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const usersRef = ref(db, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setUsers(Object.entries(data).map(([uid, val]: [string, any]) => ({
                    ...val,
                    uid
                })));
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        u.uid.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">User <span className="gradient-text">Directory</span></h1>
                    <p className="text-zinc-400 font-bold text-sm">Manage and monitor your customer base.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-12 pr-6 py-3 bg-white border border-border rounded-2xl w-full md:w-80 outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Customer</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">User ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Contact</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Joined At</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.uid} className="group hover:bg-zinc-50/50 smooth-transition">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                                                {user.email?.[0]?.toUpperCase() || <UserCircle />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-zinc-900">{user.displayName || "Spice Memeber"}</p>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Standard Customer</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md">
                                            {user.uid}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-zinc-600">
                                                <Mail size={12} className="text-zinc-300" />
                                                <span className="text-xs font-bold">{user.email}</span>
                                            </div>
                                            {user.profile?.lastAddress?.phone && (
                                                <div className="flex items-center gap-2 text-zinc-600">
                                                    <Smartphone size={12} className="text-zinc-300" />
                                                    <span className="text-xs font-bold">{user.profile.lastAddress.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Calendar size={14} />
                                            <span className="text-xs font-bold">Feb 2026</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-zinc-300 opacity-0 group-hover:opacity-100 smooth-transition">
                                            <button className="p-2 hover:bg-zinc-100 rounded-xl hover:text-primary smooth-transition">
                                                <Activity size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-zinc-100 rounded-xl hover:text-zinc-900 smooth-transition">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
