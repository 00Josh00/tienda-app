const locale = 'es-PE';
const currency = 'PEN';

export function formatPrice(price) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(price));
}
