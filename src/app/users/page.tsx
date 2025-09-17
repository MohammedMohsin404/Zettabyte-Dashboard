// app/users/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* ─────────────────────────────── Types ─────────────────────────────── */
type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
  company?: { name?: string; catchPhrase?: string };
  address?: { city?: string };
};

type ViewMode = "grid" | "list";
type SortKey = "name" | "company" | "city";

/* ─────────────────────────────── Helpers ───────────────────────────── */
const PAGE_SIZE = 12;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const initialOf = (s?: string | null) => (s?.trim()?.charAt(0)?.toUpperCase() ?? "U");

/* ─────────────────────────────── UI atoms ──────────────────────────── */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,.06)] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[var(--muted)]">
      {children}
    </span>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" fill="none" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  );
}

function SkeletonRow() {
  return <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 h-14 skeleton" />;
}
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/5" />
        <div className="w-full">
          <div className="h-3 w-1/2 bg-white/5 rounded mb-2" />
          <div className="h-3 w-3/4 bg-white/5 rounded" />
        </div>
      </div>
      <div className="mt-3 h-3 w-1/3 bg-white/5 rounded" />
    </div>
  );
}

/* ───────────────────────────── Cards/Rows ──────────────────────────── */
function UserCard({ u, onOpen }: { u: User; onOpen: (u: User) => void }) {
  return (
    <button
      onClick={() => onOpen(u)}
      className="w-full text-left group rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:shadow-lg transition-shadow focus:outline-none"
    >
      <article className="relative overflow-hidden rounded-2xl p-4">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand)]/70 via-[var(--brand)] to-[var(--brand)]/70 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,.08)] border border-[var(--border)] flex items-center justify-center text-sm">
            {initialOf(u.name ?? u.email)}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{u.name}</div>
            <div className="text-xs text-[var(--muted)] truncate">{u.email}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-[var(--muted)] truncate">
            {u.company?.name ?? "—"} • {u.address?.city ?? "—"}
          </div>
          <Badge>#{u.id}</Badge>
        </div>
      </article>
    </button>
  );
}

function UserRow({ u, onOpen }: { u: User; onOpen: (u: User) => void }) {
  return (
    <button
      onClick={() => onOpen(u)}
      className="group grid grid-cols-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 hover:bg-white/5 text-left"
    >
      <div className="col-span-5 md:col-span-4 min-w-0">
        <div className="font-medium truncate">{u.name}</div>
        <div className="text-xs text-[var(--muted)] truncate">{u.email}</div>
      </div>
      <div className="col-span-3 md:col-span-3 text-xs text-[var(--muted)] truncate">
        {u.company?.name ?? "—"}
      </div>
      <div className="col-span-2 md:col-span-3 text-xs text-[var(--muted)] truncate">
        {u.address?.city ?? "—"}
      </div>
      <div className="col-span-2 flex justify-end">
        <Badge>#{u.id}</Badge>
      </div>
    </button>
  );
}

/* ───────────────────────────── Modal ──────────────────────────────── */
function UserModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <AnimatePresence>
      {user && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-50 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            key="modal"
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{user.name}</h3>
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M18.3 5.71L12 12.01l-6.3-6.3L4.29 7.12l6.3 6.3l-6.3 6.3l1.41 1.41l6.3-6.3l6.3 6.3l1.41-1.41l-6.3-6.3l6.3-6.3z"
                  />
                </svg>
              </button>
            </div>
            <div className="text-sm text-[var(--muted)] mb-3">{user.email}</div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-[var(--muted)]">Username</div>
                <div className="font-medium">{user.username}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)]">Company</div>
                <div className="font-medium">{user.company?.name ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)]">Phone</div>
                <div className="font-medium">{user.phone ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)]">Website</div>
                <div className="font-medium">{user.website ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)]">City</div>
                <div className="font-medium">{user.address?.city ?? "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-[var(--muted)]">Catch phrase</div>
                <div className="font-medium">{user.company?.catchPhrase ?? "—"}</div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="btn" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────────────── Page ─────────────────────────────── */
export default function UsersPage() {
  const prefersReducedMotion = useReducedMotion();

  /* Paging state (infinite scroll) */
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [loadingPage, setLoadingPage] = useState(false);
  const [errorPage, setErrorPage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (targetPage: number) => {
      if (loadingPage) return;
      try {
        setLoadingPage(true);
        setErrorPage(null);
        const url = `${API_BASE}/users?_page=${targetPage}&_limit=${PAGE_SIZE}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as User[];
        setUsers((prev) => {
          const seen = new Set(prev.map((x) => x.id));
          return [...prev, ...json.filter((x) => !seen.has(x.id))];
        });
        setPage(targetPage);
        const total = Number(res.headers.get("x-total-count") ?? 10); // JSONPlaceholder may omit; assume 10 for demo
        setHasMore(targetPage * PAGE_SIZE < (total || 200)); // safe upper bound
      } catch (e) {
        setErrorPage((e as Error).message);
      } finally {
        setLoadingPage(false);
      }
    },
    [loadingPage]
  );

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  /* Toolbar: search/sort/view */
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortKey>("name");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    const base = users.filter((u) => {
      if (!debounced) return true;
      return (
        u.name.toLowerCase().includes(debounced) ||
        (u.email ?? "").toLowerCase().includes(debounced) ||
        (u.company?.name ?? "").toLowerCase().includes(debounced) ||
        (u.address?.city ?? "").toLowerCase().includes(debounced)
      );
    });

    switch (sort) {
      case "company":
        return [...base].sort((a, b) => (a.company?.name ?? "").localeCompare(b.company?.name ?? ""));
      case "city":
        return [...base].sort((a, b) => (a.address?.city ?? "").localeCompare(b.address?.city ?? ""));
      case "name":
      default:
        return [...base].sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [users, debounced, sort]);

  /* Infinite scroll sentinel (non-overlapping footer) */
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const el = sentinelRef.current;
    const ob = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && !loadingPage) loadPage(page + 1);
      },
      { root: null, rootMargin: "600px 0px 600px 0px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [page, hasMore, loadingPage, loadPage]);

  /* Modal */
  const [selected, setSelected] = useState<User | null>(null);

  const initialLoading = loadingPage && users.length === 0;

  /* ───────────────────────────── Render ───────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Sticky Toolbar */}
      <div className="sticky top-[calc(var(--header-h)_+_8px)] z-10 rounded-xl border border-[var(--border)] bg-[var(--panel)]/80 backdrop-blur p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Users</h2>
            <Badge>{users.length} loaded</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
            {/* Search */}
            <label className="col-span-2 md:col-span-1 relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, company, city…"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:ring-2"
                aria-label="Search users"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xs">
                ⌘K
              </span>
            </label>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none"
              aria-label="Sort users"
            >
              <option value="name">Sort: Name</option>
              <option value="company">Sort: Company</option>
              <option value="city">Sort: City</option>
            </select>

            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] p-1">
              <button
                onClick={() => setView("grid")}
                className={`px-3 py-1 text-sm rounded-md ${view === "grid" ? "bg-white/10" : ""}`}
                aria-pressed={view === "grid"}
              >
                Grid
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1 text-sm rounded-md ${view === "list" ? "bg-white/10" : ""}`}
                aria-pressed={view === "list"}
              >
                List
              </button>
            </div>

            {/* Refresh */}
            <button
              className="btn"
              onClick={() => {
                setUsers([]);
                setPage(0);
                setHasMore(true);
                loadPage(1);
              }}
              title="Refetch users"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Initial loading */}
      {initialLoading && (
        <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "grid gap-2"}>
          {Array.from({ length: view === "grid" ? 6 : 8 }).map((_, i) =>
            view === "grid" ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />
          )}
        </div>
      )}

      {/* Error banner (only after initial) */}
      {errorPage && !initialLoading && (
        <div className="card text-sm text-red-300 flex items-center justify-between gap-3">
          <div>Failed to load users. <span className="opacity-70">{errorPage}</span></div>
          <button className="btn" onClick={() => loadPage(Math.max(1, page || 1))}>Retry</button>
        </div>
      )}

      {/* Content */}
      {!initialLoading && (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card">
              <div className="text-xs text-[var(--muted)]">Loaded users</div>
              <div className="mt-1 text-2xl font-semibold">{users.length}</div>
            </div>
            <div className="card">
              <div className="text-xs text-[var(--muted)]">Status</div>
              <div className="mt-1 text-2xl font-semibold">{hasMore ? "Scrolling…" : "All loaded"}</div>
            </div>
            <div className="card">
              <div className="text-xs text-[var(--muted)]">View</div>
              <div className="mt-1 text-2xl font-semibold capitalize">{view}</div>
            </div>
          </div>

          {/* Grid / List */}
          {view === "grid" ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={prefersReducedMotion ? false : "hidden"}
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {filtered.map((u) => (
                <motion.div
                  key={u.id}
                  variants={
                    prefersReducedMotion ? undefined : { hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1 } }
                  }
                >
                  <UserCard u={u} onOpen={setSelected} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="grid gap-2">
              {filtered.map((u) => (
                <UserRow key={u.id} u={u} onOpen={setSelected} />
              ))}
            </div>
          )}

          {/* Intersection observer target */}
          <div className="pt-2">
            <div ref={sentinelRef} className="h-2 w-full" aria-hidden />
          </div>

          {/* Non-overlapping footer */}
          <div className="mt-6 flex items-center justify-center min-h-[40px]">
            {loadingPage && users.length > 0 ? (
              <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-1.5 text-sm text-[var(--muted)] shadow-sm">
                <Spinner className="h-4 w-4" />
                <span>Fetching more…</span>
              </div>
            ) : hasMore ? (
              <button onClick={() => loadPage(page + 1)} className="btn" title="Load next page">
                Load more
              </button>
            ) : users.length > 0 ? (
              <div className="text-xs text-[var(--muted)]">You’ve reached the end.</div>
            ) : null}
          </div>

          {/* Empty state */}
          {!loadingPage && users.length === 0 && (
            <div className="card text-center text-sm text-[var(--muted)]">No users found.</div>
          )}
        </>
      )}

      {/* Modal */}
      {selected && <UserModal user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
