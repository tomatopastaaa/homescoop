import { useLang } from '../../hooks/useLang'
import { VerdictBadge, TagBadge, StarDisplay } from '../common/Badges'
import ReviewsSection from '../reviews/ReviewsSection'

export default function FirmCard({ firm, linkedDesigners = [], onJumpToDesigner, srcFilter, onRefresh }) {
  const { t } = useLang()
  const good = linkedDesigners.filter(d => d.verdict === 'good').length
  const bad = linkedDesigners.filter(d => d.verdict === 'bad').length
  const mixed = linkedDesigners.filter(d => d.verdict === 'mixed').length

  return (
    <div className="bg-white border border-ink-100 rounded-2xl p-5 hover:border-ink-200 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink-900">{firm.name}</h3>
          {firm.subtitle && <p className="text-sm text-ink-400 mt-0.5">{firm.subtitle}</p>}
        </div>
        <VerdictBadge verdict={firm.verdict} />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <StarDisplay rating={firm.rating} />
        <span className="text-sm text-ink-400">
          {Number(firm.rating).toFixed(1)} · {firm.review_count} {t('card.reviews').toLowerCase()}
        </span>
      </div>

      {firm.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {firm.tags.map(tag => <TagBadge key={tag} tagId={tag} />)}
        </div>
      )}

      {linkedDesigners.length > 0 && (
        <div className="mt-4 pt-3 border-t border-ink-100">
          <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{t('card.idsAtFirm')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs mb-2">
            {good > 0 && <span className="text-emerald-700 font-medium">{good} {t('stats.rec')}</span>}
            {bad > 0 && <span className="text-red-700 font-medium">{bad} {t('stats.avoid')}</span>}
            {mixed > 0 && <span className="text-amber-700 font-medium">{mixed} mixed</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {linkedDesigners.map(d => (
              <button key={d.id} onClick={() => onJumpToDesigner(d.id)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  d.verdict === 'good' ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  : d.verdict === 'bad' ? 'border-red-300 text-red-700 hover:bg-red-50'
                  : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                }`}>
                {d.name} {d.verdict === 'good' ? '✓' : d.verdict === 'bad' ? '✗' : '~'}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-400 mt-1.5">{t('card.clickToView')}</p>
        </div>
      )}

      <ReviewsSection reviews={firm.reviews || []} srcFilter={srcFilter} onRefresh={onRefresh} />
    </div>
  )
}
