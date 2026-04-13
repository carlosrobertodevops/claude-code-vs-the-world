import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

export function DataTableCard<T>({
  title,
  subtitle,
  columns,
  data,
}: {
  title: string;
  subtitle: string;
  columns: TableColumn<T>[];
  data: T[];
}) {
  return (
    <section className="surface-strong overflow-hidden rounded-[30px]">
      <div className="border-b border-white/[0.08] px-5 py-5 sm:px-6">
        <h2 className="section-title text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.08] text-xs uppercase tracking-[0.2em] text-slate-500">
              {columns.map((column) => (
                <th key={column.key} className={cn("px-5 py-4 font-medium sm:px-6", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-white/5 text-sm text-slate-200 transition hover:bg-white/[0.03] last:border-0"
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-5 py-4 align-top sm:px-6", column.className)}>
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
