export function formatStoryDate(value: string): string {
  if (!value) return ""

  const match = value.match(/^(\d{4})-(\d{2})/)
  if (!match) return value

  const [, year, month] = match
  const date = new Date(Number(year), Number(month) - 1, 1)
  const formatted = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date)

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function normalizeStoryDate(value: string): string {
  return value ? value.slice(0, 7) : value
}
