import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/public/Home'
import { AllApps, LatestApps, TrendingApps } from './pages/public/AppsPages'
import AppDetails from './pages/public/AppDetails'
import { CategoriesPage, CategoryDetails } from './pages/public/CategoriesPages'
import SearchPage from './pages/public/SearchPage'
import { BlogPage, PostPage } from './pages/public/BlogPages'
import { About, Contact, Privacy, Disclaimer, Dmca, NotFound } from './pages/public/StaticPages'
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import AppsAdmin from './pages/admin/AppsAdmin'
import AppForm from './pages/admin/AppForm'
import CategoriesAdmin from './pages/admin/CategoriesAdmin'
import PostsAdmin from './pages/admin/PostsAdmin'
import PostEditor from './pages/admin/PostEditor'
import MediaAdmin from './pages/admin/MediaAdmin'
import DownloadsAdmin from './pages/admin/DownloadsAdmin'
import AnalyticsAdmin from './pages/admin/AnalyticsAdmin'
import UsersAdmin from './pages/admin/UsersAdmin'
import SettingsAdmin from './pages/admin/SettingsAdmin'

export default function App() {
  const location = useLocation()
  const isAdminArea = location.pathname.startsWith('/admin')
  return (
    <>
      {!isAdminArea && <Header />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/apps" element={<AllApps />} />
        <Route path="/app/:slug" element={<AppDetails />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:slug" element={<CategoryDetails />} />
        <Route path="/latest" element={<LatestApps />} />
        <Route path="/trending" element={<TrendingApps />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/post/:slug" element={<PostPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/dmca" element={<Dmca />} />

        {/* Admin — every route below is protected (auth + admins table + RLS) */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/apps" element={<ProtectedRoute><AppsAdmin /></ProtectedRoute>} />
        <Route path="/admin/apps/new" element={<ProtectedRoute><AppForm /></ProtectedRoute>} />
        <Route path="/admin/apps/:id/edit" element={<ProtectedRoute><AppForm /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><CategoriesAdmin /></ProtectedRoute>} />
        <Route path="/admin/posts" element={<ProtectedRoute><PostsAdmin /></ProtectedRoute>} />
        <Route path="/admin/posts/new" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
        <Route path="/admin/posts/:id/edit" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
        <Route path="/admin/media" element={<ProtectedRoute><MediaAdmin /></ProtectedRoute>} />
        <Route path="/admin/downloads" element={<ProtectedRoute><DownloadsAdmin /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AnalyticsAdmin /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><UsersAdmin /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SettingsAdmin /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminArea && <Footer />}
      {!isAdminArea && <><div className="h-16 lg:hidden" /><BottomNav /></>}
    </>
  )
}
