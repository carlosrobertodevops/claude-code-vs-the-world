import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPatterns = [
  /^\/login$/,
  /^\/fila\/[^/]+$/,
  /^\/api\/fila\/publica\/[^/]+$/,
  /^\/api\/auth\//,
  /^\/api\/contratos\/[^/]+\/assinar$/,
  /^\/$/,
];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (publicPatterns.some((pattern) => pattern.test(pathname))) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  const token = await getToken({
    req: request as never,
    secret: process.env.AUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
