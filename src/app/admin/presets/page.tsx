"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import {
    Sparkles,
    Moon,
    Sun,
    Wind,
    Flame,
    Palette,
    ImageIcon,
    CheckCircle2,
    Calendar,
    CloudRain,
    Snowflake,
    Zap,
    Layers,
    Settings
} from "lucide-react";

interface Presets {
    activeTheme: string;
    isFestivalMode: boolean;
    festivalName: string;
    offerBanner: string;
    heroVideo: string;
    activePresetId: string;
    discountPercent?: number;
}

const FESTIVALS = [
    { id: "diwali", name: "Diwali", sub: "Festival of Lights", offer: "Flat 25% Off on Gift Boxes!", theme: "Midnight Spice", discount: 25, banner: "/banners/diwali_banner_1772389190864.png" },
    { id: "holi", name: "Holi", sub: "Festival of Colors", offer: "Rang Barse! Get Free Thandai Masala", theme: "Holi Colors", discount: 15, banner: "/banners/holi_banner_1772389206274.png" },
    { id: "rakhi", name: "Raksha Bandhan", sub: "Bond of Protection", offer: "Buy 1 Get 1 on Sweets & Spices", theme: "Royal Tradition", discount: 20, banner: "/banners/rakhi_banner_1772388914738.png" },
    { id: "eid", name: "Eid-ul-Fitr", sub: "Spirit of Sharing", offer: "Free Biryani Kit on orders above ₹1000", theme: "Midnight Spice", discount: 10, banner: "/banners/eid_banner_1772388866553.png" },
    { id: "navratri", name: "Navratri", sub: "Nine Nights of Joy", offer: "Up to 50% Off on Vrat Specials", theme: "Royal Tradition", discount: 30, banner: "/banners/navratri_banner_1772388882179.png" },
    { id: "ganesh", name: "Ganesh Chaturthi", sub: "Auspicious Beginnings", offer: "Modak Spice Mix - New Launch!", theme: "Royal Tradition", discount: 10, banner: "/banners/ganesh_chaturthi_banner_1772388931359.png" },
    { id: "christmas", name: "Christmas", sub: "The Season of Giving", offer: "Secret Santa Spice Vouchers Inside!", theme: "Winter Warm", discount: 20, banner: "/banners/christmas_banner_1772388947658.png" },
];

const SEASONS = [
    { id: "summer", name: "Summer", sub: "Cooling & Refreshing", offer: "Beat the Heat with Shikanji Masala!", theme: "Default", discount: 10, banner: "/banners/summer_banner_1772388983131.png" },
    { id: "monsoon", name: "Monsoon", sub: "Rainy Day Comfort", offer: "Perfect Kadak Chai Kit - 20% Off", theme: "Monsoon Special", discount: 15, banner: "/banners/monsoon_banner_1772389126296.png" },
    { id: "winter", name: "Winter", sub: "Warm & Rich", offer: "Healthy Kadha Mix - Stay Warm!", theme: "Winter Warm", discount: 10, banner: "/banners/winter_banner_1772389141692.png" },
    { id: "spring", name: "Spring", sub: "Fresh & Floral", offer: "Spring Bloom Spice Collection", theme: "Default", discount: 5, banner: "/banners/spring_banner_1772389157462.png" },
];

const THEMES = [
    { name: "Default", color: "bg-primary", icon: <Sun size={18} /> },
    { name: "Midnight Spice", color: "bg-zinc-950", icon: <Moon size={18} /> },
    { name: "Holi Colors", color: "bg-gradient-to-br from-pink-500 to-purple-600", icon: <Palette size={18} /> },
    { name: "Monsoon Special", color: "bg-gradient-to-br from-blue-600 to-cyan-500", icon: <Wind size={18} /> },
    { name: "Royal Tradition", color: "bg-gradient-to-br from-amber-600 to-orange-700", icon: <Flame size={18} /> },
    { name: "Winter Warm", color: "bg-gradient-to-br from-sky-500 to-blue-600", icon: <Snowflake size={18} /> },
];

export default function AdminPresets() {
    const [presets, setPresets] = useState<Presets>({
        activeTheme: "Default",
        isFestivalMode: false,
        festivalName: "Diwali Special",
        offerBanner: "Flat 20% Off on all spice blends!",
        heroVideo: "/assets/hero_banner.png",
        activePresetId: "none"
    });

    useEffect(() => {
        const presetsRef = ref(db, 'site_presets');
        const unsubscribe = onValue(presetsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setPresets(data);
        });
        return () => unsubscribe();
    }, []);

    const savePresets = async (newPresets: Presets) => {
        await set(ref(db, 'site_presets'), newPresets);
    };

    const applyEvent = (event: Record<string, unknown>) => {
        const updated = {
            ...presets,
            isFestivalMode: true,
            festivalName: `${event.name as string} Special`,
            offerBanner: event.offer as string,
            activeTheme: event.theme as string,
            activePresetId: event.id as string,
            discountPercent: (event.discount as number) || 0,
            heroVideo: (event.banner as string) || "/assets/hero_banner.png"
        };
        setPresets(updated);
        savePresets(updated);
    };

    return (
        <div className="space-y-12 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2 italic">Preset <span className="gradient-text">Engine</span></h1>
                    <p className="text-zinc-400 font-bold text-sm">Design the atmosphere of Harnam Foods with one click.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-border shadow-sm">
                    <Layers size={16} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">System Status: </span>
                    <span className="text-xs font-black text-green-500 uppercase">Live & Ready</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* Festival & Season Selectors */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Indian Festivals Card */}
                    <div className="bg-white rounded-[3rem] border border-border p-10 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black mb-0.5">Indian Festivals</h3>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Heritage & Occasion Modes</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {FESTIVALS.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => applyEvent(f)}
                                    className={`flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 group ${presets.activePresetId === f.id ? "border-primary bg-primary/5 shadow-inner ring-4 ring-primary/5" : "border-zinc-50 hover:border-zinc-200"
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{f.sub}</p>
                                        <p className="font-black text-zinc-900 truncate">{f.name}</p>
                                    </div>
                                    {presets.activePresetId === f.id && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Seasonal Cycles Card */}
                    <div className="bg-white rounded-[3rem] border border-border p-10 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600">
                                <CloudRain size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black mb-0.5">Seasonal Cycles</h3>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Evergreen Weather Presets</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {SEASONS.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => applyEvent(s)}
                                    className={`flex flex-col items-center gap-3 p-6 rounded-[2.5rem] border transition-all duration-300 ${presets.activePresetId === s.id ? "border-primary bg-primary/5" : "border-zinc-50 hover:border-zinc-200"
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${presets.activePresetId === s.id ? "bg-primary text-white shadow-lg" : "bg-zinc-50 text-zinc-300"
                                        }`}>
                                        {s.id === 'summer' && <Sun size={24} />}
                                        {s.id === 'monsoon' && <CloudRain size={24} />}
                                        {s.id === 'winter' && <Snowflake size={24} />}
                                        {s.id === 'spring' && <Sparkles size={24} />}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Controls & Customization */}
                <div className="space-y-8">

                    {/* Live Config Card */}
                    <div className="bg-zinc-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 opacity-10">
                            <Settings size={200} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black">Live Config</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Real-time Overrides</p>
                                </div>
                                <button
                                    onClick={() => savePresets({ ...presets, isFestivalMode: !presets.isFestivalMode })}
                                    className={`w-14 h-7 rounded-full transition-all duration-500 relative border ${presets.isFestivalMode ? 'bg-primary border-primary' : 'bg-white/5 border-white/10'}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-500 ${presets.isFestivalMode ? 'left-8 shadow-lg' : 'left-0.5'}`} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Event Display Title</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                        value={presets.festivalName}
                                        onChange={e => setPresets({ ...presets, festivalName: e.target.value })}
                                        onBlur={() => savePresets(presets)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Promo Message</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 h-24 resize-none"
                                        value={presets.offerBanner}
                                        onChange={e => setPresets({ ...presets, offerBanner: e.target.value })}
                                        onBlur={() => savePresets(presets)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Festival Discount (%)</label>
                                    <div className="relative">
                                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={presets.discountPercent || 0}
                                            onChange={e => setPresets({ ...presets, discountPercent: parseInt(e.target.value) || 0 })}
                                            onBlur={() => savePresets(presets)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 pt-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Background Asset (URL)</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-[10px] font-mono outline-none focus:ring-2 focus:ring-primary/20"
                                            value={presets.heroVideo}
                                            onChange={e => setPresets({ ...presets, heroVideo: e.target.value })}
                                            onBlur={() => savePresets(presets)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Master Themes Row */}
                    <div className="bg-white rounded-[3rem] border border-border p-10 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <Palette size={24} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic mb-0.5">Master Themes</h3>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Base Color Logic</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => {
                                        const updated = { ...presets, activeTheme: theme.name, activePresetId: "custom" };
                                        setPresets(updated);
                                        savePresets(updated);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border smooth-transition group ${presets.activeTheme === theme.name ? "border-primary bg-primary/5" : "border-zinc-50 hover:border-zinc-100"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${theme.color} shadow-sm flex items-center justify-center text-white`}>
                                            {theme.icon}
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${presets.activeTheme === theme.name ? "text-primary" : "text-zinc-500"
                                            }`}>{theme.name}</span>
                                    </div>
                                    {presets.activeTheme === theme.name && <CheckCircle2 size={14} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
