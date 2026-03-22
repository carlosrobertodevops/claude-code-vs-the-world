"use client";

import { use, useState } from "react";
import { useCustomer, useCreateVehicle } from "@/hooks/use-customers";
import { useServiceOrders, type ServiceOrderListItem } from "@/hooks/use-service-orders";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { ArrowLeft, Plus, Car, FileText, Phone, Mail, MapPin, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: customer, isLoading } = useCustomer(id);
  const { data: allOrders } = useServiceOrders();
  const createVehicle = useCreateVehicle(id);
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);

  // Filter orders for this customer
  const customerOrders = allOrders?.filter(
    (o: ServiceOrderListItem) => o.customer.id === id
  ) ?? [];

  const handleCreateVehicle = async (data: {
    plate: string;
    brand: string;
    model: string;
    year?: number;
    color?: string;
  }) => {
    try {
      await createVehicle.mutateAsync(data);
      setVehicleFormOpen(false);
      toast.success("Veículo cadastrado com sucesso");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar veículo");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cliente não encontrado" />
        <Link href="/clientes">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title={customer.name} />
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.cpfCnpj && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{customer.cpfCnpj}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="vehicles">
        <TabsList>
          <TabsTrigger value="vehicles">
            <Car className="h-4 w-4" />
            Veículos ({customer.vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="orders">
            <FileText className="h-4 w-4" />
            Ordens de Serviço ({customerOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setVehicleFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Veículo
              </Button>
            </div>

            {customer.vehicles.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum veículo cadastrado.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Placa</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Cor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.vehicles.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.plate}</TableCell>
                        <TableCell>{v.brand}</TableCell>
                        <TableCell>{v.model}</TableCell>
                        <TableCell>{v.year || "-"}</TableCell>
                        <TableCell>{v.color || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <VehicleForm
            open={vehicleFormOpen}
            onOpenChange={setVehicleFormOpen}
            onSubmit={handleCreateVehicle}
            isLoading={createVehicle.isPending}
          />
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          {customerOrders.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhuma ordem de serviço encontrada.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerOrders.map((o: ServiceOrderListItem) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <Link
                          href={`/servicos`}
                          className="font-medium text-primary hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {o.vehicle.plate} - {o.vehicle.brand} {o.vehicle.model}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell>
                        R$ {o.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(o.createdAt), "dd/MM/yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
