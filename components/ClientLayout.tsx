// components/ClientLayout.tsx
"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

function routeTitle(pathname: string) {
  if (pathname.startsWith("/posts")) return "Posts";
  if (pathname.startsWith("/users")) return "Users";
  return "Dashboard";
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname() || "/";
  const title = useMemo(() => routeTitle(pathname), [pathname]);
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content column */}
      <div
        className="flex-1 flex flex-col transition-[padding] duration-300"
        style={{ paddingLeft: sidebarOpen ? "256px" : "72px" }}
      >
        {/* Top Navbar */}
        <header
          className="sticky top-0 z-30 h-[var(--header-h)] border-b border-[var(--border)] bg-[var(--panel)]/80 backdrop-blur"
          role="banner"
        >
          {/* subtle divider line */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,.14)] to-transparent pointer-events-none" />

          <div className="container h-full grid grid-cols-3 items-center">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Toggle sidebar"
                className="icon-btn md:hidden"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,.08)] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M12 2l9 4.87v9.78L12 22l-9-5.35V6.87L12 2z" />
                  </svg>
                </div>
                <span className="hidden sm:inline font-semibold">Zettabyte</span>
              </div>
            </div>

            {/* Center: route title */}
            <div className="flex justify-center">
              <h1 className="text-base font-semibold tracking-wide">{title}</h1>
            </div>

            {/* Right: theme + auth */}
            <div className="flex items-center gap-2 justify-end">
              <ThemeToggle />

              {status === "loading" && (
                <span className="text-sm text-[var(--muted)]">Loading…</span>
              )}

              {status !== "loading" && !session && (
                <button className="btn" onClick={() => signIn("google")}>
                  Login
                </button>
              )}

              {session && (
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={28}
                      height={28}
                      className="rounded-full object-cover border border-[var(--border)]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[rgba(255,255,255,.08)] border border-[var(--border)] flex items-center justify-center text-xs">
                      {(session.user?.name ?? session.user?.email ?? "U").slice(0, 1)}
                    </div>
                  )}

                  {/* Username/email */}
                  <span className="text-sm text-[var(--muted)] max-w-[160px] truncate">
                    {session.user?.name ?? session.user?.email}
                  </span>

                  {/* Sign out */}
                  <button className="icon-btn" onClick={() => signOut()} title="Sign out">
                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M10 17l1.41-1.41L8.83 13H21v-2H8.83l2.58-2.59L10 7l-5 5 5 5zM3 5h6V3H3c-1.1 0-2 .9-2 2v14a2 2 0 002 2h6v-2H3V5z"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="container py-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
