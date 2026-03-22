"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, ChevronUp, ChevronDown } from "lucide-react";
import { ITEMS_PER_PAGE } from "@/lib/constants";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: string;
  pageSize?: number;
  actions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  headerActions?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Buscar...",
  searchKey,
  pageSize = ITEMS_PER_PAGE,
  actions,
  onRowClick,
  emptyMessage = "Nenhum registro encontrado",
  headerActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredData = useMemo(() => {
    let result = data;
    if (search && searchKey) {
      result = data.filter((item) => {
        const value = String(item[searchKey] || "").toLowerCase();
        return value.includes(search.toLowerCase());
      });
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = String(a[sortKey] || "");
        const bVal = String(b[sortKey] || "");
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [data, search, searchKey, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden shadow-sm">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-[hsl(var(--border))]">
        {searchKey && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all"
            />
          </div>
        )}
        {headerActions && <div className="flex gap-2">{headerActions}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ${
                    col.sortable ? "cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors select-none" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-[hsl(var(--muted-foreground))] text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors hover:bg-[hsl(var(--muted)/0.3)] ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm">
                      {col.render ? col.render(item) : String(item[col.key] ?? "")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
            {Math.min(currentPage * pageSize, filteredData.length)} de{" "}
            {filteredData.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - currentPage) <= 2)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-sm rounded-md transition-colors ${
                    page === currentPage
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  {page}
                </button>
              ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
