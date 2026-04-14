import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("lavaflow_token")?.value;
  const isLogin = pathname === "/login";
  const isPublic = pathname.startsWith("/fila/") || pathname.startsWith("/api/");

  if (isPublic) return NextResponse.next();
  if (pathname === "/") {
    return NextResponse.redirect(new URL(token ? "/dashboard" : "/login", req.url));
  }
  if (!token && !isLogin) return NextResponse.redirect(new URL("/login", req.url));
  if (token && isLogin) return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
