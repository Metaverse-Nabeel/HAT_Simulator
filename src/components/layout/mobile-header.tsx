"use client";

import { Logo } from "./logo";
import { useSession, signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Start Exam", href: "/exam/setup" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Profile", href: "/profile" },
];

export function MobileHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [open, setOpen] = useState(false);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="bg-white border-b border-navy-100 px-6 py-4 flex items-center justify-between lg:justify-end">
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="flex items-center gap-2 cursor-pointer">
            <svg className="w-6 h-6 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-6">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Logo className="mb-8" />
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm transition ${
                      active
                        ? "bg-teal-50 text-teal-700 font-medium"
                        : "text-navy-600 hover:bg-navy-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-teal-700 font-semibold text-sm">{initials}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
              Profile
            </DropdownMenuItem>
            {user?.role === "ADMIN" && (
              <DropdownMenuItem onClick={() => window.location.href = "/admin"}>
                Admin
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
