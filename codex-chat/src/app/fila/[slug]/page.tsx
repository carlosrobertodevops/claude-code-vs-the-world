import { notFound } from "next/navigation";

import { PublicQueueBoard } from "@/components/queue/public-queue-board";
import { getPublicQueue } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function PublicQueuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const queue = await getPublicQueue(slug);

  if (!queue) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PublicQueueBoard slug={slug} />
    </main>
  );
}
