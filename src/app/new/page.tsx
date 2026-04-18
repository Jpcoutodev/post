import NewContentForm from "@/components/NewContentForm";

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const platform = typeof params.platform === "string" ? params.platform : "instagram";

  return (
    <div className="mx-auto max-w-2xl fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Novo Conteúdo
        </h1>
        <p className="mt-1.5 text-sm text-white/40">
          Preencha os campos abaixo. A primeira imagem será gerada automaticamente.
        </p>
      </div>
      <div className="glass rounded-2xl p-6">
        <NewContentForm defaultPlatform={platform} />
      </div>
    </div>
  );
}
