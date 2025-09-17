// components/ErrorBanner.tsx
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-200">
      {message}
    </div>
  );
}
