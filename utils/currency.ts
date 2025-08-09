export function formatCurrency(
  amount: number,
  options?: { locale?: string; currency?: string }
): string {
  const locale = options?.locale || (typeof Intl !== 'undefined' ? undefined : undefined);
  const currency = options?.currency || 'USD';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if Intl is unavailable
    const fixed = amount.toFixed(2);
    return `$${fixed}`;
  }
}

export function centsFromText(text: string): number {
  const digits = text.replace(/\D/g, '');
  if (!digits) return 0;
  // Cap to avoid overflow in extreme pastes
  const capped = digits.slice(0, 12);
  return Number(capped);
}

export function textFromCents(cents: number): string {
  const value = (cents || 0) / 100;
  return value.toFixed(2);
}
