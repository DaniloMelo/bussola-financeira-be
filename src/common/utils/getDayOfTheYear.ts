export function getDayOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0);

  const diff = date.getTime() - startOfYear.getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
