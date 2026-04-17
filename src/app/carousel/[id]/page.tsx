import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContinuationForm from "@/components/ContinuationForm";

export const dynamic = "force-dynamic";

export default async function CarouselPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const carousel = await prisma.carousel.findUnique({
    where: { id },
    include: { slides: { orderBy: { index: "asc" } } },
  });

  if (!carousel) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← voltar
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{carousel.title}</h1>
        <p className="text-sm text-neutral-500">
          {carousel.theme && <span>{carousel.theme} · </span>}
          {carousel.slides.length} slides · {carousel.status}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {carousel.slides.map((slide) => (
          <div
            key={slide.id}
            className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
          >
            <div className="aspect-square w-full bg-neutral-100">
              {slide.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.imageUrl}
                  alt={`slide ${slide.index + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                  {slide.status}
                </div>
              )}
            </div>
            <div className="p-3 text-xs text-neutral-500">
              <div className="flex items-center justify-between">
                <span>#{slide.index + 1}</span>
                <span className="uppercase tracking-wide">{slide.kind}</span>
              </div>
              {slide.prompt && <p className="mt-2 line-clamp-3 text-neutral-700">{slide.prompt}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Adicionar slide (continuação)</h2>
        <p className="mt-1 text-sm text-neutral-600">
          O fluxo de continuação receberá a última imagem gerada e o prompt abaixo.
        </p>
        <div className="mt-4">
          <ContinuationForm carouselId={carousel.id} />
        </div>
      </div>
    </div>
  );
}
