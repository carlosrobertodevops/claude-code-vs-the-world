const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export const formatDateBR = (d: Date | string): string => dateFmt.format(new Date(d));
export const formatDateTimeBR = (d: Date | string): string => dateTimeFmt.format(new Date(d));

export function parseBR(s: string): Date {
  const parts = s.split(/[/\s:]/).map((p) => Number(p));
  const [day, month, year, h = 0, m = 0] = parts;
  if (!day || !month || !year) throw new Error(`Invalid pt-BR date: ${s}`);
  return new Date(year, month - 1, day, h, m);
}
