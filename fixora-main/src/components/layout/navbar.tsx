import Link from "next/link";

const links = [
  { href: "/customer", label: "Customer" },
  { href: "/technician", label: "Technician" },
  { href: "/admin", label: "Admin" },
  { href: "/customer/book", label: "Book Service" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
          Fixora
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-700">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-sky-700">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
