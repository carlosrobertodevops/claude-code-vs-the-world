export function PageHeader({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--primary)]">JatoFlow</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
      </div>
      {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
    </div>
  );
}
