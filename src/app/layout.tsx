// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import { SessionProvider } from "@/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Zettabyte Dashboard",
  description: "Mini dashboard with animated collapsible sidebar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* We theme via a data attribute on <html>; during hydration the value can change.
          suppressHydrationWarning prevents false-positive mismatch noise. */}
      <body suppressHydrationWarning>
        {/* NextAuth session context (client) */}
        <SessionProvider>
          <ClientLayout>{children}</ClientLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
