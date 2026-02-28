"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, query, limitToLast } from "firebase/database";
import {
    Activity,
    User,
    Settings,
    ShoppingBag,
    Clock,
    ArrowUpRight,
    Search,
    Filter
} from "lucide-react";
import { motion } from "framer-motion";

interface LogEntry {
    id: string;
    type: 'user' | 'system' | 'order' | 'preset';
    message: string;
    timestamp: number;
    userEmail?: string;
}

export default function ActivityLogs() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For now, we'll fetch from a generic 'logs' path, 
        // in a real app, you'd log interactions to this path
        const logsRef = query(ref(db, 'activity_logs'), limitToLast(50));
        const unsubscribe = onValue(logsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const logList = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val
                })).sort((a, b) => b.timestamp - a.timestamp);
                setLogs(logList);
            } else {
                // Mock data if no real logs exist yet
                setLogs([
                    { id: '1', type: 'system', message: 'Site Theme changed to Midnight Spice', timestamp: Date.now() - 1000 * 60 * 5, userEmail: 'admin@harnamfoods.com' },
                    { id: '2', type: 'order', message: 'New Order #ORD-8829 received', timestamp: Date.now() - 1000 * 60 * 15 },
                    { id: '3', type: 'user', message: 'User shadowxg@gmail.com logged in', timestamp: Date.now() - 1000 * 60 * 45, userEmail: 'shadowxg@gmail.com' },
                    { id: '4', type: 'preset', message: 'Diwali Festival Mode activated', timestamp: Date.now() - 1000 * 60 * 60 * 2, userEmail: 'admin@harnamfoods.com' },
                    { id: '5', type: 'system', message: 'Database backup completed', timestamp: Date.now() - 1000 * 60 * 60 * 5 },
                ]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'user': return <User size={14} />;
            case 'order': return <ShoppingBag size={14} />;
            case 'preset': return <Settings size={14} />;
            default: return <Activity size={14} />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'user': return 'bg-blue-50 text-blue-600';
            case 'order': return 'bg-green-50 text-green-600';
            case 'preset': return 'bg-purple-50 text-purple-600';
            default: return 'bg-zinc-100 text-zinc-600';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 italic">Activity <span className="gradient-text">Logs</span></h1>
                    <p className="text-zinc-400 font-bold text-sm">Monitor system changes and user interactions in real-time.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <input
                            placeholder="Search logs..."
                            className="pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none w-64"
                        />
                    </div>
                    <button className="p-2 bg-white border border-border rounded-xl hover:bg-zinc-50 smooth-transition">
                        <Filter className="w-4 h-4 text-zinc-400" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
                <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-zinc-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">System Timeline</span>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-green-50 text-green-600 px-3 py-1 rounded-full animate-pulse">Live</span>
                </div>

                <div className="divide-y divide-zinc-50">
                    {logs.map((log, idx) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-6 flex items-start gap-6 hover:bg-zinc-50/50 smooth-transition group"
                        >
                            <div className={`p-2.5 rounded-xl shrink-0 ${getColor(log.type)}`}>
                                {getIcon(log.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-bold text-zinc-900 leading-tight">{log.message}</p>
                                    <span className="text-[10px] font-bold text-zinc-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {log.userEmail && (
                                        <div className="flex items-center gap-1.5 opacity-60">
                                            <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full" />
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">{log.userEmail}</span>
                                        </div>
                                    )}
                                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">{new Date(log.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-zinc-100 rounded-lg smooth-transition">
                                <ArrowUpRight size={14} className="text-zinc-400" />
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="p-6 bg-zinc-50/30 text-center">
                    <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Load older entries</button>
                </div>
            </div>
        </div>
    );
}
