import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/motion/page-transition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fixora – 30-Minute Home Repairs in Jaipur",
  description:
    "Instant booking for verified electricians, plumbers, AC repair and appliance technicians in Jaipur. Arrives in 30 minutes. Transparent pricing.",
  keywords: ["home repair", "electrician Jaipur", "plumber Jaipur", "AC repair", "Fixora"],
  openGraph: {
    title: "Fixora – 30-Minute Home Repairs",
    description: "Trusted, verified technicians at your door in 30 minutes.",
    siteName: "Fixora",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="min-h-screen bg-[var(--background)] font-sans antialiased">
        <Navbar />
        <PageTransition>
          <main>{children}</main>
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
