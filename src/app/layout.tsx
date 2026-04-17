import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Post — Instagram Carousel Generator",
  description: "Generate Instagram carousels powered by n8n workflows.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
          <header className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              <span className="text-brand-600">Post</span>
              <span className="ml-2 text-neutral-500">· carousels</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-neutral-600">
              <Link href="/" className="hover:text-neutral-900">
                Dashboard
              </Link>
              <Link
                href="/new"
                className="rounded-md bg-brand-600 px-3 py-1.5 font-medium text-white hover:bg-brand-700"
              >
                Novo carrossel
              </Link>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-12 text-xs text-neutral-400">
            Built with Next.js · Prisma · n8n
          </footer>
        </div>
      </body>
    </html>
  );
}
