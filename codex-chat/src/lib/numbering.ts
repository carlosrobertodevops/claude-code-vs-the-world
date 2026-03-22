export function nextSequence(prefix: string, lastValue?: string | null) {
  const lastNumber = lastValue ? Number(lastValue.replace(`${prefix}-`, "")) : 0;
  return `${prefix}-${String(lastNumber + 1).padStart(4, "0")}`;
}
