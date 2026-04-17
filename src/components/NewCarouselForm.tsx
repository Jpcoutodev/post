"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCarouselForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    router.push(`/carousel/${carousel.id}`);
    router.refresh();
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
