export function MetricGrid({
  items,
}: {
  items: { label: string; value: string; helper?: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="surface-card rounded-[28px] p-5"
        >
          <p className="text-sm font-medium text-slate-400">{item.label}</p>
          <p className="section-title mt-4 text-[2rem] font-semibold text-white">{item.value}</p>
          {item.helper ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.helper}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
