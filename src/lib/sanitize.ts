import DOMPurify from 'dompurify'

// Render admin-authored HTML only after sanitization.
export const sanitizeHtml = (html: string) => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
