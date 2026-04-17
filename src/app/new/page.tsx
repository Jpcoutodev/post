import NewCarouselForm from "@/components/NewCarouselForm";

export default function NewCarouselPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Novo carrossel</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Preencha o tema e o prompt. A primeira imagem será gerada pelo fluxo do n8n.
      </p>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
        <NewCarouselForm />
      </div>
    </div>
  );
}
