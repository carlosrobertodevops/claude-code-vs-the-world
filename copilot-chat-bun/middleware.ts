export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventario/:path*",
    "/clientes/:path*",
    "/servicos/:path*",
    "/orcamentos/:path*",
    "/contratos/:path*",
    "/fila",
    "/relatorios/:path*",
    "/equipe/:path*",
    "/configuracoes/:path*",
  ],
};
