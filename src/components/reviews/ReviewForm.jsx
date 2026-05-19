import { useState } from 'react'
import { useLang } from '../../hooks/useLang'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import {
  PLANNING_OPTIONS, EXECUTION_OPTIONS, CONTRACTOR_OPTIONS,
  inferTags, verdictFromRating, sourceLabelFromUrl
} from '../../lib/constants'

function Select({ id, options, value, onChange, placeholder = 'Select…' }) {
  return (
    <select id={id} value={value} onChange={e => onChange(e.target.value)}
      className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 bg-white text-ink-800 focus:outline-none focus:border-ink-400">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Stars({ value, onChange, size = 'lg' }) {
  const sz = size === 'sm' ? 'text-xl' : 'text-2xl'
  return (
    <div className="flex gap-1 mt-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`${sz} transition-colors ${n <= value ? 'text-amber-400' : 'text-ink-200'} hover:text-amber-400`}>
          ★
        </button>
      ))}
    </div>
  )
}

function CollapsibleSection({ icon, label, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const colorMap = {
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800'   },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
    gray:   { bg: 'bg-ink-50',    border: 'border-ink-200',    text: 'text-ink-700'    },
  }
  const c = colorMap[color] || colorMap.gray
  return (
    <div className={`rounded-xl border ${c.border} overflow-hidden mt-4`}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 ${c.bg} ${c.text} font-medium text-sm`}>
        <div className="flex items-center gap-2"><span>{icon}</span><span>{label}</span></div>
        <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 py-4 bg-white">{children}</div>}
    </div>
  )
}

function Field({ label, optional, children }) {
  const { t } = useLang()
  return (
    <div className="mb-3">
      <label className="block text-xs text-ink-500 mb-1">
        {label} {optional && <span className="text-ink-400">{t('form.optional')}</span>}
      </label>
      {children}
    </div>
  )
}

function formFromReview(r) {
  if (!r) return {
    firm_name: '', designer_name: '', overall_rating: 0, verdict: 'mixed',
    planning_rating: 0, p_quote: '', p_expect: '', p_comms: '', p_specs: '', p_notes: '',
    execution_rating: 0, e_visits: '', e_pm: '', e_issues: '', e_vo: '', e_cost: '',
    e_work: '', e_defects: '', e_vs: '', e_again: '', e_notes: '',
    c_name: '', c_source: '', c_rating: 0, c_exp: '', c_notes: '', source_url: '',
  }
  return {
    firm_name: r.firms?.name || r.firm_name || '',
    designer_name: r.designers?.name || r.designer_name || '',
    overall_rating: r.overall_rating || 0,
    verdict: r.verdict || 'mixed',
    planning_rating: r.planning_rating || 0,
    p_quote: r.p_quote || '', p_expect: r.p_expect || '',
    p_comms: r.p_comms || '', p_specs: r.p_specs || '', p_notes: r.p_notes || '',
    execution_rating: r.execution_rating || 0,
    e_visits: r.e_visits || '', e_pm: r.e_pm || '', e_issues: r.e_issues || '',
    e_vo: r.e_vo || '', e_cost: r.e_cost || '', e_work: r.e_work || '',
    e_defects: r.e_defects || '', e_vs: r.e_vs || '', e_again: r.e_again || '', e_notes: r.e_notes || '',
    c_name: r.c_name || '', c_source: r.c_source || '',
    c_rating: r.c_rating || 0, c_exp: r.c_exp || '', c_notes: r.c_notes || '',
    source_url: r.source_url || '',
  }
}

export default function ReviewForm({ onClose, onSuccess, existingReview }) {
  const { t } = useLang()
  const { user, signInWithGoogle } = useAuth()
  const isEditing = !!existingReview
  const [form, setForm] = useState(() => formFromReview(existingReview))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }))
  const setRaw = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!user) { setError(t('form.loginRequired')); return }
    if (!form.firm_name || !form.overall_rating) { setError(t('form.fillRequired')); return }
    setSubmitting(true)
    setError('')
    try {
      const tags = inferTags({ ...form, overall_rating: form.overall_rating })
      const verdict = verdictFromRating(form.overall_rating)

      const reviewData = {
        overall_rating: form.overall_rating,
        verdict,
        tags,
        planning_rating: form.planning_rating || null,
        p_quote: form.p_quote, p_expect: form.p_expect,
        p_comms: form.p_comms, p_specs: form.p_specs, p_notes: form.p_notes,
        execution_rating: form.execution_rating || null,
        e_visits: form.e_visits, e_pm: form.e_pm, e_issues: form.e_issues,
        e_vo: form.e_vo, e_cost: form.e_cost, e_work: form.e_work,
        e_defects: form.e_defects, e_vs: form.e_vs, e_again: form.e_again, e_notes: form.e_notes,
        c_name: form.c_name, c_source: form.c_source,
        c_rating: form.c_rating || null, c_exp: form.c_exp, c_notes: form.c_notes,
        source_url: form.source_url,
        source_label: sourceLabelFromUrl(form.source_url),
        status: 'pending',
      }

      if (isEditing) {
        const { error: updErr } = await supabase
          .from('reviews').update(reviewData).eq('id', existingReview.id)
        if (updErr) throw updErr
      } else {
        let firm_id = null, designer_id = null

        const { data: firmData } = await supabase
          .from('firms').select('id').ilike('name', form.firm_name.trim()).maybeSingle()
        if (firmData) {
          firm_id = firmData.id
        } else {
          const { data: newFirm } = await supabase
            .from('firms').insert({ name: form.firm_name.trim(), market_id: 'sg', verdict, tags })
            .select('id').single()
          firm_id = newFirm?.id
        }

        if (form.designer_name.trim()) {
          const { data: designerData } = await supabase
            .from('designers').select('id').ilike('name', form.designer_name.trim()).maybeSingle()
          if (designerData) {
            designer_id = designerData.id
          } else {
            const { data: newDes } = await supabase
              .from('designers').insert({ name: form.designer_name.trim(), market_id: 'sg', verdict, tags })
              .select('id').single()
            designer_id = newDes?.id
            if (firm_id && designer_id) {
              await supabase.from('designer_firm_history').insert({
                designer_id, firm_id, firm_name: form.firm_name.trim(),
                period: `${new Date().getFullYear()} – present`, is_current: true,
              })
            }
          }
        }

        const { error: revError } = await supabase.from('reviews').insert({
          ...reviewData,
          firm_id, designer_id,
          author_id: user.id,
          author_name: user.user_metadata?.full_name || 'Community member',
          author_email: user.email,
          account_created_at: user.created_at,
          review_type: 'community',
        })

        if (revError?.code === '23505') { setError(t('form.alreadyReviewed')); setSubmitting(false); return }
        if (revError) throw revError
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    }
    setSubmitting(false)
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-20 px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
          <div className="text-3xl mb-3">🔑</div>
          <h2 className="font-display text-xl text-ink-900 mb-2">{t('form.loginRequired')}</h2>
          <button onClick={signInWithGoogle}
            className="mt-4 w-full bg-ink-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-ink-700 transition-colors">
            {t('nav.signIn')}
          </button>
          <button onClick={onClose} className="mt-3 text-sm text-ink-400 hover:text-ink-600">{t('form.cancel')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-6 px-4 pb-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-ink-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-xl text-ink-900">
              {isEditing ? '✏️ Edit your review' : t('form.title')}
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              {isEditing ? 'Your updated review will be re-submitted for approval.' : t('form.sub')}
            </p>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <CollapsibleSection icon="🏢" label="Basic info" color="gray" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`${t('form.firmName')} *`}>
                <input type="text" value={form.firm_name} onChange={setRaw('firm_name')}
                  placeholder={t('form.firmPlaceholder')} disabled={isEditing}
                  className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400 disabled:bg-ink-50 disabled:text-ink-400" />
              </Field>
              <Field label={t('form.designerName')} optional>
                <input type="text" value={form.designer_name} onChange={setRaw('designer_name')}
                  placeholder={t('form.designerPlaceholder')} disabled={isEditing}
                  className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400 disabled:bg-ink-50 disabled:text-ink-400" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`${t('form.overallRating')} *`}>
                <Stars value={form.overall_rating} onChange={set('overall_rating')} />
              </Field>
              <Field label={t('form.verdict')}>
                <Select id="verdict" value={form.verdict} onChange={set('verdict')} options={['good','mixed','bad']} />
              </Field>
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon="📋" label="Planning stage" color="blue" defaultOpen={isEditing}>
            <Field label="Planning rating" optional>
              <Stars value={form.planning_rating} onChange={set('planning_rating')} size="sm" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('review.quoteDetail')} optional>
                <Select id="p_quote" value={form.p_quote} onChange={set('p_quote')} options={PLANNING_OPTIONS.p_quote} />
              </Field>
              <Field label={t('review.expectations')} optional>
                <Select id="p_expect" value={form.p_expect} onChange={set('p_expect')} options={PLANNING_OPTIONS.p_expect} />
              </Field>
              <Field label={t('review.designComms')} optional>
                <Select id="p_comms" value={form.p_comms} onChange={set('p_comms')} options={PLANNING_OPTIONS.p_comms} />
              </Field>
              <Field label={t('review.materialSpecs')} optional>
                <Select id="p_specs" value={form.p_specs} onChange={set('p_specs')} options={PLANNING_OPTIONS.p_specs} />
              </Field>
            </div>
            <Field label={t('form.otherThoughts')} optional>
              <textarea value={form.p_notes} onChange={setRaw('p_notes')}
                placeholder={t('form.planningPlaceholder')}
                className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:border-ink-400" />
            </Field>
          </CollapsibleSection>

          <CollapsibleSection icon="🔨" label="Execution stage" color="orange" defaultOpen={isEditing}>
            <Field label="Execution rating" optional>
              <Stars value={form.execution_rating} onChange={set('execution_rating')} size="sm" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('review.siteVisits')} optional>
                <Select id="e_visits" value={form.e_visits} onChange={set('e_visits')} options={EXECUTION_OPTIONS.e_visits} />
              </Field>
              <Field label={t('review.siteManager')} optional>
                <Select id="e_pm" value={form.e_pm} onChange={set('e_pm')} options={EXECUTION_OPTIONS.e_pm} />
              </Field>
              <Field label={t('review.changeRequests')} optional>
                <Select id="e_issues" value={form.e_issues} onChange={set('e_issues')} options={EXECUTION_OPTIONS.e_issues} />
              </Field>
              <Field label={t('review.variationOrders')} optional>
                <Select id="e_vo" value={form.e_vo} onChange={set('e_vo')} options={EXECUTION_OPTIONS.e_vo} />
              </Field>
              <Field label={t('review.finalCost')} optional>
                <Select id="e_cost" value={form.e_cost} onChange={set('e_cost')} options={EXECUTION_OPTIONS.e_cost} />
              </Field>
              <Field label={t('review.workmanship')} optional>
                <Select id="e_work" value={form.e_work} onChange={set('e_work')} options={EXECUTION_OPTIONS.e_work} />
              </Field>
              <Field label={t('review.defects')} optional>
                <Select id="e_defects" value={form.e_defects} onChange={set('e_defects')} options={EXECUTION_OPTIONS.e_defects} />
              </Field>
              <Field label={t('review.vsPitch')} optional>
                <Select id="e_vs" value={form.e_vs} onChange={set('e_vs')} options={EXECUTION_OPTIONS.e_vs} />
              </Field>
            </div>
            <Field label={t('review.engageAgain')} optional>
              <Select id="e_again" value={form.e_again} onChange={set('e_again')} options={EXECUTION_OPTIONS.e_again} />
            </Field>
            <Field label={t('form.otherThoughts')} optional>
              <textarea value={form.e_notes} onChange={setRaw('e_notes')}
                placeholder={t('form.executionPlaceholder')}
                className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:border-ink-400" />
            </Field>
          </CollapsibleSection>

          <CollapsibleSection icon="🛠" label="Contractor" color="purple" defaultOpen={isEditing}>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('form.contractorName')} optional>
                <input type="text" value={form.c_name} onChange={setRaw('c_name')}
                  placeholder={t('form.contractorNamePlaceholder')}
                  className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400" />
              </Field>
              <Field label={t('review.howSourced')} optional>
                <Select id="c_source" value={form.c_source} onChange={set('c_source')} options={CONTRACTOR_OPTIONS.c_source} />
              </Field>
              <Field label={t('form.contractorRating')} optional>
                <Stars value={form.c_rating} onChange={set('c_rating')} size="sm" />
              </Field>
              <Field label={t('review.contractorExp')} optional>
                <Select id="c_exp" value={form.c_exp} onChange={set('c_exp')} options={CONTRACTOR_OPTIONS.c_exp} />
              </Field>
            </div>
            <Field label={t('form.otherThoughts')} optional>
              <textarea value={form.c_notes} onChange={setRaw('c_notes')}
                placeholder={t('form.contractorPlaceholder')}
                className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 h-16 resize-none focus:outline-none focus:border-ink-400" />
            </Field>
          </CollapsibleSection>

          <CollapsibleSection icon="🔗" label="Source link" color="gray" defaultOpen={isEditing && !!form.source_url}>
            <Field label={t('form.sourceLink')} optional>
              <input type="text" value={form.source_url} onChange={setRaw('source_url')}
                placeholder={t('form.sourcePlaceholder')}
                className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ink-400" />
              <p className="text-xs text-ink-400 mt-1">{t('form.sourceHint')}</p>
            </Field>
          </CollapsibleSection>

          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex gap-3 mt-5 pb-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-ink-200 rounded-xl text-sm text-ink-600 hover:bg-ink-50 transition-colors">
              {t('form.cancel')}
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 bg-ink-900 text-white rounded-xl text-sm font-medium hover:bg-ink-700 transition-colors disabled:opacity-50">
              {submitting ? '…' : isEditing ? 'Save changes' : t('form.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
