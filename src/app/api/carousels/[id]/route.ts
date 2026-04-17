import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const carousel = await prisma.carousel.findUnique({
    where: { id },
    include: { slides: { orderBy: { index: "asc" } } },
  });
  if (!carousel) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ carousel });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.carousel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
