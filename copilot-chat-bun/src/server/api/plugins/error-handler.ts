import type { Elysia } from "elysia";

export function withErrorHandler(app: Elysia) {
  return app.onError(({ code, error, set }) => {
    const message = error instanceof Error ? error.message : String(error);

    if (code === "NOT_FOUND" || message === "PUBLIC_QUEUE_NOT_FOUND") {
      set.status = 404;
    } else if (message === "FORBIDDEN") {
      set.status = 403;
    } else {
      set.status = 400;
    }

    return {
      success: false,
      error: {
        code: message === "FORBIDDEN" ? "FORBIDDEN" : code,
        message,
      },
    };
  });
}
