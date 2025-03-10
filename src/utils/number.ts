export const formatNumber = (num: number): string => {
  if (!num) return '0'

  if (num >= 1000000000) {
    const value = (num / 1000000000).toFixed(1)
    return value.endsWith('.0') ? value.slice(0, -2) + 'B' : value + 'B'
  }
  if (num >= 1000000) {
    const value = (num / 1000000).toFixed(1)
    return value.endsWith('.0') ? value.slice(0, -2) + 'M' : value + 'M'
  }
  if (num >= 1000) {
    const value = (num / 1000).toFixed(1)
    return value.endsWith('.0') ? value.slice(0, -2) + 'K' : value + 'K'
  }
  if (num % 1 === 0) {
    return num.toString()
  }

  return num.toFixed(1)
}
