"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith("/admin");

    if (isAdminPage) return <>{children}</>;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">
                {children}
            </div>
            <BottomNav />
            <Footer />
        </div>
    );
}
