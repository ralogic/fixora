import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between md:px-8">
        <p>Fixora Jaipur - Customer app and technician portal for 30-minute home repairs.</p>
        <p className="flex items-center gap-3">
          <Link href="/customer" className="font-medium text-zinc-700 hover:text-zinc-900">Customer</Link>
          <span>-</span>
          <Link href="/technician" className="font-medium text-zinc-700 hover:text-zinc-900">Technician</Link>
          <span>-</span>
          <Link href="/book" className="font-medium text-zinc-700 hover:text-zinc-900">Book now</Link>
        </p>
      </div>
    </footer>
  );
}
