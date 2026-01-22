// Data formatting (numbers, dates, etc.)

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

