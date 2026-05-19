import { useLang } from '../../hooks/useLang'
import { VerdictBadge, TagBadge } from '../common/Badges'
import ReviewsSection from '../reviews/ReviewsSection'

export default function DesignerCard({ designer, srcFilter, scrollRef }) {
  const { t } = useLang()
  const hasMoved = designer.firm_history?.length > 1

  return (
    <div id={`designer-${designer.id}`} ref={scrollRef} className="bg-white border border-ink-100 rounded-2xl p-5 hover:border-ink-200 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg text-ink-900">{designer.name}</h3>
        <VerdictBadge verdict={designer.verdict} />
      </div>

      {designer.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {designer.tags.map(tag => <TagBadge key={tag} tagId={tag} />)}
        </div>
      )}

      {designer.firm_history?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-ink-100">
          <div className="flex items-center gap-2 text-xs text-ink-500 mb-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
            </svg>
            <span>{t('card.firmHistory')}</span>
            {hasMoved && (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full font-medium">
                {t('card.movedFirms')}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5 ml-1">
            {designer.firm_history.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full shrink-0 ${h.is_current ? 'bg-emerald-500' : 'bg-ink-200'}`} />
                <span className="font-medium text-ink-800">{h.firm_name}</span>
                <span className="text-ink-400 text-xs">{h.period}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  h.is_current
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-ink-50 text-ink-500'
                }`}>
                  {h.is_current ? t('card.current') : t('card.former')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ReviewsSection reviews={designer.reviews || []} srcFilter={srcFilter} />
    </div>
  )
}
