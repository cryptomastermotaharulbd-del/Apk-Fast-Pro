export interface Category {
  id: string; name: string; slug: string; description: string; icon_url: string
  created_at: string; updated_at?: string
}
export interface AppItem {
  id: string; name: string; slug: string; icon_url: string
  short_description: string; full_description: string
  version: string; size: string; size_bytes?: number | null
  android_min: string; developer: string
  category_id: string | null; categories?: Category | null
  release_date: string | null; updated_date: string | null
  whats_new: string; permissions: string[]
  download_method: 'r2' | 'external'; apk_url: string; apk_key: string; external_url: string
  download_count: number; view_count: number
  is_featured: boolean; status: 'draft' | 'published' | 'scheduled'; publish_at: string | null
  seo_title: string; seo_description: string
  created_at: string; updated_at: string
  app_screenshots?: { id: string; url: string; sort_order: number }[]
}
export interface Post {
  id: string; title: string; slug: string; content: string
  content_format: 'html' | 'xml'; excerpt: string; cover_url: string
  status: 'draft' | 'published' | 'scheduled'; publish_at: string | null
  seo_title: string; seo_description: string; created_at: string; updated_at: string
}
export interface SiteSettings {
  siteName: string; description: string; contactEmail: string
  logoUrl?: string; faviconUrl?: string; footerText?: string
  maintenanceMode: boolean; social: Record<string, string>
  theme?: { accent?: string }; seo?: { title?: string; description?: string }
  homepage?: Record<string, boolean>
}
export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
export const formatCount = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n)
