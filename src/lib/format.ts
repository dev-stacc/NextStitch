export function fmtMoney(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toFixed(2)
}

export function fmtDate(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' })
}
