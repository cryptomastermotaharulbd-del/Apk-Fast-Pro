import { useEffect } from 'react'

interface Props { title: string; description?: string; image?: string; type?: string; jsonLd?: object }

export default function Seo({ title, description = '', image = '', type = 'website', jsonLd }: Props) {
  useEffect(() => {
    document.title = title
    const upsert = (key: 'name' | 'property', value: string, content: string) => {
      if (!content) return
      let el = document.head.querySelector(`meta[${key}="${value}"]`) as HTMLMetaElement | null
      if (!el) { el = document.createElement('meta'); el.setAttribute(key, value); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }
    upsert('name', 'description', description)
    upsert('property', 'og:title', title)
    upsert('property', 'og:description', description)
    upsert('property', 'og:type', type)
    upsert('property', 'og:image', image)
    upsert('name', 'twitter:card', 'summary_large_image')
    upsert('name', 'twitter:title', title)
    upsert('name', 'twitter:description', description)
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = window.location.href.split('#')[0]
    let ld = document.getElementById('jsonld') as HTMLScriptElement | null
    if (jsonLd) {
      if (!ld) { ld = document.createElement('script'); ld.id = 'jsonld'; ld.type = 'application/ld+json'; document.head.appendChild(ld) }
      ld.textContent = JSON.stringify(jsonLd)
    }
    return () => { ld?.remove() }
  }, [title, description, image, type, jsonLd])
  return null
}
