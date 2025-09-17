// app/posts/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/* ─────────────────────────────── Types ─────────────────────────────── */
type Post = { userId: number; id: number; title: string; body: string };
type User = { id: number; name: string; email: string; company?: { name?: string } };

type ViewMode = "grid" | "list";
type SortKey = "recent" | "title" | "author";

/* ─────────────────────────────── Helpers ───────────────────────────── */
const toRoute = (p: string) => p as unknown as import("next").Route;
const initialOf = (s?: string | null) => (s?.trim()?.charAt(0)?.toUpperCase() ?? "U");
const PAGE_SIZE = 12;

/* ─────────────────────────────── UI Atoms ──────────────────────────── */
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

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="h-4 w-2/3 rounded bg-white/5" />
        <div className="h-4 w-10 rounded bg-white/5" />
      </div>
      <div className="h-3 w-full rounded bg-white/5 mb-2" />
      <div className="h-3 w-11/12 rounded bg-white/5 mb-2" />
      <div className="h-3 w-8/12 rounded bg-white/5" />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/5" />
          <div>
            <div className="h-3 w-28 rounded bg-white/5 mb-2" />
            <div className="h-3 w-40 rounded bg-white/5" />
          </div>
        </div>
        <div className="h-3 w-20 rounded bg-white/5" />
      </div>
    </div>
  );
}

/* ─────────────────────────────── Cards ─────────────────────────────── */
function PostCard({ post, user, href }: { post: Post; user?: User; href: string }) {
  const avatarInitial = initialOf(user?.name ?? user?.email);
  const company = user?.company?.name ?? "—";
  return (
    <Link
      href={toRoute(href)}
      className="block group rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:shadow-lg transition-shadow focus:outline-none"
    >
      <article className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand)]/70 via-[var(--brand)] to-[var(--brand)]/70 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="font-semibold leading-snug text-base">{post.title}</h3>
            <Badge>#{post.id}</Badge>
          </div>
          <p className="text-sm text-[var(--muted)] line-clamp-3">{post.body}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[rgba(255,255,255,.08)] border border-[var(--border)] flex items-center justify-center text-xs">
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{user?.name ?? "Unknown user"}</div>
                <div className="text-xs text-[var(--muted)] truncate">
                  {user?.email ?? "no-email@example.com"} • {company}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[var(--muted)] text-xs">
              <span className="group-hover:text-white transition-colors">Read more</span>
              <svg className="group-hover:translate-x-0.5 transition-transform" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M13 5l7 7-7 7-1.41-1.41L16.17 13H4v-2h12.17l-4.58-4.59L13 5z" />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function PostRow({ post, user, href }: { post: Post; user?: User; href: string }) {
  const company = user?.company?.name ?? "—";
  return (
    <Link
      href={toRoute(href)}
      className="group grid grid-cols-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 hover:bg-white/5"
    >
      <div className="col-span-7 md:col-span-6 min-w-0">
        <div className="font-medium truncate">{post.title}</div>
        <div className="text-xs text-[var(--muted)] truncate">{post.body}</div>
      </div>
      <div className="col-span-3 md:col-span-4 min-w-0 text-xs text-[var(--muted)] truncate">
        {(user?.name ?? "Unknown")} • {company}
      </div>
      <div className="col-span-2 flex justify-end">
        <Badge>#{post.id}</Badge>
      </div>
    </Link>
  );
}

/* ─────────────────────────────── Page ─────────────────────────────── */
export default function PostsPage() {
  const prefersReducedMotion = useReducedMotion();

  /* Users (fetch once) */
  const [users, setUsers] = useState<User[] | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as User[];
        if (!cancelled) setUsers(json);
      } catch (e) {
        if (!cancelled) setUsersError((e as Error).message);
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const usersMap = useMemo(() => new Map<number, User>((users ?? []).map((u) => [u.id, u])), [users]);

  /* Posts (paged) */
  const [posts, setPosts] = useState<Post[]>([]);
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
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts?_page=${targetPage}&_limit=${PAGE_SIZE}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Post[];
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...json.filter((p) => !seen.has(p.id))];
        });
        setPage(targetPage);
        const totalStr = res.headers.get("x-total-count");
        const total = totalStr ? Number(totalStr) : 100;
        setHasMore(targetPage * PAGE_SIZE < total);
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

  /* Toolbar state */
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortKey>("recent");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  /* Filtering + sorting (client-side) */
  const filtered = useMemo(() => {
    const base = posts.filter((p) => {
      if (!debounced) return true;
      return p.title.toLowerCase().includes(debounced) || p.body.toLowerCase().includes(debounced);
    });

    switch (sort) {
      case "title":
        return [...base].sort((a, b) => a.title.localeCompare(b.title));
      case "author":
        return [...base].sort((a, b) => {
          const ua = usersMap.get(a.userId)?.name ?? "";
          const ub = usersMap.get(b.userId)?.name ?? "";
          return ua.localeCompare(ub);
        });
      case "recent":
      default:
        return base; // API order is fine for demo
    }
  }, [posts, debounced, sort, usersMap]);

  /* Infinite scroll sentinel */
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

  const initialLoading = loadingPage && posts.length === 0;
  const anyError = Boolean(usersError || errorPage);

  /* ───────────────────────────── Render ───────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Sticky Toolbar */}
      <div className="sticky top-[calc(var(--header-h)_+_8px)] z-10 rounded-xl border border-[var(--border)] bg-[var(--panel)]/80 backdrop-blur p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Posts</h2>
            <Badge>{posts.length} loaded</Badge>
            {usersLoading && <Badge>Loading users…</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
            {/* Search */}
            <label className="col-span-2 md:col-span-1 relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title or body…"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:ring-2"
                aria-label="Search posts"
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
              aria-label="Sort posts"
            >
              <option value="recent">Sort: Recent</option>
              <option value="title">Sort: Title</option>
              <option value="author">Sort: Author</option>
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
                // reset & refetch
                setPosts([]);
                setPage(0);
                setHasMore(true);
                loadPage(1);
                // refetch users too
                setUsers(null);
                setUsersError(null);
                setUsersLoading(true);
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, { cache: "no-store" })
                  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
                  .then((json: User[]) => setUsers(json))
                  .catch((e) => setUsersError((e as Error).message))
                  .finally(() => setUsersLoading(false));
              }}
              title="Refetch posts and users"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {anyError && (
        <div className="card text-sm text-red-300 flex items-center justify-between gap-3">
          <div>
            Failed to load content.{" "}
            <span className="opacity-70">{(usersError as string | null) ?? (errorPage as string | null) ?? ""}</span>
          </div>
          <button className="btn" onClick={() => loadPage(Math.max(1, page || 1))}>
            Retry
          </button>
        </div>
      )}

      {/* Initial loading skeletons */}
      {initialLoading && (
        <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "grid gap-3"}>
          {Array.from({ length: view === "grid" ? 6 : 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Content */}
      {!initialLoading && (
        <>
          {/* Quick stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card">
              <div className="text-xs text-[var(--muted)]">Loaded posts</div>
              <div className="mt-1 text-2xl font-semibold">{posts.length}</div>
            </div>
            <div className="card">
              <div className="text-xs text-[var(--muted)]">Authors</div>
              <div className="mt-1 text-2xl font-semibold">{users?.length ?? (usersLoading ? "…" : 0)}</div>
            </div>
            <div className="card">
              <div className="text-xs text-[var(--muted)]">Status</div>
              <div className="mt-1 text-2xl font-semibold">{hasMore ? "Scrolling…" : "All loaded"}</div>
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
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  variants={
                    prefersReducedMotion ? undefined : { hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1 } }
                  }
                >
                  <PostCard post={p} user={usersMap.get(p.userId)} href={`/posts/${p.id}`} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="grid gap-2">
              {filtered.map((p) => (
                <PostRow key={p.id} post={p} user={usersMap.get(p.userId)} href={`/posts/${p.id}`} />
              ))}
            </div>
          )}

          {/* Intersection Observer target — kept separate, no UI here */}
          <div className="pt-2">
            <div ref={sentinelRef} className="h-2 w-full" aria-hidden />
          </div>

          {/* ─────────── Paging Footer (single, non-overlapping area) ─────────── */}
          <div className="mt-6 flex items-center justify-center min-h-[40px]">
            {loadingPage && posts.length > 0 ? (
              <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-1.5 text-sm text-[var(--muted)] shadow-sm">
                <Spinner className="h-4 w-4" />
                <span>Fetching more…</span>
              </div>
            ) : hasMore ? (
              <button
                onClick={() => loadPage(page + 1)}
                className="btn"
                title="Load next page"
              >
                Load more
              </button>
            ) : posts.length > 0 ? (
              <div className="text-xs text-[var(--muted)]">You’ve reached the end.</div>
            ) : null}
          </div>

          {/* Empty state */}
          {!loadingPage && posts.length === 0 && (
            <div className="card text-center text-sm text-[var(--muted)]">No posts found.</div>
          )}
        </>
      )}
    </div>
  );
}
