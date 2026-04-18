"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";

const platforms = [
  { id: "instagram", label: "Instagram", color: "bg-gradient-to-r from-pink-500 to-rose-500 text-white", ring: "ring-pink-200" },
  { id: "tiktok", label: "TikTok", color: "bg-neutral-900 text-white", ring: "ring-neutral-300" },
  { id: "x", label: "X", color: "bg-neutral-900 text-white", ring: "ring-neutral-300" },
  { id: "linkedin", label: "LinkedIn", color: "bg-blue-600 text-white", ring: "ring-blue-200" },
  { id: "youtube", label: "YouTube", color: "bg-red-600 text-white", ring: "ring-red-200" },
];

const contentTypes: Record<string, { id: string; label: string }[]> = {
  instagram: [
    { id: "carousel", label: "Carrossel" },
    { id: "post", label: "Post" },
    { id: "reel", label: "Reel" },
    { id: "story", label: "Story" },
  ],
  tiktok: [
    { id: "video", label: "Vídeo" },
    { id: "post", label: "Post" },
  ],
  x: [
    { id: "thread", label: "Thread" },
    { id: "post", label: "Post" },
  ],
  linkedin: [
    { id: "carousel", label: "Carrossel" },
    { id: "post", label: "Post" },
  ],
  youtube: [
    { id: "video", label: "Vídeo" },
    { id: "thumbnail", label: "Thumbnail" },
  ],
};

export default function NewContentForm({
  defaultPlatform,
}: {
  defaultPlatform: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [platform, setPlatform] = useState(defaultPlatform || "instagram");
  const [type, setType] = useState(contentTypes[defaultPlatform]?.[0]?.id || "carousel");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      theme: String(form.get("theme") ?? "") || null,
      prompt: String(form.get("prompt") ?? ""),
      platform,
      type,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ? JSON.stringify(body.error) : `Erro ${res.status}`);
      setLoading(false);
      return;
    }

    const { project } = await res.json();
    const imageUrl = project?.slides?.[0]?.image_url;

    if (imageUrl) {
      setGeneratedImage(imageUrl);
      setLoading(false);
      return;
    }

    router.push(`/project/${project.id}`);
    router.refresh();
  }

  if (generatedImage) {
    return (
      <div className="flex flex-col items-center gap-6 py-4 text-center fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Imagem gerada!</h2>
          <p className="mt-1 text-sm text-neutral-400">
            O fluxo do n8n retornou a imagem abaixo.
          </p>
        </div>
        <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={generatedImage}
            alt="Imagem gerada"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              router.push(`/?tab=${platform}`);
              router.refresh();
            }}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-600 shadow-sm transition-all hover:bg-neutral-50 hover:text-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver projetos
          </button>
          <button
            onClick={() => setGeneratedImage(null)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700"
          >
            <Sparkles className="h-4 w-4" />
            Criar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Platform Selector */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Plataforma
        </label>
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPlatform(p.id);
                setType(contentTypes[p.id]?.[0]?.id || "post");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                platform === p.id
                  ? `${p.color} shadow-md`
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Type */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Tipo de Conteúdo
        </label>
        <div className="flex flex-wrap gap-2">
          {(contentTypes[platform] || []).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                type === t.id
                  ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                  : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Título
        </label>
        <input
          name="title"
          required
          placeholder="Ex: 5 dicas de produtividade"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder-neutral-300 outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Theme */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Tema <span className="text-neutral-300">(opcional)</span>
        </label>
        <input
          name="theme"
          placeholder="Ex: produtividade, branding, fitness"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder-neutral-300 outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Prompt */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Prompt da primeira imagem
        </label>
        <textarea
          name="prompt"
          required
          rows={5}
          placeholder="Descreva estilo, cores, elementos visuais e texto de capa..."
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder-neutral-300 outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100 resize-none"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Gerar primeira imagem
          </>
        )}
      </button>
    </form>
  );
}
