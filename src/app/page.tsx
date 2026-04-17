import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const carousels = await prisma.carousel
    .findMany({
      orderBy: { createdAt: "desc" },
      include: { slides: { orderBy: { index: "asc" } } },
      take: 50,
    })
    .catch(() => []);

  if (carousels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white p-16 text-center">
        <h1 className="text-2xl font-semibold">Nenhum carrossel ainda</h1>
        <p className="mt-2 max-w-md text-sm text-neutral-600">
          Configure as URLs dos webhooks do n8n no <code>.env</code> e crie seu primeiro carrossel.
        </p>
        <Link
          href="/new"
          className="mt-6 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Criar carrossel
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {carousels.map((c) => {
        const cover = c.slides.find((s) => s.imageUrl)?.imageUrl;
        return (
          <Link
            key={c.id}
            href={`/carousel/${c.id}`}
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-neutral-300 hover:shadow-sm"
          >
            <div className="aspect-square w-full bg-neutral-100">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={c.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                  {c.status}
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="line-clamp-1 font-medium">{c.title}</h2>
              <p className="mt-1 text-xs text-neutral-500">
                {c.slides.length} {c.slides.length === 1 ? "slide" : "slides"} · {c.status}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
