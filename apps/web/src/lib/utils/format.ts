export function formatCurrency(value: string | number, currency = 'USD') {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return `${value} ${currency}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCompactCurrency(value: string | number, currency = 'USD') {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return `${value} ${currency}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numericValue);
}

export function formatRooms(value: number) {
  return value === 1 ? '1 room' : `${value} rooms`;
}
