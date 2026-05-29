export function stripHtml(html) {
  return String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function hasInlineImage(html) {
  return /<img\b[^>]*>/i.test(String(html ?? ''))
}

function decodeHtmlEntities(value) {
  return String(value ?? '')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim()
}

export function firstInlineImageName(html) {
  const source = String(html ?? '')
  const imageTagMatch = source.match(/<img\b[^>]*>/i)
  if (!imageTagMatch) return ''

  const altMatch = imageTagMatch[0].match(/\salt\s*=\s*(["'])(.*?)\1/i)
  if (!altMatch) return 'Uploaded image'

  return decodeHtmlEntities(altMatch[2]) || 'Uploaded image'
}
