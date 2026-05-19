import { useState } from 'react'
import { useLang } from '../../hooks/useLang'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { StarDisplay, MetricItem, SourceChip, NewAccountBadge, SourceLink, TagBadge } from '../common/Badges'

function StageSection({ label, icon, fields }) {
  const visible = fields.filter(f => f.value)
  if (!visible.length) return null
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {visible.map(f => <MetricItem key={f.key} label={f.label} value={f.value} />)}
      </div>
    </div>
  )
}

function PhaseRating({ label, rating }) {
  if (!rating) return null
  const stars = Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆').join('')
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-400">{label}</span>
      <span className="text-sm text-amber-400">{stars}</span>
      <span className="text-xs text-ink-400">{rating}/5</span>
    </div>
  )
}

export default function ReviewBlock({ review }) {
  const { t } = useLang()
  const { user } = useAuth()
  const [helpful, setHelpful] = useState(review.helpful_count || 0)
  const [voted, setVoted] = useState(false)
  const [flagged, setFlagged] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const isNewAccount = () => {
    if (!review.account_created_at) return false
    const days = (Date.now() - new Date(review.account_created_at).getTime()) / 86400000
    return days < 7
  }

  const handleHelpful = async () => {
    if (!user || voted) return
    const { error } = await supabase.from('helpful_votes').insert({ review_id: review.id, user_id: user.id })
    if (!error) { setHelpful(h => h + 1); setVoted(true) }
  }

  const handleFlag = async () => {
    if (!user || flagged) return
    await supabase.from('flags').insert({ review_id: review.id, user_id: user.id, reason: 'user_flag' })
    setFlagged(true)
  }

  const planningFields = [
    { key: 'p_quote',  label: t('review.quoteDetail'),   value: review.p_quote  },
    { key: 'p_expect', label: t('review.expectations'),  value: review.p_expect },
    { key: 'p_comms',  label: t('review.designComms'),   value: review.p_comms  },
    { key: 'p_specs',  label: t('review.materialSpecs'), value: review.p_specs  },
  ]

  const executionFields = [
    { key: 'e_visits',  label: t('review.siteVisits'),     value: review.e_visits  },
    { key: 'e_pm',      label: t('review.siteManager'),    value: review.e_pm      },
    { key: 'e_issues',  label: t('review.changeRequests'), value: review.e_issues  },
    { key: 'e_vo',      label: t('review.variationOrders'),value: review.e_vo      },
    { key: 'e_cost',    label: t('review.finalCost'),      value: review.e_cost    },
    { key: 'e_work',    label: t('review.workmanship'),    value: review.e_work    },
    { key: 'e_defects', label: t('review.defects'),        value: review.e_defects },
    { key: 'e_vs',      label: t('review.vsPitch'),        value: review.e_vs      },
    { key: 'e_again',   label: t('review.engageAgain'),    value: review.e_again   },
  ]

  const contractorFields = [
    { key: 'c_source', label: t('review.howSourced'),    value: review.c_source },
    { key: 'c_exp',    label: t('review.contractorExp'), value: review.c_exp    },
  ]

  const hasDetailedContent = planningFields.some(f => f.value) ||
    executionFields.some(f => f.value) ||
    contractorFields.some(f => f.value) ||
    review.p_notes || review.e_notes || review.c_notes || review.c_name

  const maskName = (name) => {
    if (!name) return 'Anonymous'
    const parts = name.trim().split(' ')
    return parts.map(p => p.charAt(0).toUpperCase() + '.').join('')
  }

  const authorName = review.review_type === 'external'
    ? (review.external_author || 'Anonymous')
    : maskName(review.author_name)

  return (
    <div className="py-4 border-t border-ink-100 first:border-t-0 first:pt-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink-800">{authorName}</span>
          {review.firm_name && <span className="text-xs text-ink-400">· {review.firm_name}</span>}
          {review.review_type === 'community' && isNewAccount() && <NewAccountBadge />}
        </div>
        <span className="text-xs text-ink-400 shrink-0">
          {new Date(review.created_at).toLocaleDateString('en-SG', { month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Overall rating + review number */}
      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
        <StarDisplay rating={review.overall_rating} />
        {review.review_number && (
          <span className="text-xs font-mono bg-ink-100 text-ink-500 px-2 py-0.5 rounded">
            #{review.review_number}
          </span>
        )}
      </div>

      {/* Phase ratings — always visible */}
      {(review.planning_rating || review.execution_rating) && (
        <div className="mt-2 flex flex-wrap gap-3">
          <PhaseRating label="📋 Planning" rating={review.planning_rating} />
          <PhaseRating label="🔨 Execution" rating={review.execution_rating} />
        </div>
      )}

      {/* Free text notes — always visible as summary */}
      {review.e_notes && (
        <p className="mt-2 text-sm text-ink-600 leading-relaxed line-clamp-3">{review.e_notes}</p>
      )}
      {!review.e_notes && review.p_notes && (
        <p className="mt-2 text-sm text-ink-600 leading-relaxed line-clamp-3">{review.p_notes}</p>
      )}

      {/* Expand/collapse full review */}
      {hasDetailedContent && (
        <button
          onClick={() => setExpanded(o => !o)}
          className="mt-2 text-xs text-scoop-600 hover:text-scoop-800 flex items-center gap-1 font-medium transition-colors"
        >
          {expanded ? 'Hide full review ↑' : 'View full review ↓'}
        </button>
      )}

      {/* Full review detail — expanded only */}
      {expanded && (
        <div className="mt-3 bg-ink-50 rounded-xl p-3">
          <StageSection label={t('review.planning')} icon="📋" fields={planningFields} />
          {review.p_notes && (
            <p className="mt-2 text-xs text-ink-500 italic leading-relaxed">{review.p_notes}</p>
          )}
          <StageSection label={t('review.execution')} icon="🔨" fields={executionFields} />
          {review.e_notes && (
            <p className="mt-2 text-xs text-ink-500 italic leading-relaxed">{review.e_notes}</p>
          )}
          <StageSection label={t('review.contractor')} icon="🛠" fields={contractorFields} />
          {review.c_name && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-600 border border-ink-200 px-2.5 py-1 rounded-full">
              🔧 {review.c_name}
              {review.c_rating && (
                <span className="text-amber-400">{Array(review.c_rating).fill('★').join('')}</span>
              )}
            </div>
          )}
          {review.c_notes && (
            <p className="mt-2 text-xs text-ink-500 italic leading-relaxed">{review.c_notes}</p>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <SourceLink url={review.source_url} />
        <button
          onClick={handleHelpful}
          disabled={!user || voted}
          className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors ${
            voted
              ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
              : 'border-ink-200 text-ink-500 hover:border-ink-400 hover:text-ink-700'
          } disabled:opacity-40`}
        >
          👍 {t('card.helpful')} · {helpful} {t('card.foundHelpful')}
        </button>
        {!flagged ? (
          <button onClick={handleFlag} disabled={!user}
            className="text-xs text-ink-400 hover:text-red-500 transition-colors disabled:opacity-40">
            {t('card.flag')}
          </button>
        ) : (
          <span className="text-xs text-red-400">Flagged</span>
        )}
      </div>
    </div>
  )
}
