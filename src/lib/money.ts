export const toCents = (amount: number) => Math.round((Number.isFinite(amount) ? amount : 0) * 100)

export const formatMoney = (cents: number) => {
  const sign = cents < 0 ? '-' : ''
  return `${sign}¥${(Math.abs(cents) / 100).toFixed(2)}`
}
