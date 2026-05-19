import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLang } from '../../hooks/useLang'
import { supabase } from '../../lib/supabase'

function InboxItem({ item, onAction }) {
  const { t } = useLang()
  const [notes, setNotes] = useState(item.admin_notes || '')

  const action = async (status) => {
    await supabase
      .from('admin_inbox')
      .update({ status, admin_notes: notes, processed_at: new Date().toISOString() })
      .eq('id', item.id)
    onAction()
  }

  return (
    <div className="bg-white border border-ink-100 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-medium text-ink-800">{item.title || 'Untitled'}</p>
          {item.source_label && (
            <span className="text-xs text-blue-600 mt-0.5 block">{item.source_label}</span>
          )}
        </div>
        <span className="text-xs text-ink-400 shrink-0">
          {new Date(item.created_at).toLocaleDateString('en-SG')}
        </span>
      </div>

      {item.snippet && (
        <p className="text-sm text-ink-600 leading-relaxed mb-3 bg-ink-50 rounded-lg p-3 italic">
          "{item.snippet}"
        </p>
      )}

      {item.source_url && (
        <a href={item.source_url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-3">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {item.source_url}
        </a>
      )}

      <div className="flex gap-2 text-xs mb-3">
        {item.suggested_firm_name && (
          <span className="bg-ink-50 text-ink-600 px-2 py-1 rounded">
            🏢 {item.suggested_firm_name}
          </span>
        )}
        {item.suggested_designer_name && (
          <span className="bg-ink-50 text-ink-600 px-2 py-1 rounded">
            👤 {item.suggested_designer_name}
          </span>
        )}
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder={t('admin.adminNotes')}
        className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 h-16 resize-none mb-3 focus:outline-none focus:border-ink-400"
      />

      <div className="flex gap-2">
        <button onClick={() => action('approved')}
          className="flex-1 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
          ✓ {t('admin.approve')}
        </button>
        <button onClick={() => action('flagged')}
          className="flex-1 py-2 bg-amber-100 text-amber-800 text-xs font-medium rounded-lg hover:bg-amber-200 transition-colors">
          🚩 {t('admin.flagForLater')}
        </button>
        <button onClick={() => action('discarded')}
          className="flex-1 py-2 bg-ink-100 text-ink-600 text-xs font-medium rounded-lg hover:bg-ink-200 transition-colors">
          ✕ {t('admin.discard')}
        </button>
      </div>
    </div>
  )
}

function AddToInboxForm({ onSuccess, firms, designers }) {
  const { t } = useLang()
  const [form, setForm] = useState({ source_url: '', title: '', snippet: '', suggested_firm_name: '', suggested_designer_name: '', admin_notes: '' })
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.source_url) return
    setSaving(true)
    const firm = firms.find(f => f.name.toLowerCase().includes(form.suggested_firm_name.toLowerCase()))
    const designer = designers.find(d => d.name.toLowerCase().includes(form.suggested_designer_name.toLowerCase()))
    await supabase.from('admin_inbox').insert({
      source_url: form.source_url,
      source_label: form.source_url.includes('reddit') ? 'Reddit' : form.source_url.includes('hardwarezone') ? 'HardwareZone' : 'External',
      title: form.title,
      snippet: form.snippet,
      suggested_firm_id: firm?.id,
      suggested_designer_id: designer?.id,
      suggested_firm_name: form.suggested_firm_name,
      suggested_designer_name: form.suggested_designer_name,
      admin_notes: form.admin_notes,
      market_id: 'sg',
    })
    setForm({ source_url: '', title: '', snippet: '', suggested_firm_name: '', suggested_designer_name: '', admin_notes: '' })
    setSaving(false)
    onSuccess()
  }

  return (
    <div className="bg-white border border-ink-200 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-medium text-ink-800 mb-3">➕ {t('admin.addToInbox')}</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-ink-500 block mb-1">{t('admin.sourceUrl')} *</label>
          <input type="text" value={form.source_url} onChange={set('source_url')}
            placeholder="https://reddit.com/r/…"
            className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400"
          />
        </div>
        <div>
          <label className="text-xs text-ink-500 block mb-1">Title</label>
          <input type="text" value={form.title} onChange={set('title')}
            placeholder="Post title"
            className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400"
          />
        </div>
        <div>
          <label className="text-xs text-ink-500 block mb-1">{t('admin.suggestedFirm')}</label>
          <input type="text" value={form.suggested_firm_name} onChange={set('suggested_firm_name')}
            placeholder="Firm name"
            className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400"
          />
        </div>
        <div>
          <label className="text-xs text-ink-500 block mb-1">{t('admin.suggestedDesigner')}</label>
          <input type="text" value={form.suggested_designer_name} onChange={set('suggested_designer_name')}
            placeholder="Designer name"
            className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400"
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs text-ink-500 block mb-1">{t('admin.snippet')}</label>
        <textarea value={form.snippet} onChange={set('snippet')}
          placeholder="Paste a relevant excerpt from the post…"
          className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:border-ink-400"
        />
      </div>
      <button onClick={handleSave} disabled={saving || !form.source_url}
        className="px-4 py-2 bg-ink-900 text-white text-xs font-medium rounded-lg hover:bg-ink-700 transition-colors disabled:opacity-50">
        {saving ? '…' : t('admin.save')}
      </button>
    </div>
  )
}

export default function AdminPage() {
  const { isAdmin, loading } = useAuth()
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState('inbox')
  const [items, setItems] = useState([])
  const [firms, setFirms] = useState([])
  const [designers, setDesigners] = useState([])
  const [fetching, setFetching] = useState(true)

  const fetchItems = async () => {
    setFetching(true)
    const status = activeTab === 'inbox' ? ['pending', 'flagged'] : activeTab === 'approved' ? ['approved'] : ['discarded']
    const { data } = await supabase
      .from('admin_inbox')
      .select('*')
      .in('status', status)
      .order('created_at', { ascending: false })
    setItems(data || [])
    setFetching(false)
  }

  useEffect(() => {
    supabase.from('firms').select('id, name').then(({ data }) => setFirms(data || []))
    supabase.from('designers').select('id, name').then(({ data }) => setDesigners(data || []))
  }, [])

  useEffect(() => { fetchItems() }, [activeTab])

  if (loading) return null
  if (!isAdmin()) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <p className="text-ink-600">{t('admin.accessDenied')}</p>
      </div>
    )
  }

  const pendingCount = items.filter(i => i.status === 'pending' || i.status === 'flagged').length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink-900">{t('admin.title')}</h1>
        {activeTab === 'inbox' && (
          <span className="text-sm text-ink-500">{items.length} {t('admin.pending')}</span>
        )}
      </div>

      <div className="flex border-b border-ink-100 mb-6">
        {['inbox', 'approved', 'discarded'].map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-ink-900 text-ink-900 font-medium'
                : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}>
            {t(`admin.${tab}`)}
          </button>
        ))}
      </div>

      {activeTab === 'inbox' && (
        <AddToInboxForm onSuccess={fetchItems} firms={firms} designers={designers} />
      )}

      {fetching ? (
        <div className="text-center py-12 text-ink-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-ink-400">{t('admin.noItems')}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(item => (
            <InboxItem key={item.id} item={item} onAction={fetchItems} />
          ))}
        </div>
      )}
    </div>
  )
}
