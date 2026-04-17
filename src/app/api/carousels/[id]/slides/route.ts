import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateContinuationImage } from "@/lib/n8n";

const schema = z.object({
  prompt: z.string().min(1).max(2000),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const carousel = await prisma.carousel.findUnique({
    where: { id },
    include: { slides: { orderBy: { index: "asc" } } },
  });
  if (!carousel) return NextResponse.json({ error: "not found" }, { status: 404 });

  const previous = [...carousel.slides].reverse().find((s) => s.imageUrl);
  if (!previous?.imageUrl) {
    return NextResponse.json(
      { error: "no previous image available to continue from" },
      { status: 409 },
    );
  }

  const nextIndex = carousel.slides.length;
  const slide = await prisma.slide.create({
    data: {
      carouselId: id,
      index: nextIndex,
      kind: "continuation",
      prompt: parsed.data.prompt,
      status: "pending",
    },
  });

  try {
    const result = await generateContinuationImage({
      carouselId: id,
      slideIndex: nextIndex,
      previousImageUrl: previous.imageUrl,
      prompt: parsed.data.prompt,
    });

    const updated = await prisma.slide.update({
      where: { id: slide.id },
      data: {
        imageUrl: result.imageUrl ?? null,
        n8nRunId: result.runId ?? null,
        status: result.imageUrl ? "done" : "pending",
      },
    });
    return NextResponse.json({ slide: updated }, { status: 201 });
  } catch (err) {
    await prisma.slide.update({ where: { id: slide.id }, data: { status: "error" } });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 502 },
    );
  }
}
