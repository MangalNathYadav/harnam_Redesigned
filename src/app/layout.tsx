import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./overlays.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HARNAM FOODS | Premium E-commerce",
  description: "Redefining the digital shopping experience with premium designs and smooth interactions.",
};

import NavigationWrapper from "@/components/NavigationWrapper";
import PageTransition from "@/components/PageTransition";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <NavigationWrapper>
            <main>
              <PageTransition>
                {children}
              </PageTransition>
            </main>
          </NavigationWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
