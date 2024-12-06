/**
 * Formats a number or string as a price with currency symbol
 * @param price - The price to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPrice(price: number | string, currency = 'USD'): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericPrice)
}

/**
 * Formats a date string into a localized date string
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, locale = 'en-US'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formats a number with thousand separators
 * @param number - The number to format
 * @returns Formatted number string
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US').format(number)
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes - The size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Formats a string to title case
 * @param str - The string to format
 * @returns Title cased string
 */
export function formatTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Formats a duration in milliseconds to a human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}
