export const TAGS = [
  { id: 'delay',       type: 'bad'  },
  { id: 'workmanship', type: 'bad'  },
  { id: 'comms',       type: 'bad'  },
  { id: 'overcharge',  type: 'bad'  },
  { id: 'ghost',       type: 'bad'  },
  { id: 'quality',     type: 'good' },
  { id: 'responsive',  type: 'good' },
  { id: 'transparent', type: 'good' },
  { id: 'ontime',      type: 'good' },
]

export const SENTIMENT_GOOD = [
  'Itemised line by line', 'Accurate and realistic', 'Proactive and clear',
  'Yes, specific brands & grades', 'Multiple times a week', 'ID personally',
  'Resolved promptly', 'None', 'Within 5%', 'Excellent', 'Minor, fixed quickly',
  'Better than promised', 'Definitely yes', "ID's regular trusted contractor",
  'Yes, clearly experienced',
]

export const SENTIMENT_BAD = [
  'No written quote', 'Oversold significantly', 'Poor', 'Not stated at all',
  'Never', 'Nobody clear', 'Ignored', 'Frequent and large', '30%+ over',
  'Major issues', 'Much worse — bait & switch', 'Definitely not',
  'Appeared to shop around', 'No, felt ad hoc',
]

export const PLANNING_OPTIONS = {
  p_quote: ['Itemised line by line', 'Broad categories only', 'Very vague', 'No written quote'],
  p_expect: ['Accurate and realistic', 'Somewhat realistic', 'Oversold significantly'],
  p_comms: ['Proactive and clear', 'Responsive when chased', 'Hard to reach', 'Poor'],
  p_specs: ['Yes, specific brands & grades', 'Vague descriptions', 'Not stated at all'],
}

export const EXECUTION_OPTIONS = {
  e_visits: ['Multiple times a week', 'Weekly', 'A few times total', 'Never'],
  e_pm: ['ID personally', 'Dedicated PM', 'Contractor directly', 'Nobody clear'],
  e_issues: ['Resolved promptly', 'Slow but resolved', 'Pushed back on client', 'Ignored'],
  e_vo: ['None', '1–2 minor ones', 'Several', 'Frequent and large'],
  e_cost: ['Within 5%', '5–15% over', '15–30% over', '30%+ over'],
  e_work: ['Excellent', 'Good', 'Acceptable', 'Poor'],
  e_defects: ['None', 'Minor, fixed quickly', 'Minor but dragged', 'Major issues'],
  e_vs: ['Better than promised', 'About the same', 'Worse than promised', 'Much worse — bait & switch'],
  e_again: ['Definitely yes', 'Probably yes', 'Probably not', 'Definitely not'],
}

export const CONTRACTOR_OPTIONS = {
  c_source: ["ID's regular trusted contractor", 'Appeared to shop around', 'Unknown'],
  c_exp: ['Yes, clearly experienced', 'Mixed', 'No, felt ad hoc'],
}

export function inferTags(formData) {
  const tags = new Set()
  const { e_visits, e_vo, p_comms, e_work, e_vs, e_again, p_quote, overall_rating } = formData
  if (['Never', 'A few times total'].includes(e_visits)) tags.add('ghost')
  if (['Frequent and large', 'Several'].includes(e_vo)) tags.add('overcharge')
  if (['Hard to reach', 'Poor'].includes(p_comms)) tags.add('comms')
  if (['Poor'].includes(e_work)) tags.add('workmanship')
  if (['Much worse — bait & switch', 'Worse than promised'].includes(e_vs)) tags.add('delay')
  if (overall_rating >= 4 && ['Excellent', 'Good'].includes(e_work)) tags.add('quality')
  if (['Proactive and clear'].includes(p_comms)) tags.add('responsive')
  if (['Itemised line by line'].includes(p_quote)) tags.add('transparent')
  if (e_again === 'Definitely yes') tags.add('ontime')
  return [...tags]
}

export function sentimentClass(val) {
  if (!val) return ''
  if (SENTIMENT_GOOD.includes(val)) return 'good'
  if (SENTIMENT_BAD.includes(val)) return 'bad'
  return 'neutral'
}

export function starsDisplay(rating) {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? '★' : '☆').join('')
}

export function verdictFromRating(avg) {
  if (avg >= 4) return 'good'
  if (avg <= 2) return 'bad'
  return 'mixed'
}

export function sourceLabelFromUrl(url) {
  if (!url) return null
  if (url.includes('reddit')) return 'Reddit thread'
  if (url.includes('hardwarezone')) return 'HardwareZone'
  if (url.includes('renotalk')) return 'Renotalk'
  if (url.includes('99.co')) return '99.co'
  if (url.includes('propertyguru')) return 'PropertyGuru'
  return 'Source link'
}
