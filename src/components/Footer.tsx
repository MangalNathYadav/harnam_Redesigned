"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-white border-t border-border pt-20 pb-10 hidden md:block">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 lg:col-span-1">
                        <Link href="/" className="relative h-16 w-48 mb-6 block">
                            <Image
                                src="/assets/harnam_masale_logo.png"
                                alt="Harnam Masale Logo"
                                fill
                                className="object-contain object-left"
                            />
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                            Redefining the digital shopping experience with premium spices and smooth interactions. Experience the true taste of tradition.
                        </p>
                        <div className="flex gap-4">
                            {[Instagram, Facebook, Twitter].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary smooth-transition">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-primary smooth-transition">Home</Link></li>
                            <li><Link href="/products" className="hover:text-primary smooth-transition">All Spices</Link></li>
                            <li><Link href="/cart" className="hover:text-primary smooth-transition">Your Cart</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary smooth-transition">Contact Us</a></li>
                            <li><a href="#" className="hover:text-primary smooth-transition">Shipping Policy</a></li>
                            <li><a href="#" className="hover:text-primary smooth-transition">Returns & Refunds</a></li>
                            <li><a href="#" className="hover:text-primary smooth-transition">FAQs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>hello@harnamfoods.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-primary" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>Delhi, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
                    <p>© 2026 HARNAM FOODS / Pure & Authentic</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-primary smooth-transition">Privacy Policy</a>
                        <a href="#" className="hover:text-primary smooth-transition">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
