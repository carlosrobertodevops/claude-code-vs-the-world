"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MoreHorizontal,
  Plus,
  FileDown,
  Eye,
  Pencil,
  Trash2,
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
import { QuoteForm } from "@/components/forms/quote-form";
import {
  useQuotes,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
  type Quote,
} from "@/hooks/use-quotes";
import { QUOTE_STATUS } from "@/lib/constants";
import { STATUS_LABELS } from "@/lib/constants";

export default function QuotesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusQuoteId, setStatusQuoteId] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("");

  const { data, isLoading } = useQuotes({
    status: statusFilter || undefined,
  });
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const deleteQuote = useDeleteQuote();

  const quotes = data?.data || [];

  const handleCreate = async (formData: Parameters<typeof createQuote.mutateAsync>[0]) => {
    try {
      await createQuote.mutateAsync(formData);
      setFormOpen(false);
      toast.success("Orcamento criado com sucesso");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar orcamento");
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusQuoteId || !newStatus) return;
    try {
      await updateQuote.mutateAsync({
        id: statusQuoteId,
        data: { status: newStatus },
      });
      setStatusDialogOpen(false);
      toast.success("Status atualizado com sucesso");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuote.mutateAsync(id);
      toast.success("Orcamento excluido com sucesso");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir orcamento");
    }
  };

  const handleDownloadPdf = (id: string) => {
    window.open(`/api/orcamentos/${id}/pdf`, "_blank");
  };

  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: "quoteNumber",
      header: "Numero",
    },
    {
      accessorKey: "customer.name",
      header: "Cliente",
      cell: ({ row }) => row.original.customer.name,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "totalAmount",
      header: "Valor Total",
      cell: ({ row }) =>
        `R$ ${row.original.totalAmount.toFixed(2).replace(".", ",")}`,
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
        const quote = row.original;
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
                  setSelectedQuote(quote);
                  setDetailOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setStatusQuoteId(quote.id);
                  setNewStatus(quote.status);
                  setStatusDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Alterar Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadPdf(quote.id)}>
                <FileDown className="mr-2 h-4 w-4" />
                Baixar PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDelete(quote.id)}
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
        title="Orcamentos"
        description="Gerencie seus orcamentos"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Orcamento
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
            {Object.values(QUOTE_STATUS).map((status) => (
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
          data={quotes}
          searchKey="quoteNumber"
          searchPlaceholder="Buscar por numero..."
        />
      )}

      {/* Create Quote Form */}
      <QuoteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createQuote.isPending}
      />

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Status</DialogTitle>
            <DialogDescription>
              Selecione o novo status do orcamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={(val) => setNewStatus(val ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(QUOTE_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setStatusDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updateQuote.isPending}
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Orcamento {selectedQuote?.quoteNumber}
            </DialogTitle>
            <DialogDescription>
              Detalhes do orcamento
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Cliente</p>
                  <p>{selectedQuote.customer.name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <StatusBadge status={selectedQuote.status} />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Data</p>
                  <p>
                    {format(new Date(selectedQuote.createdAt), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Valor Total</p>
                  <p className="font-bold">
                    R$ {selectedQuote.totalAmount.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium text-muted-foreground mb-2">Itens</p>
                <div className="space-y-2">
                  {selectedQuote.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between rounded border p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.serviceType.name}</p>
                        <p className="text-muted-foreground">
                          {item.quantity}x R$ {item.unitPrice.toFixed(2).replace(".", ",")}
                          {item.discount > 0 ? ` (-${item.discount}%)` : ""}
                        </p>
                      </div>
                      <p className="font-medium">
                        R$ {item.subtotal.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedQuote.notes && (
                <div>
                  <p className="font-medium text-muted-foreground">Observacoes</p>
                  <p className="text-sm">{selectedQuote.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
