// app/posts/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useFetch } from "@/hooks/useFetch";

type Post = { userId: number; id: number; title: string; body: string };
type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  company?: { name?: string; catchPhrase?: string };
};
type Comment = { id: number; postId: number; name: string; email: string; body: string };

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs text-[var(--muted)]">{label}</span>
      <span className="text-sm truncate">{value ?? "—"}</span>
    </div>
  );
}

const initial = (s?: string | null) => (s?.trim()?.charAt(0)?.toUpperCase() ?? "U");

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  // Fetch post
  const postUrl = id ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${id}` : null;
  const { data: post, loading: loadingPost, error: errorPost } = useFetch<Post>(postUrl);

  // Fetch user (depends on post)
  const userUrl = post ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${post.userId}` : null;
  const { data: user, loading: loadingUser, error: errorUser } = useFetch<User>(userUrl);

  // Fetch comments
  const commentsUrl = id ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${id}/comments` : null;
  const { data: comments, loading: loadingComments, error: errorComments } =
    useFetch<Comment[]>(commentsUrl);

  const safeComments: Comment[] = comments ?? [];
  const loading = loadingPost || loadingUser;
  const hasError = Boolean(errorPost || errorUser);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/posts" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:underline">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M11.67 3.87L9.9 5.63 15.27 11H3v2h12.27l-5.36 5.37 1.77 1.76L20 12z" />
          </svg>
          Back to Posts
        </Link>
      </div>

      {hasError && (
        <div className="card text-sm text-red-300">
          {(errorPost as Error | null)?.message ?? (errorUser as Error | null)?.message ?? "Failed to load"}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Post + comments */}
        <div className="lg:col-span-2 space-y-4">
          {loading && <div className="card h-48 skeleton" />}

          {!loading && post && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
              <p className="text-[var(--muted)] whitespace-pre-wrap leading-relaxed">{post.body}</p>
            </div>
          )}

          {/* Comments */}
          <section className="section">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Comments</h3>
              <span className="text-xs text-[var(--muted)]">
                {loadingComments ? "Loading…" : `${safeComments.length} total`}
              </span>
            </div>

            {errorComments && <div className="text-sm text-red-300">Failed to load comments.</div>}

            {loadingComments && (
              <div className="space-y-2">
                <div className="card h-16 skeleton" />
                <div className="card h-16 skeleton" />
                <div className="card h-16 skeleton" />
              </div>
            )}

            {!loadingComments && !errorComments && (
              <motion.ul
                className="space-y-2"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {safeComments.slice(0, 6).map((c) => (
                  <motion.li
                    key={c.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                    variants={{ hidden: { y: 8, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm truncate pr-3">{c.name}</div>
                      <span className="text-[10px] text-[var(--muted)]">#{c.id}</span>
                    </div>
                    <div className="text-xs text-[var(--muted)] mb-1 truncate">{c.email}</div>
                    <p className="text-sm text-[var(--muted)]">{c.body}</p>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </section>
        </div>

        {/* Author panel */}
        <aside className="space-y-4">
          {loading && <div className="card h-40 skeleton" />}

          {!loading && (
            <div className="card">
              <div className="mb-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,.08)] border border-[var(--border)] flex items-center justify-center text-base">
                  {initial(user?.name ?? user?.email)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{user?.name ?? "Unknown user"}</div>
                  <div className="text-xs text-[var(--muted)] truncate">{user?.email ?? "no-email@example.com"}</div>
                </div>
              </div>

              <div className="divide-y divide-[var(--border)]">
                <InfoRow label="Company" value={user?.company?.name} />
                <InfoRow label="Catch phrase" value={user?.company?.catchPhrase} />
                <InfoRow label="Phone" value={user?.phone} />
                <InfoRow label="Website" value={user?.website} />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <a
                  href={user?.website ? `https://${user.website}` : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                >
                  Visit Website
                </a>
              </div>
            </div>
          )}

          {!loading && post && (
            <div className="card">
              <div className="text-xs text-[var(--muted)]">Post ID</div>
              <div className="text-2xl font-semibold">{post.id}</div>
              <div className="mt-3 text-xs text-[var(--muted)]">
                User ID: <span className="text-white/90">{post.userId}</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
