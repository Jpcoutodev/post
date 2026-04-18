"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export default function ContinuationForm({
  carouselId,
}: {
  carouselId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      prompt: String(form.get("prompt") ?? ""),
      text: String(form.get("text") ?? ""),
    };

    const res = await fetch(`/api/projects/${carouselId}/slides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ? (typeof body.error === "string" ? body.error : JSON.stringify(body.error)) : `Erro ${res.status}`);
      setLoading(false);
      return;
    }

    const { slide } = await res.json();

    if (slide?.image_url) {
      setGeneratedImage(slide.image_url);
    }

    (e.currentTarget as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Texto do slide */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Texto do slide
          </label>
          <input
            name="text"
            required
            placeholder="Ex: O problema: 7 em cada 10 restaurantes não respondem avaliações"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder-neutral-300 outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {/* Prompt */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Prompt da imagem
          </label>
          <textarea
            name="prompt"
            required
            rows={3}
            placeholder="Descreva a cena, mantendo coerência visual com o slide anterior..."
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
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando próximo slide...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Gerar próximo slide
            </>
          )}
        </button>
      </form>

      {/* Preview da imagem gerada */}
      {generatedImage && (
        <div className="fade-in rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="mb-3 text-sm font-semibold text-emerald-700">
            ✓ Slide gerado com sucesso!
          </p>
          <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedImage}
              alt="Slide gerado"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
