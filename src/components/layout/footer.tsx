"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Linkedin, Twitter, Wrench } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const year = new Date().getFullYear();
  const socialLinks = [
    { href: "https://x.com", label: "X", Icon: Twitter },
    { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
    { href: "https://facebook.com", label: "Facebook", Icon: Facebook },
    { href: "https://linkedin.com", label: "LinkedIn", Icon: Linkedin },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 md:grid-cols-5 md:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold">Fixora</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            Premium local services platform connecting customers with trusted technicians for fast and transparent home repairs.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Company</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <Link href="/" className="block transition hover:text-slate-900">About</Link>
            <Link href="/" className="block transition hover:text-slate-900">Careers</Link>
            <Link href="/" className="block transition hover:text-slate-900">Cities</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Services</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <Link href="/#services" className="block transition hover:text-slate-900">Electrician</Link>
            <Link href="/#services" className="block transition hover:text-slate-900">Plumber</Link>
            <Link href="/#services" className="block transition hover:text-slate-900">AC Repair</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Support</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <Link href="/customer" className="block transition hover:text-slate-900">Customer App</Link>
            <Link href="/technician" className="block transition hover:text-slate-900">Technician Portal</Link>
            <Link href="/book" className="block transition hover:text-slate-900">Contact</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500 md:px-8">
        © {year} Fixora. Built for fast, trusted, local service booking.
      </div>
    </footer>
  );
}
