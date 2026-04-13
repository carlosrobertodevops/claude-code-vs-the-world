export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-strong rounded-[30px] p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="section-title text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
