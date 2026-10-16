"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CheckSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navContent = (
    <>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/40",
                active && "neu-inset",
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/signin" })}
        className="mt-auto flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-white/40"
      >
        <LogOut size={18} />
        Logout
      </button>
    </>
  );

  return (
    <>
      <div className="glass flex items-center justify-between px-4 py-3 md:hidden">
        <span className="font-bold">Client Dashboard</span>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="neu-raised cursor-pointer rounded-md p-2"
        >
          <Menu size={18} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-background p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between px-3">
              <h1 className="text-xl font-bold">Client Dashboard</h1>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="cursor-pointer rounded-md p-1"
              >
                <X size={18} />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      <aside className="glass hidden w-56 shrink-0 flex-col p-4 md:flex">
        <h1 className="mb-6 px-3 text-xl font-bold">Client Dashboard</h1>
        {navContent}
      </aside>
    </>
  );
}