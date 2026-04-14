import { app } from "@/server/api";

const handler = (req: Request) => app.handle(req);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;
