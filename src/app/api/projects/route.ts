import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { generateFirstImage } from "@/lib/n8n";
import { uploadToStorage } from "@/lib/storage";

const createSchema = z.object({
  title: z.string().min(1).max(120),
  theme: z.string().max(120).optional().nullable(),
  prompt: z.string().min(1).max(2000),
  platform: z.enum(["instagram", "tiktok", "x", "linkedin", "youtube"]).default("instagram"),
  type: z.string().max(50).default("carousel"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");

  let query = supabase
    .from("projects")
    .select("*, slides(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (platform) {
    query = query.eq("platform", platform);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Buscar empresa padrão
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .limit(1)
    .single();

  if (!company) {
    return NextResponse.json({ error: "No company found" }, { status: 500 });
  }

  // Criar projeto
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      company_id: company.id,
      platform: parsed.data.platform,
      type: parsed.data.type,
      title: parsed.data.title,
      theme: parsed.data.theme ?? null,
      prompt: parsed.data.prompt,
      status: "generating",
    })
    .select()
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: projectError?.message || "Failed to create project" },
      { status: 500 }
    );
  }

  // Criar primeiro slide
  const { data: slide, error: slideError } = await supabase
    .from("slides")
    .insert({
      project_id: project.id,
      index: 0,
      kind: "cover",
      prompt: parsed.data.prompt,
      status: "generating",
    })
    .select()
    .single();

  if (slideError) {
    return NextResponse.json(
      { error: slideError.message },
      { status: 500 }
    );
  }

  // Chamar n8n para gerar imagem
  try {
    const result = await generateFirstImage({
      carouselId: project.id,
      title: parsed.data.title,
      theme: parsed.data.theme ?? null,
      prompt: parsed.data.prompt,
    });

    if (result.imageUrl) {
      // Upload da imagem temporária para o Supabase Storage
      let permanentUrl = result.imageUrl;
      try {
        permanentUrl = await uploadToStorage(result.imageUrl, project.id, 0);
        console.log("[projects] Image saved to storage:", permanentUrl);
      } catch (uploadErr) {
        console.error("[projects] Storage upload failed, using temp URL:", uploadErr);
        // Se o upload falhar, usa a URL temporária como fallback
      }

      // Atualizar slide com a URL permanente
      await supabase
        .from("slides")
        .update({
          image_url: permanentUrl,
          n8n_run_id: result.runId ?? null,
          status: "done",
        })
        .eq("id", slide.id);

      await supabase
        .from("projects")
        .update({ status: "ready" })
        .eq("id", project.id);

      const updatedSlide = { ...slide, image_url: permanentUrl, status: "done" };
      return NextResponse.json(
        { project: { ...project, status: "ready", slides: [updatedSlide] } },
        { status: 201 }
      );
    }

    // Webhook assíncrono — sem imagem ainda
    return NextResponse.json(
      { project: { ...project, slides: [slide] } },
      { status: 201 }
    );
  } catch (err) {
    await supabase
      .from("projects")
      .update({ status: "error" })
      .eq("id", project.id);

    await supabase
      .from("slides")
      .update({ status: "error" })
      .eq("id", slide.id);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 502 }
    );
  }
}
