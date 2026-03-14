"use client";

import { useState } from "react";
import { ChevronDown, User } from "lucide-react";
import type { SessionUser } from "@/types/customer";

type Props = {
  user: SessionUser;
};

export function UserProfileMenu({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm"
      >
        <User className="h-4 w-4" />
        <span className="max-w-24 truncate">{user.name}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl">
          <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
          <p className="text-xs text-zinc-500">{user.phone}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-zinc-400">{user.role}</p>
        </div>
      ) : null}
    </div>
  );
}
