export function formatPrice(amount) {
  return `${Number(amount).toLocaleString('uk-UA')} грн`
}

export function resolveAsset(relativePath) {
  if (!relativePath) return ''
  const cleanPath = relativePath.replace(/^\/+/, '')
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return `${base}${cleanPath}`
}
