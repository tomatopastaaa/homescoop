import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLang } from '../../hooks/useLang'
import { supabase } from '../../lib/supabase'

function InboxItem({ item, onAction }) {
  const [notes, setNotes] = useState(item.admin_notes || '')
  const action = async (status) => {
    await supabase.from('admin_inbox').update({ status, admin_notes: notes, processed_at: new Date().toISOString() }).eq('id', item.id)
    onAction()
  }
  return (
    <div className="bg-white border border-ink-100 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-medium text-ink-800">{item.title || 'Untitled'}</p>
          {item.source_label && <span className="text-xs text-blue-600 mt-0.5 block">{item.source_label}</span>}
        </div>
        <span className="text-xs text-ink-400 shrink-0">{new Date(item.created_at).toLocaleDateString('en-SG')}</span>
      </div>
      {item.snippet && <p className="text-sm text-ink-600 leading-relaxed mb-3 bg-ink-50 rounded-lg p-3 italic">"{item.snippet}"</p>}
      {item.source_url && (
        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-3">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          {item.source_url}
        </a>
      )}
      <div className="flex gap-2 text-xs mb-3">
        {item.suggested_firm_name && <span className="bg-ink-50 text-ink-600 px-2 py-1 rounded">🏢 {item.suggested_firm_name}</span>}
        {item.suggested_designer_name && <span className="bg-ink-50 text-ink-600 px-2 py-1 rounded">👤 {item.suggested_designer_name}</span>}
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Admin notes…"
        className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 h-16 resize-none mb-3 focus:outline-none focus:border-ink-400" />
      <div className="flex gap-2">
        <button onClick={() => action('approved')} className="flex-1 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700">✓ Approve</button>
        <button onClick={() => action('flagged')} className="flex-1 py-2 bg-amber-100 text-amber-800 text-xs font-medium rounded-lg hover:bg-amber-200">🚩 Flag</button>
        <button onClick={() => action('discarded')} className="flex-1 py-2 bg-ink-100 text-ink-600 text-xs font-medium rounded-lg hover:bg-ink-200">✕ Discard</button>
      </div>
    </div>
  )
}

function AddToInboxForm({ onSuccess, firms, designers }) {
  const [form, setForm] = useState({ source_url: '', title: '', snippet: '', suggested_firm_name: '', suggested_designer_name: '' })
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const handleSave = async () => {
    if (!form.source_url) return
    setSaving(true)
    const firm = firms.find(f => f.name.toLowerCase().includes(form.suggested_firm_name.toLowerCase()))
    const designer = designers.find(d => d.name.toLowerCase().includes(form.suggested_designer_name.toLowerCase()))
    await supabase.from('admin_inbox').insert({
      source_url: form.source_url,
      source_label: form.source_url.includes('reddit') ? 'Reddit' : form.source_url.includes('hardwarezone') ? 'HardwareZone' : form.source_url.includes('renotalk') ? 'Renotalk' : 'External',
      title: form.title, snippet: form.snippet,
      suggested_firm_id: firm?.id, suggested_designer_id: designer?.id,
      suggested_firm_name: form.suggested_firm_name, suggested_designer_name: form.suggested_designer_name,
      market_id: 'sg',
    })
    setForm({ source_url: '', title: '', snippet: '', suggested_firm_name: '', suggested_designer_name: '' })
    setSaving(false)
    onSuccess()
  }
  return (
    <div className="bg-white border border-ink-200 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-medium text-ink-800 mb-3">➕ Add to inbox</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div><label className="text-xs text-ink-500 block mb-1">Source URL *</label>
          <input type="text" value={form.source_url} onChange={set('source_url')} placeholder="https://reddit.com/r/…"
            className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400" /></div>
        <div><label className="text-xs text-ink-500 block mb-1">Title</label>
          <input type="text" value={form.title} onChange={set('title')} placeholder="Post title"
            className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400" /></div>
        <div><label className="text-xs text-ink-500 block mb-1">Suggested firm</label>
          <input type="text" value={form.suggested_firm_name} onChange={set('suggested_firm_name')} placeholder="Firm name"
            className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400" /></div>
        <div><label className="text-xs text-ink-500 block mb-1">Suggested designer</label>
          <input type="text" value={form.suggested_designer_name} onChange={set('suggested_designer_name')} placeholder="Designer name"
            className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400" /></div>
      </div>
      <div className="mb-3"><label className="text-xs text-ink-500 block mb-1">Snippet</label>
        <textarea value={form.snippet} onChange={set('snippet')} placeholder="Paste a relevant excerpt…"
          className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:border-ink-400" /></div>
      <button onClick={handleSave} disabled={saving || !form.source_url}
        className="px-4 py-2 bg-ink-900 text-white text-xs font-medium rounded-lg hover:bg-ink-700 disabled:opacity-50">
        {saving ? '…' : 'Save to inbox'}
      </button>
    </div>
  )
}

function ReviewsManager() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [confirmId, setConfirmId] = useState(null)

  const fetchReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('id, overall_rating, verdict, review_type, status, author_name, author_email, created_at, p_notes, e_notes, c_notes, firms(name), designers(name)')
      .order('created_at', { ascending: false })
    if (error) console.error('fetch error:', error)
    setReviews(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [])

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', id)
    if (error) { console.error('update error:', error); alert('Error: ' + error.message); return }
    setConfirmId(null)
    fetchReviews()
  }

  const deleteReview = async (id) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) { console.error('delete error:', error); alert('Error: ' + error.message); return }
    setConfirmId(null)
    fetchReviews()
  }

  const stars = (n) => Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆').join('')

  const pendingCount = reviews.filter(r => r.status === 'pending').length

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.author_name?.toLowerCase().includes(q) || r.author_email?.toLowerCase().includes(q) || r.firms?.name?.toLowerCase().includes(q) || r.designers?.name?.toLowerCase().includes(q)
    return matchSearch && r.status === activeTab
  })

  // Running number offset per tab
  const tabReviews = reviews.filter(r => r.status === activeTab)

  const TABS = [
    { id: 'pending',  label: `⏳ Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { id: 'approved', label: '✓ Approved' },
    { id: 'rejected', label: '✕ Rejected' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex border border-ink-200 rounded-lg overflow-hidden">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${activeTab === t.id ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-50'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by author, firm or designer…"
          className="flex-1 min-w-48 text-sm border border-ink-200 rounded-xl px-4 py-2 focus:outline-none focus:border-ink-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-ink-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-ink-400">
          {activeTab === 'pending' ? '✅ All caught up — no pending reviews.' : 'Nothing here.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r, idx) => {
            const globalNum = tabReviews.findIndex(x => x.id === r.id) + 1
            return (
              <div key={r.id} className={`bg-white border rounded-xl p-4 ${activeTab === 'pending' ? 'border-amber-200' : 'border-ink-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono bg-ink-100 text-ink-500 px-2 py-0.5 rounded">
                        #{globalNum}
                      </span>
                      <span className="text-sm font-medium text-ink-800">
                        {r.firms?.name || r.designers?.name || 'Unknown entity'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.review_type === 'external' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {r.review_type}
                      </span>
                    </div>
                    <div className="text-xs text-ink-400 mt-1">
                      by {r.author_name || 'Unknown'} · {r.author_email} · {new Date(r.created_at).toLocaleDateString('en-SG')}
                    </div>
                    <div className="text-xs font-mono text-ink-300 mt-0.5">ID: {r.id}</div>
                    <div className="text-amber-400 text-sm mt-1">{stars(r.overall_rating)}</div>
                    {(r.p_notes || r.e_notes || r.c_notes) && (
                      <p className="text-xs text-ink-500 mt-1 italic line-clamp-2">{r.p_notes || r.e_notes || r.c_notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    {activeTab === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(r.id, 'approved')}
                          className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 whitespace-nowrap font-medium">
                          ✓ Approve
                        </button>
                        <button onClick={() => setConfirmId(r.id + '_reject')}
                          className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 whitespace-nowrap">
                          Reject
                        </button>
                      </>
                    )}
                    {activeTab === 'approved' && (
                      <button onClick={() => setConfirmId(r.id + '_reject')}
                        className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 whitespace-nowrap">
                        Reject
                      </button>
                    )}
                    {activeTab === 'rejected' && (
                      <button onClick={() => updateStatus(r.id, 'approved')}
                        className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 whitespace-nowrap">
                        Approve
                      </button>
                    )}
                    <button onClick={() => setConfirmId(r.id + '_delete')}
                      className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 whitespace-nowrap">
                      Delete
                    </button>
                  </div>
                </div>

                {confirmId === r.id + '_reject' && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 mb-2">Reject review #{globalNum}? It will be hidden from the site and moved to the Rejected tab. You can approve it later.</p>
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(r.id, 'rejected')} className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Yes, reject</button>
                      <button onClick={() => setConfirmId(null)} className="text-xs px-3 py-1.5 bg-white border border-ink-200 rounded-lg text-ink-600">Cancel</button>
                    </div>
                  </div>
                )}

                {confirmId === r.id + '_delete' && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-800 mb-2 font-medium">⚠️ Permanently delete review #{globalNum}? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button onClick={() => deleteReview(r.id)} className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, delete permanently</button>
                      <button onClick={() => setConfirmId(null)} className="text-xs px-3 py-1.5 bg-white border border-ink-200 rounded-lg text-ink-600">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const { isAdmin, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('reviews')
  const [items, setItems] = useState([])
  const [firms, setFirms] = useState([])
  const [designers, setDesigners] = useState([])
  const [fetching, setFetching] = useState(true)

  const fetchItems = async () => {
    setFetching(true)
    const statusMap = { inbox: ['pending', 'flagged'], approved: ['approved'], discarded: ['discarded'] }
    if (!statusMap[activeTab]) { setFetching(false); return }
    const { data } = await supabase.from('admin_inbox').select('*').in('status', statusMap[activeTab]).order('created_at', { ascending: false })
    setItems(data || [])
    setFetching(false)
  }

  useEffect(() => {
    supabase.from('firms').select('id, name').then(({ data }) => setFirms(data || []))
    supabase.from('designers').select('id, name').then(({ data }) => setDesigners(data || []))
  }, [])

  useEffect(() => { if (activeTab !== 'reviews') fetchItems() }, [activeTab])

  if (loading) return null
  if (!isAdmin()) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <p className="text-ink-600">Access denied. Admin only.</p>
      </div>
    )
  }

  const TABS = [
    { id: 'reviews',  label: '📝 Review queue' },
    { id: 'inbox',    label: '📥 External inbox' },
    { id: 'approved', label: '✓ Inbox approved' },
    { id: 'discarded',label: '✕ Inbox discarded' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl text-ink-900 mb-6">Admin — Moderation</h1>

      <div className="flex border-b border-ink-100 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-ink-900 text-ink-900 font-medium' : 'border-transparent text-ink-400 hover:text-ink-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'reviews' ? <ReviewsManager /> : (
        <>
          {activeTab === 'inbox' && <AddToInboxForm onSuccess={fetchItems} firms={firms} designers={designers} />}
          {fetching ? (
            <div className="text-center py-12 text-ink-400">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-ink-400">Nothing here.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(item => <InboxItem key={item.id} item={item} onAction={fetchItems} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
