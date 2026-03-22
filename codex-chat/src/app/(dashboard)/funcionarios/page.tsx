import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireManagerPage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validations/user";

export default async function EmployeesPage() {
  await requireManagerPage();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  async function createEmployee(formData: FormData) {
    "use server";

    const parsed = userSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      role: formData.get("role"),
    });

    if (!parsed.success) return;

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        role: parsed.data.role,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
      },
    });

    revalidatePath("/funcionarios");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Funcionarios" description="Gerencie acessos, papeis e equipe operacional do lava-jato." />

      <Card>
        <h2 className="text-xl font-semibold text-slate-950">Novo colaborador</h2>
        <form action={createEmployee} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input name="name" placeholder="Nome" required />
          <Input name="email" placeholder="Email" required type="email" />
          <Input name="phone" placeholder="Telefone" required />
          <Input name="password" placeholder="Senha inicial" required type="password" />
          <select className="h-11 rounded-2xl border border-slate-200 px-4" defaultValue="EMPLOYEE" name="role">
            <option value="EMPLOYEE">Funcionario</option>
            <option value="MANAGER">Gerente</option>
          </select>
          <Button type="submit">Criar colaborador</Button>
        </form>
      </Card>

      <section className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-slate-950">{user.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{user.email} • {user.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={user.role} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{user.isActive ? "Ativo" : "Inativo"}</span>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
