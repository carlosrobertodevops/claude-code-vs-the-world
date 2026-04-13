export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="muted-label text-[11px] text-emerald-300/78">
        {eyebrow}
      </p>
      <h1 className="section-title max-w-4xl text-3xl font-semibold text-white sm:text-[2.15rem]">
        {title}
      </h1>
      <p className="max-w-3xl text-[15px] leading-7 text-slate-400">{description}</p>
    </div>
  );
}
