import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, TrendingUp, Image as ImageIcon, Layers } from "lucide-react";

/* ───── Platform Config ───── */
const platformConfig: Record<string, { label: string; color: string; bgColor: string; gradient: string }> = {
  instagram: { label: "Instagram", color: "text-pink-600", bgColor: "bg-pink-50", gradient: "from-pink-500 to-rose-500" },
  tiktok: { label: "TikTok", color: "text-neutral-800", bgColor: "bg-neutral-100", gradient: "from-neutral-800 to-neutral-600" },
  x: { label: "X", color: "text-neutral-800", bgColor: "bg-neutral-100", gradient: "from-neutral-900 to-neutral-700" },
  linkedin: { label: "LinkedIn", color: "text-blue-700", bgColor: "bg-blue-50", gradient: "from-blue-600 to-blue-500" },
  youtube: { label: "YouTube", color: "text-red-600", bgColor: "bg-red-50", gradient: "from-red-600 to-red-500" },
};

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tab = typeof params.tab === "string" ? params.tab : "instagram";
  const platform = platformConfig[tab] || platformConfig.instagram;

  // Buscar projetos da plataforma ativa
  const { data: projects } = await supabase
    .from("projects")
    .select("*, slides(*)")
    .eq("platform", tab)
    .order("created_at", { ascending: false })
    .limit(50);

  // Stats
  const { count: totalProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  const { count: platformProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("platform", tab);

  const totalSlides = (projects ?? []).reduce(
    (sum, p) => sum + ((p.slides as any[])?.length || 0),
    0
  );

  return (
    <div className="flex flex-col gap-8 fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {platform.label}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Gerencie e crie conteúdo para o {platform.label}.
          </p>
        </div>
        <Link
          href={`/new?platform=${tab}`}
          className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${platform.gradient} px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
        >
          <Plus className="h-4 w-4" />
          Criar Conteúdo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 fade-in fade-in-delay-1">
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-brand-500" />}
          iconBg="bg-brand-50"
          value={totalProjects ?? 0}
          label="Total de Projetos"
        />
        <StatCard
          icon={<Layers className={`h-4 w-4 ${platform.color}`} />}
          iconBg={platform.bgColor}
          value={platformProjects ?? 0}
          label={`No ${platform.label}`}
        />
        <StatCard
          icon={<ImageIcon className="h-4 w-4 text-emerald-500" />}
          iconBg="bg-emerald-50"
          value={totalSlides}
          label="Slides / Mídias"
        />
      </div>

      {/* Content */}
      <div className="min-h-[400px] fade-in fade-in-delay-2">
        {(projects ?? []).length === 0 ? (
          <EmptyState platform={platform} tab={tab} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(projects ?? []).map((project) => (
              <ProjectCard key={project.id} project={project} platform={platform} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───── Stat Card ───── */
function StatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-neutral-900">{value}</p>
        <p className="text-[11px] text-neutral-400">{label}</p>
      </div>
    </div>
  );
}

/* ───── Empty State ───── */
function EmptyState({
  platform,
  tab,
}: {
  platform: { label: string; gradient: string; color: string; bgColor: string };
  tab: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-200 bg-white/60 p-16 text-center transition-all hover:border-neutral-300">
      <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${platform.bgColor}`}>
        <Layers className={`h-8 w-8 ${platform.color} opacity-60`} />
      </div>
      <h2 className="text-lg font-semibold text-neutral-800">
        Nenhum projeto no {platform.label}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-400">
        Comece criando seu primeiro conteúdo para o {platform.label}. Ele aparecerá aqui quando for gerado.
      </p>
      <Link
        href={`/new?platform=${tab}`}
        className={`mt-8 flex items-center gap-2 rounded-full bg-gradient-to-r ${platform.gradient} px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-[0.98]`}
      >
        <Plus className="h-4 w-4" />
        Criar primeiro conteúdo
      </Link>
    </div>
  );
}

/* ───── Project Card ───── */
function ProjectCard({
  project,
  platform,
}: {
  project: any;
  platform: { label: string; color: string };
}) {
  const slides = (project.slides as any[]) || [];
  const sortedSlides = [...slides].sort((a, b) => a.index - b.index);
  const cover = sortedSlides.find((s) => s.image_url)?.image_url;

  const statusStyles: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    generating: "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200",
    ready: "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200",
    published: "bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-200",
    error: "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200",
    completed: "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200",
  };

  return (
    <Link
      href={`/project/${project.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-sm card-hover"
    >
      {/* Cover */}
      <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-50 relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-neutral-50 to-neutral-100">
            <ImageIcon className="h-10 w-10 text-neutral-200" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-300">
              {project.type}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 translate-y-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-xs font-medium text-white/90">Ver detalhes →</p>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        <h2 className="line-clamp-1 text-sm font-semibold text-neutral-800 transition-colors group-hover:text-brand-600">
          {project.title}
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-neutral-400">
            {slides.length} {slides.length === 1 ? "slide" : "slides"}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              statusStyles[project.status] ?? statusStyles.draft
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
