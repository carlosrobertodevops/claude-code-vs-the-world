import Link from "next/link";
import { revalidatePath } from "next/cache";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { customerSchema, vehicleSchema } from "@/lib/validations/customer";
import { prisma } from "@/lib/prisma";
export default async function CustomersPage() {
  const [customers, simpleCustomers] = await Promise.all([
    prisma.customer.findMany({
      include: {
        vehicles: true,
        loyaltyTransactions: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  async function createCustomer(formData: FormData) {
    "use server";

    const parsed = customerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      cpfCnpj: formData.get("cpfCnpj"),
      address: formData.get("address"),
    });

    if (!parsed.success) return;

    await prisma.customer.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        cpfCnpj: parsed.data.cpfCnpj || null,
        address: parsed.data.address || null,
      },
    });

    revalidatePath("/clientes");
    revalidatePath("/dashboard");
  }

  async function createVehicle(formData: FormData) {
    "use server";

    const parsed = vehicleSchema.safeParse({
      customerId: formData.get("customerId"),
      plate: formData.get("plate"),
      brand: formData.get("brand"),
      model: formData.get("model"),
      year: formData.get("year"),
      color: formData.get("color"),
    });

    if (!parsed.success) return;

    await prisma.vehicle.create({ data: parsed.data });
    revalidatePath("/clientes");
    revalidatePath("/servicos");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes e veiculos"
        description="Cadastre clientes, acompanhe veiculos vinculados, pontos acumulados e atalhos para contato rapido."
      >
        <Link href="/servicos">
          <Button>Nova OS</Button>
        </Link>
      </PageHeader>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-slate-950">Novo cliente</h2>
          <form action={createCustomer} className="mt-6 grid gap-4 md:grid-cols-2">
            <Input name="name" placeholder="Nome completo" required />
            <Input name="email" placeholder="Email" type="email" />
            <Input name="phone" placeholder="Telefone" required />
            <Input name="cpfCnpj" placeholder="CPF/CNPJ" />
            <Input className="md:col-span-2" name="address" placeholder="Endereco" />
            <Button className="md:col-span-2" type="submit">Salvar cliente</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-slate-950">Novo veiculo</h2>
          <form action={createVehicle} className="mt-6 grid gap-4 md:grid-cols-2">
            <select className="h-11 rounded-2xl border border-slate-200 px-4" name="customerId" required>
              <option value="">Selecione o cliente</option>
              {simpleCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
            <Input name="plate" placeholder="Placa" required />
            <Input name="brand" placeholder="Marca" required />
            <Input name="model" placeholder="Modelo" required />
            <Input name="year" placeholder="Ano" required type="number" />
            <Input name="color" placeholder="Cor" required />
            <Button className="md:col-span-2" type="submit">Adicionar veiculo</Button>
          </form>
        </Card>
      </section>

      <section className="grid gap-4">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-slate-950">{customer.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{customer.phone} {customer.email ? `• ${customer.email}` : ""}</p>
                <p className="mt-1 text-sm text-slate-500">{customer.address ?? "Endereco nao informado"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">{customer.loyaltyPoints} pts fidelidade</span>
                {customer.phone ? (
                  <Link className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700" href={`https://wa.me/55${customer.phone}`} target="_blank">
                    Abrir WhatsApp
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Veiculos</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {customer.vehicles.map((vehicle) => (
                    <div className="rounded-3xl border border-slate-200 p-4" key={vehicle.id}>
                      <p className="font-semibold text-slate-900">{vehicle.brand} {vehicle.model}</p>
                      <p className="mt-1 text-sm text-slate-600">{vehicle.plate} • {vehicle.year} • {vehicle.color}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Extrato recente</p>
                <div className="mt-3 space-y-3">
                  {customer.loyaltyTransactions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Sem movimentacoes de fidelidade ainda.</div>
                  ) : (
                    customer.loyaltyTransactions.map((entry) => (
                      <div className="rounded-3xl border border-slate-200 p-4" key={entry.id}>
                        <p className="font-semibold text-slate-900">{entry.points} pontos</p>
                        <p className="mt-1 text-sm text-slate-600">{entry.description ?? entry.type}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
