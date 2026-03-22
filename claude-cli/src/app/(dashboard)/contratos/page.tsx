"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MoreHorizontal,
  Plus,
  Eye,
  Trash2,
  Link2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContractForm } from "@/components/forms/contract-form";
import {
  useContracts,
  useCreateContract,
  useDeleteContract,
  type Contract,
} from "@/hooks/use-contracts";
import { CONTRACT_STATUS, STATUS_LABELS } from "@/lib/constants";

export default function ContractsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const { data, isLoading } = useContracts({
    status: statusFilter || undefined,
  });
  const createContract = useCreateContract();
  const deleteContract = useDeleteContract();

  const contracts = data?.data || [];

  const handleCreate = async (formData: Parameters<typeof createContract.mutateAsync>[0]) => {
    try {
      await createContract.mutateAsync(formData);
      setFormOpen(false);
      toast.success("Contrato criado com sucesso");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar contrato");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContract.mutateAsync(id);
      toast.success("Contrato excluido com sucesso");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir contrato");
    }
  };

  const handleCopySigningLink = (id: string) => {
    const url = `${window.location.origin}/contratos/${id}/assinar`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link de assinatura copiado");
    }).catch(() => {
      toast.error("Erro ao copiar link");
    });
  };

  const columns: ColumnDef<Contract>[] = [
    {
      accessorKey: "contractNumber",
      header: "Numero",
    },
    {
      accessorKey: "customer.name",
      header: "Cliente",
      cell: ({ row }) => row.original.customer.name,
    },
    {
      accessorKey: "title",
      header: "Titulo",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Data",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "dd/MM/yyyy", {
          locale: ptBR,
        }),
    },
    {
      id: "actions",
      header: "Acoes",
      cell: ({ row }) => {
        const contract = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedContract(contract);
                  setDetailOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCopySigningLink(contract.id)}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Copiar Link de Assinatura
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDelete(contract.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Gerencie seus contratos"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Contrato
          </Button>
        }
      />

      <div className="flex gap-2">
        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val ?? "")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {Object.values(CONTRACT_STATUS).map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={contracts}
          searchKey="contractNumber"
          searchPlaceholder="Buscar por numero..."
        />
      )}

      {/* Create Contract Form */}
      <ContractForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createContract.isPending}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Contrato {selectedContract?.contractNumber}
            </DialogTitle>
            <DialogDescription>
              Detalhes do contrato
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Cliente</p>
                  <p>{selectedContract.customer.name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <StatusBadge status={selectedContract.status} />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Data</p>
                  <p>
                    {format(new Date(selectedContract.createdAt), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                {selectedContract.signedAt && (
                  <div>
                    <p className="font-medium text-muted-foreground">Assinado em</p>
                    <p>
                      {format(
                        new Date(selectedContract.signedAt),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="font-medium text-muted-foreground mb-1">Titulo</p>
                <p className="text-sm">{selectedContract.title}</p>
              </div>

              <div>
                <p className="font-medium text-muted-foreground mb-1">Conteudo</p>
                <div className="whitespace-pre-wrap rounded border p-3 text-sm">
                  {selectedContract.content}
                </div>
              </div>

              {selectedContract.status !== "SIGNED" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopySigningLink(selectedContract.id)}
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Copiar Link de Assinatura
                  </Button>
                </div>
              )}

              {selectedContract.signatureData && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Assinatura</p>
                  <img
                    src={selectedContract.signatureData}
                    alt="Assinatura"
                    className="max-w-full rounded border bg-white p-2"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
