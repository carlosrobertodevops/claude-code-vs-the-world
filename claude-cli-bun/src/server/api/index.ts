import { Elysia } from "elysia";
import { errorHandler } from "./plugins/error-handler";
import { authRoutes } from "./routes/auth.routes";
import { employeeRoutes } from "./routes/employees.routes";
import { customerRoutes } from "./routes/customers.routes";
import { inventoryRoutes } from "./routes/inventory.routes";
import { serviceOrderRoutes } from "./routes/services.routes";
import { queueRoutes } from "./routes/queue.routes";
import { quoteRoutes } from "./routes/quotes.routes";
import { contractRoutes } from "./routes/contracts.routes";
import { reportRoutes } from "./routes/reports.routes";
import { uploadRoutes } from "./routes/upload.routes";

export const app = new Elysia({ prefix: "/api" })
  .use(errorHandler)
  .use(authRoutes)
  .use(employeeRoutes)
  .use(customerRoutes)
  .use(inventoryRoutes)
  .use(serviceOrderRoutes)
  .use(queueRoutes)
  .use(quoteRoutes)
  .use(contractRoutes)
  .use(reportRoutes)
  .use(uploadRoutes);

export type App = typeof app;
