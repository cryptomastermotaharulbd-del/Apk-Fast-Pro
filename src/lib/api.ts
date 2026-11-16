import { supabase } from './supabase'
import type { AppItem, Category, Post, SiteSettings } from './types'

const APP_SELECT = '*, categories(*), app_screenshots(id,url,sort_order)'

async function q<T>(builder: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T | null> {
  const { data, error } = await builder
  if (error) { console.error(error.message); return null }
  return data
}

export const api = {
  async featuredApps(limit = 8) {
    return (await q(supabase.from('apps').select(APP_SELECT).eq('status', 'published')
      .eq('is_featured', true).order('download_count', { ascending: false }).limit(limit))) as AppItem[] | null
  },
  async latestApps(limit = 12) {
    return (await q(supabase.from('apps').select(APP_SELECT).eq('status', 'published')
      .order('created_at', { ascending: false }).limit(limit))) as AppItem[] | null
  },
  async trendingApps(limit = 12) {
    return (await q(supabase.from('apps').select(APP_SELECT).eq('status', 'published')
      .order('view_count', { ascending: false }).limit(limit))) as AppItem[] | null
  },
  async topDownloaded(limit = 12) {
    return (await q(supabase.from('apps').select(APP_SELECT).eq('status', 'published')
      .order('download_count', { ascending: false }).limit(limit))) as AppItem[] | null
  },
  async recentlyUpdated(limit = 12) {
    return (await q(supabase.from('apps').select(APP_SELECT).eq('status', 'published')
      .order('updated_date', { ascending: false }).limit(limit))) as AppItem[] | null
  },
  async appsPage(page = 1, pageSize = 12, categoryId?: string) {
    let query = supabase.from('apps').select(APP_SELECT, { count: 'exact' }).eq('status', 'published')
      .order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1)
    if (categoryId) query = query.eq('category_id', categoryId)
    const { data, count, error } = await query
    if (error) { console.error(error.message); return { apps: [] as AppItem[], total: 0 } }
    return { apps: (data || []) as AppItem[], total: count || 0 }
  },
  async appBySlug(slug: string) {
    const app = await q(supabase.from('apps').select(APP_SELECT).eq('slug', slug).single()) as AppItem | null
    if (app) { supabase.rpc('increment_view', { p_slug: slug }).then(() => {}) }
    return app
  },
  async relatedApps(app: AppItem, limit = 6) {
    if (!app.category_id) return [] as AppItem[]
    return (await q(supabase.from('apps').select(APP_SELECT).eq('status', 'published')
      .eq('category_id', app.category_id).neq('id', app.id)
      .order('download_count', { ascending: false }).limit(limit))) as AppItem[] | null
  },
  async searchApps(term: string) {
    return (await q(supabase.from('apps').select(APP_SELECT).eq('status', 'published')
      .or(`name.ilike.%${term}%,short_description.ilike.%${term}%`).limit(30))) as AppItem[] | null
  },
  async categories() {
    return (await q(supabase.from('categories').select('*').order('name'))) as Category[] | null
  },
  async categoryBySlug(slug: string) {
    return (await q(supabase.from('categories').select('*').eq('slug', slug).single())) as Category | null
  },
  async posts(limit = 20) {
    return (await q(supabase.from('posts').select('*').eq('status', 'published')
      .order('created_at', { ascending: false }).limit(limit))) as Post[] | null
  },
  async postBySlug(slug: string) {
    return (await q(supabase.from('posts').select('*').eq('slug', slug).single())) as Post | null
  },
  async settings(): Promise<SiteSettings | null> {
    const row = await q(supabase.from('site_settings').select('value').eq('key', 'site').single()) as { value: SiteSettings } | null
    return row?.value || null
  },
  // Public download URL — goes through the Netlify function that counts it.
  downloadUrl: (slug: string) => `/download/${encodeURIComponent(slug)}`,
}
