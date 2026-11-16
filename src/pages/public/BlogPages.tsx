import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import type { Post } from '../../lib/types'
import { sanitizeHtml } from '../../lib/sanitize'
import Seo from '../../components/Seo'

export function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  useEffect(() => { api.posts().then(p => setPosts(p || [])) }, [])
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <Seo title="Blog — APK FAST PRO" description="News, guides and updates from APK FAST PRO." />
      <h1 className="text-2xl font-bold">Blog / Posts</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map(p => (
          <Link key={p.id} to={`/post/${p.slug}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
            {p.cover_url && <img src={p.cover_url} alt="" loading="lazy" className="h-40 w-full object-cover" />}
            <div className="p-4">
              <h2 className="font-bold">{p.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.excerpt}</p>
              <p className="mt-2 text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
      </div>
      {!posts.length && <p className="mt-6 text-sm text-slate-400">No posts published yet.</p>}
    </main>
  )
}

export function PostPage() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  useEffect(() => { api.postBySlug(slug).then(setPost) }, [slug])
  if (!post) return <main className="py-20 text-center text-slate-400">Loading…</main>
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Seo title={post.seo_title || `${post.title} — APK FAST PRO`} description={post.seo_description || post.excerpt} image={post.cover_url} type="article" />
      <h1 className="text-3xl font-extrabold">{post.title}</h1>
      <p className="mt-2 text-sm text-slate-400">{new Date(post.created_at).toLocaleDateString()}</p>
      {post.cover_url && <img src={post.cover_url} alt="" className="mt-6 w-full rounded-2xl" />}
      {post.content_format === 'xml' ? (
        // XML is shown as content, never executed/rendered as HTML.
        <pre className="prose-post mt-6 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900">{post.content}</pre>
      ) : (
        <article className="prose-post mt-6" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
      )}
    </main>
  )
}
