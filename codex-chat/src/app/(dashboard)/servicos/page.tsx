import { ServiceOrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { nextSequence } from "@/lib/numbering";
import { requireSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { recalculateQueue } from "@/lib/queue";
import { serviceOrderSchema } from "@/lib/validations/service";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function ServicesPage() {
  await requireSession();
  const [orders, customers, vehicles, employees, serviceTypes, products] = await Promise.all([
    prisma.serviceOrder.findMany({
      include: {
        customer: true,
        vehicle: true,
        employee: true,
        queueEntry: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ include: { customer: true }, orderBy: { plate: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.serviceType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  async function createOrder(formData: FormData) {
    "use server";

    const parsed = serviceOrderSchema.safeParse({
      customerId: formData.get("customerId"),
      vehicleId: formData.get("vehicleId"),
      employeeId: formData.get("employeeId") || undefined,
      serviceTypeId: formData.get("serviceTypeId"),
      productId: formData.get("productId") || undefined,
      status: formData.get("status"),
      notes: formData.get("notes") || undefined,
    });

    if (!parsed.success) return;

    const [lastOrder, serviceType, product] = await Promise.all([
      prisma.serviceOrder.findFirst({ orderBy: { createdAt: "desc" }, select: { orderNumber: true } }),
      prisma.serviceType.findUnique({ where: { id: parsed.data.serviceTypeId } }),
      parsed.data.productId ? prisma.product.findUnique({ where: { id: parsed.data.productId } }) : Promise.resolve(null),
    ]);

    if (!serviceType) return;

    const servicePrice = Number(serviceType.basePrice);
    const productPrice = product ? Number(product.costPrice) * 1.7 : 0;
    const total = servicePrice + productPrice;
    const startedAt = parsed.data.status === ServiceOrderStatus.WAITING ? null : new Date();
    const completedAt = parsed.data.status === ServiceOrderStatus.COMPLETED ? new Date() : null;

    const order = await prisma.serviceOrder.create({
      data: {
        customerId: parsed.data.customerId,
        vehicleId: parsed.data.vehicleId,
        employeeId: parsed.data.employeeId || null,
        orderNumber: nextSequence("OS", lastOrder?.orderNumber),
        status: parsed.data.status,
        totalAmount: total,
        startedAt: startedAt ?? undefined,
        completedAt: completedAt ?? undefined,
        notes: parsed.data.notes,
        items: {
          create: [
            {
              serviceTypeId: serviceType.id,
              description: serviceType.name,
              quantity: 1,
              unitPrice: servicePrice,
              subtotal: servicePrice,
            },
            ...(product
              ? [
                  {
                    productId: product.id,
                    description: `Uso interno de ${product.name}`,
                    quantity: 1,
                    unitPrice: productPrice,
                    subtotal: productPrice,
                  },
                ]
              : []),
          ],
        },
      },
    });

    if (parsed.data.status === ServiceOrderStatus.COMPLETED) {
      const points = Math.floor(total / 10);
      await prisma.loyaltyTransaction.create({
        data: {
          customerId: parsed.data.customerId,
          serviceOrderId: order.id,
          type: "EARNED",
          points,
          description: `Pontos pela ${order.orderNumber}`,
        },
      });
      await prisma.customer.update({ where: { id: parsed.data.customerId }, data: { loyaltyPoints: { increment: points } } });
    }

    await recalculateQueue();
    revalidatePath("/servicos");
    revalidatePath("/fila");
    revalidatePath("/dashboard");
  }

  async function updateStatus(formData: FormData) {
    "use server";

    const orderId = String(formData.get("orderId"));
    const status = formData.get("status") as ServiceOrderStatus;
    const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
    if (!order) return;

    await prisma.serviceOrder.update({
      where: { id: orderId },
      data: {
        status,
        startedAt: status === ServiceOrderStatus.IN_PROGRESS ? order.startedAt ?? new Date() : order.startedAt,
        completedAt: status === ServiceOrderStatus.COMPLETED ? new Date() : status === ServiceOrderStatus.CANCELLED ? null : order.completedAt,
      },
    });

    if (status === ServiceOrderStatus.COMPLETED) {
      const existing = await prisma.loyaltyTransaction.count({ where: { serviceOrderId: orderId } });
      if (existing === 0) {
        const points = Math.floor(Number(order.totalAmount) / 10);
        await prisma.loyaltyTransaction.create({
          data: {
            customerId: order.customerId,
            serviceOrderId: order.id,
            type: "EARNED",
            points,
            description: `Pontos pela ${order.orderNumber}`,
          },
        });
        await prisma.customer.update({ where: { id: order.customerId }, data: { loyaltyPoints: { increment: points } } });
      }
    }

    await recalculateQueue();
    revalidatePath("/servicos");
    revalidatePath("/fila");
    revalidatePath("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Ordens de servico" description="Crie OS, mude status operacional e mantenha fila publica sincronizada automaticamente." />

      <Card>
        <h2 className="text-xl font-semibold text-slate-950">Nova ordem de servico</h2>
        <form action={createOrder} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select className="h-11 rounded-2xl border border-slate-200 px-4" name="customerId" required>
            <option value="">Cliente</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
          <select className="h-11 rounded-2xl border border-slate-200 px-4" name="vehicleId" required>
            <option value="">Veiculo</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plate} • {vehicle.brand} {vehicle.model}</option>)}
          </select>
          <select className="h-11 rounded-2xl border border-slate-200 px-4" name="employeeId">
            <option value="">Funcionario responsavel</option>
            {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
          </select>
          <select className="h-11 rounded-2xl border border-slate-200 px-4" name="serviceTypeId" required>
            <option value="">Servico principal</option>
            {serviceTypes.map((serviceType) => <option key={serviceType.id} value={serviceType.id}>{serviceType.name}</option>)}
          </select>
          <select className="h-11 rounded-2xl border border-slate-200 px-4" name="productId">
            <option value="">Produto opcional</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <select className="h-11 rounded-2xl border border-slate-200 px-4" name="status" defaultValue="WAITING">
            <option value="WAITING">Aguardando</option>
            <option value="IN_PROGRESS">Em andamento</option>
            <option value="COMPLETED">Concluido</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <Input className="xl:col-span-3" name="notes" placeholder="Observacoes da OS" />
          <Button className="xl:col-span-3" type="submit">Criar OS</Button>
        </form>
      </Card>

      <section className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-semibold text-slate-950">{order.orderNumber}</h3>
                  <StatusBadge status={order.status} />
                  {order.queueEntry ? <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">Fila #{order.queueEntry.position}</span> : null}
                </div>
                <p className="mt-2 text-sm text-slate-600">{order.customer.name} • {order.vehicle.brand} {order.vehicle.model} • {order.vehicle.plate}</p>
                <p className="mt-1 text-xs text-slate-500">Criada em {formatDateTime(order.createdAt)} {order.employee ? `• ${order.employee.name}` : ""}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-lg font-semibold text-slate-900">{formatCurrency(Number(order.totalAmount))}</span>
                {order.status !== ServiceOrderStatus.IN_PROGRESS ? (
                  <form action={updateStatus}>
                    <input name="orderId" type="hidden" value={order.id} />
                    <input name="status" type="hidden" value="IN_PROGRESS" />
                    <Button type="submit" variant="secondary">Iniciar</Button>
                  </form>
                ) : null}
                {order.status !== ServiceOrderStatus.COMPLETED ? (
                  <form action={updateStatus}>
                    <input name="orderId" type="hidden" value={order.id} />
                    <input name="status" type="hidden" value="COMPLETED" />
                    <Button type="submit">Concluir</Button>
                  </form>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
