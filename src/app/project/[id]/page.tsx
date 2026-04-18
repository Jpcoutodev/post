import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ContinuationForm from "@/components/ContinuationForm";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: project, error } = await supabase
    .from("projects")
    .select("*, slides(*)")
    .eq("id", id)
    .single();

  if (error || !project) notFound();

  const slides = ((project.slides as any[]) || []).sort(
    (a: any, b: any) => a.index - b.index
  );

  const statusConfig: Record<string, { icon: any; label: string; classes: string }> = {
    draft: { icon: Clock, label: "Rascunho", classes: "text-neutral-500 bg-neutral-100" },
    generating: { icon: Clock, label: "Gerando...", classes: "text-amber-600 bg-amber-50" },
    ready: { icon: CheckCircle2, label: "Pronto", classes: "text-emerald-600 bg-emerald-50" },
    published: { icon: CheckCircle2, label: "Publicado", classes: "text-brand-600 bg-brand-50" },
    error: { icon: AlertCircle, label: "Erro", classes: "text-red-600 bg-red-50" },
    completed: { icon: CheckCircle2, label: "Completo", classes: "text-emerald-600 bg-emerald-50" },
  };

  const status = statusConfig[project.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-8 fade-in">
      {/* Back + Header */}
      <div>
        <Link
          href={`/?tab=${project.platform}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-neutral-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          voltar
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {project.title}
          </h1>
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-sm text-neutral-400">
          {project.theme && <span>{project.theme}</span>}
          {project.theme && <span>·</span>}
          <span>{slides.length} slides</span>
          <span>·</span>
          <span className="capitalize">{project.platform}</span>
          <span>·</span>
          <span className="capitalize">{project.type}</span>
        </div>
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {slides.map((slide: any) => (
          <div
            key={slide.id}
            className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-sm card-hover"
          >
            <div className="aspect-square w-full bg-neutral-50 relative overflow-hidden">
              {slide.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.image_url}
                  alt={`slide ${slide.index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  {slide.status === "generating" ? (
                    <div className="shimmer h-full w-full" />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-neutral-200" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
                        {slide.status}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 p-3">
              <span className="text-xs font-semibold text-neutral-400">
                #{slide.index + 1}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
                {slide.kind}
              </span>
            </div>
            {slide.prompt && (
              <div className="border-t border-neutral-100 px-3 py-2">
                <p className="line-clamp-2 text-[11px] text-neutral-400">
                  {slide.prompt}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Slide */}
      <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-neutral-900">Adicionar slide</h2>
        <p className="mt-1 text-sm text-neutral-400">
          O fluxo de continuação receberá a última imagem gerada e o prompt abaixo.
        </p>
        <div className="mt-4">
          <ContinuationForm carouselId={project.id} />
        </div>
      </div>
    </div>
  );
}
