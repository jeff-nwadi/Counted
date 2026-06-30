import { TOKENS } from '@/styles/tokens'

// Determines if stock is ok, low, or out
export function getStatus(qty, reorderLevel) {
  if (qty <= 0) return 'out'
  if (qty <= reorderLevel) return 'low'
  return 'ok'
}

// Maps status value to visual styles and text labels
export function getStatusDetails(status) {
  switch (status) {
    case 'out':
      return {
        label: 'Out of stock',
        bgClass: 'bg-red-50 text-red-600 border-red-100',
        dotClass: 'bg-red-600',
        color: TOKENS.colors.red,
        bg: TOKENS.colors.redBg,
      }
    case 'low':
      return {
        label: 'Low stock',
        bgClass: 'bg-amber-bg text-amber border-brand-mid',
        dotClass: 'bg-amber',
        color: TOKENS.colors.amber,
        bg: TOKENS.colors.amberBg,
      }
    case 'ok':
    default:
      return {
        label: 'In stock',
        bgClass: 'bg-green-bg text-green border-green-100',
        dotClass: 'bg-green',
        color: TOKENS.colors.green,
        bg: TOKENS.colors.greenBg,
      }
  }
}
