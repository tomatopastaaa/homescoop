import { useLang } from '../../hooks/useLang'
import { starsDisplay, sentimentClass, sourceLabelFromUrl } from '../../lib/constants'

export function VerdictBadge({ verdict }) {
  const { t } = useLang()
  const styles = {
    good:  'bg-emerald-50 text-emerald-800 border border-emerald-200',
    bad:   'bg-red-50 text-red-800 border border-red-200',
    mixed: 'bg-amber-50 text-amber-800 border border-amber-200',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[verdict] || styles.mixed}`}>
      {t(`verdict.${verdict}`)}
    </span>
  )
}

export function TagBadge({ tagId }) {
  const { t } = useLang()
  const label = t(`tags.${tagId}`)
  const isBad = ['delay', 'workmanship', 'comms', 'overcharge', 'ghost'].includes(tagId)
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
      isBad ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
    }`}>
      {label}
    </span>
  )
}

export function StarDisplay({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'text-lg' : 'text-sm'
  return (
    <span className={`${sz} text-amber-400 tracking-tight`}>
      {starsDisplay(rating)}
    </span>
  )
}

export function MetricItem({ label, value }) {
  const cls = sentimentClass(value)
  const textColor = cls === 'good' ? 'text-emerald-700' : cls === 'bad' ? 'text-red-700' : 'text-ink-600'
  return (
    <div className="bg-ink-50 rounded-lg px-3 py-2">
      <div className="text-xs text-ink-400 mb-0.5">{label}</div>
      <div className={`text-xs font-medium ${textColor}`}>{value}</div>
    </div>
  )
}

export function SourceChip({ type }) {
  const { t } = useLang()
  if (type === 'external') {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
        {t('card.externalSource')}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {t('card.community')}
    </span>
  )
}

export function NewAccountBadge() {
  const { t } = useLang()
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {t('card.newAccount')}
    </span>
  )
}

export function SourceLink({ url }) {
  if (!url) return null
  const label = sourceLabelFromUrl(url)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900 border border-ink-200 hover:border-ink-400 px-2.5 py-1 rounded-full transition-colors"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      {label}
    </a>
  )
}
