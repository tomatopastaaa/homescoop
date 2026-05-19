import { useEffect, useState, useRef } from 'react'
import { useLang } from '../hooks/useLang'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import FirmCard from '../components/firms/FirmCard'
import DesignerCard from '../components/ids/DesignerCard'
import ReviewForm from '../components/reviews/ReviewForm'

const TAGS = ['delay','workmanship','comms','overcharge','ghost','quality','responsive','transparent','ontime']

export default function SGPage() {
  const { t } = useLang()
  const { user } = useAuth()
  const [tab, setTab] = useState('firms')
  const [firms, setFirms] = useState([])
  const [designers, setDesigners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [verdictFilter, setVerdictFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [jumpId, setJumpId] = useState(null)
  const designerRefs = useRef({})

  const fetchData = async () => {
    setLoading(true)
    const [firmsRes, designersRes] = await Promise.all([
      supabase.from('firms').select(`
        *, reviews(*, author_id, planning_rating, execution_rating, designers(name))
      `).eq('market_id', 'sg').order('review_count', { ascending: false }),
      supabase.from('designers').select(`
        *, reviews(*, author_id, planning_rating, execution_rating, designers(name)), firm_history:designer_firm_history(*)
      `).eq('market_id', 'sg').order('created_at', { ascending: false }),
    ])
    setFirms(firmsRes.data || [])
    setDesigners(designersRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (jumpId) {
      setTab('ids')
      setTimeout(() => {
        const el = designerRefs.current[jumpId]
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setJumpId(null)
      }, 150)
    }
  }, [jumpId, designers])

  const filteredFirms = firms.filter(f => {
    const q = search.toLowerCase()
    return (
      (!q || f.name.toLowerCase().includes(q)) &&
      (!verdictFilter || f.verdict === verdictFilter) &&
      (!tagFilter || f.tags?.includes(tagFilter))
    )
  })

  const filteredDesigners = designers.filter(d => {
    const q = search.toLowerCase()
    return (
      (!q || d.name.toLowerCase().includes(q)) &&
      (!verdictFilter || d.verdict === verdictFilter) &&
      (!tagFilter || d.tags?.includes(tagFilter))
    )
  })

  const getLinkedDesigners = (firmId) =>
    designers.filter(d => d.firm_history?.some(h => h.firm_id === firmId))

  const totalReviews = [...firms, ...designers].reduce((s, x) => s + (x.reviews?.length || 0), 0)
  const movedCount = designers.filter(d => d.firm_history?.length > 1).length
  const goodFirms = firms.filter(f => f.verdict === 'good').length
  const badFirms = firms.filter(f => f.verdict === 'bad').length
  const goodIds = designers.filter(d => d.verdict === 'good').length
  const badIds = designers.filter(d => d.verdict === 'bad').length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink-900 leading-tight">{t('home.tagline')}</h1>
        <p className="text-ink-500 mt-2">{t('home.sub')}</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { val: firms.length, label: `${t('stats.firms')} · `, extra: `${goodFirms} ${t('stats.rec')} / ${badFirms} ${t('stats.avoid')}` },
          { val: designers.length, label: `${t('stats.ids')} · `, extra: `${goodIds} ${t('stats.rec')} / ${badIds} ${t('stats.avoid')}` },
          { val: movedCount, label: t('stats.moved'), extra: '', color: 'text-amber-600' },
          { val: totalReviews, label: t('stats.reviews'), extra: '' },
        ].map((s, i) => (
          <div key={i} className="bg-ink-50 rounded-xl p-4">
            <div className={`text-2xl font-display font-medium ${s.color || 'text-ink-900'}`}>{s.val}</div>
            <div className="text-xs text-ink-500 mt-1">
              {s.label}
              {s.extra && <span className="text-ink-400">{s.extra}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('home.searchPlaceholder')}
          className="flex-1 min-w-48 text-sm border border-ink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-ink-400" />
        <select value={verdictFilter} onChange={e => setVerdictFilter(e.target.value)}
          className="text-sm border border-ink-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-ink-400">
          <option value="">{t('filters.allVerdicts')}</option>
          <option value="good">{t('filters.recommended')}</option>
          <option value="bad">{t('filters.avoid')}</option>
          <option value="mixed">{t('filters.mixed')}</option>
        </select>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          className="text-sm border border-ink-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-ink-400">
          <option value="">{t('filters.allIssues')}</option>
          {TAGS.map(tag => <option key={tag} value={tag}>{t(`tags.${tag}`)}</option>)}
        </select>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-scoop-500 text-white text-sm font-medium rounded-xl hover:bg-scoop-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit review
        </button>
      </div>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex border-b border-ink-100">
          {['firms', 'ids'].map(t_ => (
            <button key={t_} onClick={() => setTab(t_)}
              className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 ${
                tab === t_ ? 'border-ink-900 text-ink-900 font-medium' : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}>
              {t(`nav.${t_}`)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-ink-400">Loading…</div>
      ) : tab === 'firms' ? (
        filteredFirms.length === 0 ? (
          <div className="text-center py-20 text-ink-400">No firms found.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredFirms.map(firm => (
              <FirmCard key={firm.id} firm={firm}
                linkedDesigners={getLinkedDesigners(firm.id)}
                onJumpToDesigner={id => setJumpId(id)}
                srcFilter="all"
                onRefresh={fetchData}
              />
            ))}
          </div>
        )
      ) : (
        filteredDesigners.length === 0 ? (
          <div className="text-center py-20 text-ink-400">No designers found.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredDesigners.map(d => (
              <DesignerCard key={d.id} designer={d}
                srcFilter="all"
                scrollRef={el => { designerRefs.current[d.id] = el }}
                onRefresh={fetchData}
              />
            ))}
          </div>
        )
      )}

      {showForm && (
        <ReviewForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { fetchData(); setShowForm(false) }}
        />
      )}
    </div>
  )
}
