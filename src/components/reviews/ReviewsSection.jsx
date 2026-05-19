import { useState } from 'react'
import { useLang } from '../../hooks/useLang'
import ReviewBlock from './ReviewBlock'

export default function ReviewsSection({ reviews = [], srcFilter, onRefresh, firmName, designerName }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)

  const filtered = srcFilter === 'all'
    ? reviews
    : reviews.filter(r => r.review_type === srcFilter)

  return (
    <div className="border-t border-ink-100 mt-3 pt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-ink-700">{t('card.reviews')}</span>
          <span className="text-xs text-ink-400">
            {filtered.length} review{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-ink-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-ink-400 italic py-2">{t('card.noReviews')}</p>
          ) : (
            filtered.map(r => (
              <ReviewBlock
                key={r.id}
                review={{ ...r, firm_name: firmName, designer_name: designerName }}
                onRefresh={onRefresh}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
