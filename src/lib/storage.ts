import { supabase } from "./supabase";

/**
 * Baixa uma imagem de uma URL temporária e faz upload para o Supabase Storage.
 * Retorna a URL pública permanente.
 */
export async function uploadToStorage(
  tempUrl: string,
  projectId: string,
  slideIndex: number
): Promise<string> {
  console.log("[storage] Downloading from:", tempUrl);

  // 1. Baixar a imagem da URL temporária
  const response = await fetch(tempUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = await response.arrayBuffer();

  // 2. Determinar extensão pelo content-type
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const ext = extMap[contentType] || "jpg";

  // 3. Criar path organizado: projects/{projectId}/{slideIndex}.{ext}
  const filePath = `projects/${projectId}/${slideIndex}.${ext}`;

  console.log("[storage] Uploading to:", filePath, `(${(buffer.byteLength / 1024).toFixed(1)}KB)`);

  // 4. Upload para Supabase Storage
  const { data, error } = await supabase.storage
    .from("media")
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("[storage] Upload error:", error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // 5. Gerar URL pública permanente
  const { data: publicUrl } = supabase.storage
    .from("media")
    .getPublicUrl(data.path);

  console.log("[storage] Public URL:", publicUrl.publicUrl);

  return publicUrl.publicUrl;
}
