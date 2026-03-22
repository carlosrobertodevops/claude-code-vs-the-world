import { getPublicQueue } from "@/lib/queue";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const queue = await getPublicQueue(slug);
  if (!queue) return apiError("NOT_FOUND", "Fila nao encontrada.", undefined, 404);
  return apiSuccess(queue);
}
