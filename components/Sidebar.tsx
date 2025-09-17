// components/Sidebar.tsx
"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, ReactElement } from "react";

type NavItem = { href: Route; label: string; icon: ReactElement };

const nav: NavItem[] = [
  {
    href: "/" as Route,
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
      </svg>
    ),
  },
  {
    href: "/posts" as Route,
    label: "Posts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
      </svg>
    ),
  },
  {
    href: "/users" as Route,
    label: "Users",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3A3 3 0 0016 5a3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-1.86 1.5-3.41 3.54-4A11.7 11.7 0 008 13zm8 0c-.73 0-1.41.1-2 .27 1.21.9 2 2.11 2 3.73v2h8v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    ),
  },
];

type SidebarProps = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  // Close drawer on mobile after navigation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(max-width: 768px)");
      if (mq.matches) setOpen(false);
    }
  }, [pathname, setOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="fixed md:sticky top-0 left-0 z-50 h-screen bg-[var(--panel)] border-r border-[var(--border)] flex flex-col"
        initial={false}
        animate={{ width: open ? 256 : 84 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        aria-label="Primary"
      >
        {/* Header */}
        <div className="h-[var(--header-h)] flex items-center justify-between gap-2 px-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[rgba(255,255,255,.08)] border border-[var(--border)]">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 2l9 4.87v9.78L12 22l-9-5.35V6.87L12 2z"/>
              </svg>
            </div>
            <AnimatePresence initial={false}>
              {open && (
                <motion.span
                  className="font-semibold"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                >
                  Zettabyte
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            className="icon-btn"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="px-2 py-2 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={
                      "group flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent hover:bg-[rgba(255,255,255,.06)] focus:bg-[rgba(255,255,255,.08)]" +
                      (active ? " bg-[rgba(255,255,255,.10)] border-[var(--border)]" : "")
                    }
                    title={!open ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className={
                        "flex items-center justify-center w-9 h-9 rounded-lg " +
                        (active ? "text-white" : "text-[var(--muted)] group-hover:text-white")
                      }
                    >
                      {item.icon}
                    </span>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.span
                          className={
                            "text-sm " +
                            (active ? "text-white" : "text-[var(--muted)] group-hover:text-white")
                          }
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="mt-auto p-3">
          <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,.05)] p-3 text-[var(--muted)] text-xs">
            {open ? "Pro tip: Collapse the sidebar to focus" : ">>"}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
