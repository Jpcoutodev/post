import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  PlusCircle,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Post — Social Media Content Studio",
  description:
    "Generate and manage social media content for Instagram, TikTok, X, LinkedIn and YouTube.",
};

/* ───── Platform Icons ───── */
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.29 0 .57.04.84.12V9.02a6.33 6.33 0 0 0-.84-.06 6.34 6.34 0 1 0 6.34 6.34V9.14a8.16 8.16 0 0 0 3.76.92V6.69Z" />
    </svg>
  );
}
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function YouTubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const platformTabs = [
  { id: "instagram", label: "Instagram", icon: InstagramIcon, activeColor: "text-pink-600 bg-pink-50", hoverColor: "hover:bg-pink-50/60 hover:text-pink-600" },
  { id: "tiktok", label: "TikTok", icon: TikTokIcon, activeColor: "text-neutral-900 bg-neutral-100", hoverColor: "hover:bg-neutral-100/60 hover:text-neutral-800" },
  { id: "x", label: "X (Twitter)", icon: XIcon, activeColor: "text-neutral-900 bg-neutral-100", hoverColor: "hover:bg-neutral-100/60 hover:text-neutral-800" },
  { id: "linkedin", label: "LinkedIn", icon: LinkedInIcon, activeColor: "text-blue-700 bg-blue-50", hoverColor: "hover:bg-blue-50/60 hover:text-blue-600" },
  { id: "youtube", label: "YouTube", icon: YouTubeIcon, activeColor: "text-red-600 bg-red-50", hoverColor: "hover:bg-red-50/60 hover:text-red-600" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen">
          {/* ─── Sidebar ─── */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-neutral-200/70 bg-white px-4 py-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-3 mb-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/20">
                <Zap className="h-[18px] w-[18px]" />
              </div>
              <Link href="/" className="text-xl font-bold tracking-tight text-neutral-900">
                Post<span className="text-brand-500">.</span>
              </Link>
            </div>

            {/* Nav geral */}
            <nav className="flex flex-col gap-0.5">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Geral
              </p>
              <Link
                href="/"
                className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition-all hover:bg-neutral-100/70 hover:text-neutral-800"
              >
                <LayoutDashboard className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" />
                Dashboard
              </Link>
              <Link
                href="/new"
                className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition-all hover:bg-neutral-100/70 hover:text-neutral-800"
              >
                <PlusCircle className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" />
                Novo Conteúdo
              </Link>
            </nav>

            {/* Divider */}
            <div className="my-4 h-px bg-neutral-100" />

            {/* Plataformas */}
            <nav className="flex flex-1 flex-col gap-0.5">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Plataformas
              </p>
              {platformTabs.map((p) => {
                const Icon = p.icon;
                return (
                  <Link
                    key={p.id}
                    href={`/?tab=${p.id}`}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition-all ${p.hoverColor}`}
                  >
                    <Icon className="h-4 w-4" />
                    {p.label}
                  </Link>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="my-4 h-px bg-neutral-100" />

            {/* Bottom */}
            <div className="flex flex-col gap-4">
              <Link
                href="/settings"
                className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition-all hover:bg-neutral-100/70 hover:text-neutral-800"
              >
                <Settings className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" />
                Configurações
              </Link>

              {/* Pro card */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 p-4 text-white shadow-lg shadow-brand-600/15">
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
                <div className="relative flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand-200" />
                  <p className="text-xs font-bold">Post Pro</p>
                </div>
                <p className="relative mt-1 text-[10px] leading-relaxed text-white/70">
                  Conteúdo ilimitado com IA.
                </p>
                <button className="relative mt-2.5 w-full rounded-lg bg-white/15 px-3 py-1.5 text-[11px] font-semibold transition hover:bg-white/25">
                  Fazer Upgrade
                </button>
              </div>

              {/* User */}
              <div className="flex items-center gap-2.5 px-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                  JC
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-neutral-800">João Couto</span>
                  <span className="text-[10px] text-neutral-400">Admin</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ─── Main ─── */}
          <div className="flex flex-1 flex-col pl-[264px]">
            <main className="flex-1 px-8 py-8 lg:px-10 lg:py-10">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
