import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

import { env } from "@/lib/env";
import { apiApp } from "@/server/api";

async function forward(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: env.NEXTAUTH_SECRET,
  });

  const headers = new Headers(request.headers);

  if (token?.sub) {
    headers.set("x-user-id", token.sub);
  }

  if (token?.role) {
    headers.set("x-user-role", String(token.role));
  }

  const forwardedRequest = new Request(request.url, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
  });

  return apiApp.handle(forwardedRequest);
}

export const dynamic = "force-dynamic";

export {
  forward as GET,
  forward as POST,
  forward as PUT,
  forward as PATCH,
  forward as DELETE,
};
