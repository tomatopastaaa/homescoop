import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLang } from '../../hooks/useLang'

export default function Navbar() {
  const { user, signInWithGoogle, signOut, isAdmin } = useAuth()
  const { t, lang, toggleLang } = useLang()
  const location = useLocation()

  return (
    <nav className="border-b border-ink-100 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/sg" className="flex items-center gap-2 group">
          <span className="font-display text-xl text-ink-900 group-hover:text-scoop-500 transition-colors">
            HomeScoop
          </span>
          <span className="text-xs font-mono bg-scoop-100 text-scoop-700 px-1.5 py-0.5 rounded">
            /sg
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {isAdmin() && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-ink-900 text-white'
                  : 'text-ink-600 hover:bg-ink-50'
              }`}
            >
              {t('nav.admin')}
            </Link>
          )}
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 text-sm font-mono text-ink-500 hover:text-ink-900 hover:bg-ink-50 rounded-lg transition-colors"
          >
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <img
                src={user.user_metadata?.avatar_url}
                alt={user.user_metadata?.full_name}
                className="w-7 h-7 rounded-full border border-ink-200"
              />
              <button
                onClick={signOut}
                className="text-sm text-ink-500 hover:text-ink-900 transition-colors"
              >
                {t('nav.signOut')}
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-ink-900 text-white text-sm rounded-lg hover:bg-ink-700 transition-colors"
            >
              {t('nav.signIn')}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
