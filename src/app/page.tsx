// app/page.tsx
"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import { ChartLine } from "@/components/ChartLine";
import { useFetch } from "@/hooks/useFetch";

type Post = { userId: number; id: number; title: string; body: string };
type User = { id: number; name: string; email: string; username: string; company?: { name?: string } };

const toRoute = (p: string) => p as unknown as Route;

/* ---------- Small shared UI bits ---------- */
function MetricCard({
  label,
  value,
  delta,
  to,
}: {
  label: string;
  value: string | number;
  delta?: string;
  to?: string;
}) {
  const content = (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-lg transition-shadow">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {delta && <div className="mt-1 text-xs text-emerald-400">{delta}</div>}
    </div>
  );
  return to ? (
    <Link href={toRoute(to)} className="block focus:outline-none">
      {content}
    </Link>
  ) : (
    content
  );
}

function ListItem({
  title,
  subtitle,
  meta,
  href,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  href?: string;
}) {
  const body = (
    <div
      className="
        flex items-center justify-between gap-3
        rounded-xl border border-[var(--border)] bg-[var(--card)]
        p-3 hover:bg-white/5
        overflow-hidden               /* prevent bleed */
      "
    >
      {/* left block */}
      <div className="min-w-0 flex-1">  {/* flex-1 + min-w-0 enables truncation */}
        <div className="font-medium truncate">{title}</div>
        {subtitle && (
          <div
            className="
              text-xs text-[var(--muted)]
              break-words                 /* wrap long words/urls */
              line-clamp-2                /* keep to 2 lines */
            "
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* right meta */}
      {meta && (
        <div
          className="
            shrink-0 text-[10px] text-[var(--muted)]
            ml-2
          "
        >
          {meta}
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={toRoute(href)} className="block focus:outline-none focus:ring-2">
      {body}
    </Link>
  ) : (
    body
  );
}


function Gauge({ percent = 72 }: { percent: number }) {
  // clamp 0..100
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="text-xs text-[var(--muted)]">Quality Score</div>
      <div className="mt-3 flex items-center gap-4">
        <div
          className="relative h-24 w-24 rounded-full"
          style={{
            background: `conic-gradient(var(--brand) ${p * 3.6}deg, rgba(255,255,255,.08) 0)`,
          }}
          aria-label={`Gauge ${p}%`}
          role="img"
        >
          <div className="absolute inset-2 rounded-full border border-[var(--border)] bg-[var(--panel)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-semibold">{p}%</span>
          </div>
        </div>
        <div className="text-sm text-[var(--muted)]">
          Content relevance and user interactions have increased week-over-week. Keep momentum with steady post cadence.
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  /* ---------- Fetch live data ---------- */
  const { data: posts, loading: loadingPosts, error: errorPosts } = useFetch<Post[]>(
    "https://jsonplaceholder.typicode.com/posts"
  );
  const { data: users, loading: loadingUsers, error: errorUsers } = useFetch<User[]>(
    "https://jsonplaceholder.typicode.com/users"
  );

  const isLoading = loadingPosts || loadingUsers;
  const hasError = Boolean(errorPosts || errorUsers);

  const totalPosts = posts?.length ?? 0;
  const totalUsers = users?.length ?? 0;

  // Trend for the chart: derive a simple 7-point series from post ids (stable & visual)
  const values = (posts ?? []).slice(0, 7).map((p) => (p.id % 70) + 20);
  const labels = values.map((_, i) => i + 1);

  // Featured = first post (stable demo)
  const featured = posts?.[ 0 ];

  // Recent posts (5)
  const recent = (posts ?? []).slice(0, 5);

  // Top authors: count posts per userId (based on first 100 posts in API)
  const authorCounts = new Map<number, number>();
  (posts ?? []).forEach((p) => authorCounts.set(p.userId, (authorCounts.get(p.userId) ?? 0) + 1));
  const topAuthors = [ ...authorCounts.entries() ]
    .sort((a, b) => b[ 1 ] - a[ 1 ])
    .slice(0, 5)
    .map(([ userId, count ]) => ({
      user: users?.find((u) => u.id === userId),
      count,
    }));

  // Activity timeline (mix of posts/users)
  const timeline = [
    ...(posts ?? []).slice(0, 3).map((p) => ({ type: "post" as const, title: p.title, id: p.id })),
    ...(users ?? []).slice(0, 2).map((u) => ({ type: "user" as const, title: u.name, id: u.id })),
  ];

  return (
    <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
      {/* ======= LEFT (2 cols): KPIs + Trend + Recent ======= */}
      <div className="2xl:col-span-2 space-y-6">
        {/* KPIs row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard label="Total Posts" value={totalPosts} delta="+12% MoM" to="/posts" />
          <MetricCard label="Total Users" value={totalUsers} delta="+5% MoM" to="/users" />
          <MetricCard label="Engagement" value="7.4" delta="+0.3 vs last wk" />
        </div>

        {/* Trend & Featured (split) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trend chart + mini metrics */}
          <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Posts Trend</h3>
              <Link href={toRoute("/posts")} className="text-sm text-[var(--muted)] hover:underline">
                View all
              </Link>
            </div>

            {hasError && <div className="card text-sm text-red-300">Failed to load data.</div>}
            {isLoading && <div className="card h-40 skeleton" />}

            {!isLoading && !hasError && (
              <>
                <ChartLine values={values} labels={labels} />
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
                    <div className="text-xs text-[var(--muted)]">7-day avg</div>
                    <div className="text-lg font-semibold">
                      {Math.round(values.reduce((a, b) => a + b, 0) / Math.max(1, values.length))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
                    <div className="text-xs text-[var(--muted)]">Best day</div>
                    <div className="text-lg font-semibold">{Math.max(...values)}</div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
                    <div className="text-xs text-[var(--muted)]">Variance</div>
                    <div className="text-lg font-semibold">
                      {Math.max(...values) - Math.min(...values)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Featured post card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
            <div className="text-sm font-medium mb-2">Featured Post</div>
            {isLoading && <div className="card h-28 skeleton" />}
            {!isLoading && featured && (
              <>
                <img
                  src={`https://picsum.photos/seed/${featured.id}/600/320`}
                  alt="Cover"
                  className="w-full h-28 object-cover rounded-lg border border-[var(--border)]"
                />
                <div className="mt-3">
                  <div className="font-semibold line-clamp-2">{featured.title}</div>
                  <div className="text-xs text-[var(--muted)] mb-2">By user #{featured.userId}</div>
                  <p className="text-sm text-[var(--muted)] line-clamp-3">{featured.body}</p>
                </div>
                <Link
                  href={toRoute(`/posts/${featured.id}`)}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-white"
                >
                  Read more
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M13 5l7 7-7 7-1.41-1.41L16.17 13H4v-2h12.17l-4.58-4.59L13 5z" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Recent Posts */}
        <section
          className="
    relative isolate                     /* own stacking context */
    rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4
    overflow-hidden                       /* clip inner shadows/highlights */
  "
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Posts</h3>
            <Link href={toRoute("/posts")} className="text-sm text-[var(--muted)] hover:underline">
              View all
            </Link>
          </div>

          {isLoading && (
            <div className="grid gap-2">
              <div className="card h-12 skeleton" />
              <div className="card h-12 skeleton" />
              <div className="card h-12 skeleton" />
            </div>
          )}

          {!isLoading && (
            <motion.ul
              className="grid gap-2 min-w-0"       /* min-w-0 keeps children from overflowing grid cell */
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {recent.map((p) => (
                <motion.li
                  key={p.id}
                  variants={{ hidden: { y: 8, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                  className="min-w-0"              /* extra safety on each row */
                >
                  <ListItem title={p.title} subtitle={p.body} meta={`#${p.id}`} href={`/posts/${p.id}`} />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </section>

      </div>

      {/* ======= RIGHT (1 col): Authors + Activity + Gauge + Actions ======= */}
      <div className="space-y-6">
        {/* Top Authors */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Top Authors</h3>
            <Link href={toRoute("/users")} className="text-sm text-[var(--muted)] hover:underline">
              View users
            </Link>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="card h-12 skeleton" />
              <div className="card h-12 skeleton" />
              <div className="card h-12 skeleton" />
            </div>
          )}

          {!isLoading && (
            <div className="space-y-2">
              {topAuthors.map((a, i) => (
                <div
                  key={a.user?.id ?? i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{a.user?.name ?? `User #${i + 1}`}</div>
                    <div className="text-xs text-[var(--muted)] truncate">
                      {a.user?.email ?? "no-email@example.com"} • {a.user?.company?.name ?? "—"}
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="px-2 py-1 rounded-lg border border-[var(--border)] bg-white/5">
                      {a.count} posts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Activity Timeline */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <h3 className="font-semibold mb-3">Activity</h3>
          {isLoading && (
            <div className="space-y-2">
              <div className="card h-10 skeleton" />
              <div className="card h-10 skeleton" />
            </div>
          )}
          {!isLoading && (
            <ul className="space-y-2">
              {timeline.map((t, idx) => (
                <li key={`${t.type}-${t.id}`} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--brand)]" />
                  <div className="min-w-0">
                    <div className="text-sm truncate">
                      {t.type === "post" ? "New post" : "New user"}: {t.title}
                    </div>
                    <div className="text-[10px] text-[var(--muted)]">#{t.id}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Gauge */}
        <Gauge percent={72} />

        {/* Quick Actions */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link href={toRoute("/posts")} className="btn text-center">Browse Posts</Link>
            <Link href={toRoute("/users")} className="btn text-center">Browse Users</Link>
            <a
              href="https://jsonplaceholder.typicode.com/"
              target="_blank"
              rel="noreferrer"
              className="btn text-center"
            >
              API Docs
            </a>
            <Link href={toRoute("/posts")} className="btn text-center">
              Create (mock)
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
