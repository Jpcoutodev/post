"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContinuationForm({ carouselId }: { carouselId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = { prompt: String(form.get("prompt") ?? "") };

    const res = await fetch(`/api/carousels/${carouselId}/slides`, {
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

    (e.currentTarget as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        name="prompt"
        required
        rows={4}
        placeholder="Descreva o próximo slide (mantendo coerência visual com o anterior)"
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Gerando..." : "Gerar próximo slide"}
      </button>
    </form>
  );
}
