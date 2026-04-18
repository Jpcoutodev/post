"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCarouselForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      theme: String(form.get("theme") ?? "") || null,
      prompt: String(form.get("prompt") ?? ""),
    };

    const res = await fetch("/api/carousels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ? JSON.stringify(body.error) : `erro ${res.status}`);
      setLoading(false);
      return;
    }

    const { carousel } = await res.json();
    const imageUrl = carousel?.slides?.[0]?.imageUrl;

    if (imageUrl) {
      setGeneratedImage(imageUrl);
      setLoading(false);
      return;
    }

    // Fallback caso não retorne imagem logo de cara (ex: webhook assíncrono)
    router.push(`/carousel/${carousel.id}`);
    router.refresh();
  }

  if (generatedImage) {
    return (
      <div className="flex flex-col items-center space-y-6 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Imagem gerada com sucesso!</h2>
          <p className="mt-1 text-sm text-neutral-500">O fluxo do n8n retornou a imagem abaixo.</p>
        </div>
        <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={generatedImage} alt="Imagem gerada" className="h-full w-full object-cover transition-transform hover:scale-105 duration-700" />
        </div>
        <button 
          onClick={() => {
            setGeneratedImage(null);
            const form = document.querySelector('form');
            if(form) form.reset();
          }}
          className="rounded-full bg-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200 hover:text-neutral-900"
        >
          Criar outra imagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Título" name="title" required placeholder="Ex: 5 dicas de produtividade" />
      <Field label="Tema (opcional)" name="theme" placeholder="Ex: produtividade, branding, fitness" />
      <div>
        <label className="mb-1 block text-sm font-medium">Prompt da primeira imagem</label>
        <textarea
          name="prompt"
          required
          rows={5}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          placeholder="Descreva estilo, cores, elementos visuais e texto de capa..."
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Gerando..." : "Gerar primeira imagem"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}
