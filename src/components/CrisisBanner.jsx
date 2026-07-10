import { useState } from 'react'

const CRISIS_RESOURCES = [
  {
    name: 'National Suicide Prevention Lifeline',
    number: '988',
    description: '24/7 free, confidential support for people in distress.',
    url: 'https://988lifeline.org',
  },
  {
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    description: 'Free crisis counseling via text message.',
    url: 'https://www.crisistextline.org',
  },
  {
    name: 'SAMHSA Helpline',
    number: '1-800-662-4357',
    description: 'Free referrals and information for mental health and substance abuse.',
    url: 'https://www.samhsa.gov/find-help/national-helpline',
  },
  {
    name: 'Self-Harm Hotline',
    number: '1-800-273-8255',
    description: 'Immediate help for self-harm thoughts and behaviors.',
    url: 'https://988lifeline.org/self-harm',
  },
  {
    name: 'National Child Abuse Hotline',
    number: '1-800-422-4453',
    description: '24/7 support for children and families in crisis.',
    url: 'https://www.childhelp.org/hotline',
  },
  {
    name: 'National Domestic Violence Hotline',
    number: '1-800-799-7233',
    description: '24/7 support for victims of domestic violence.',
    url: 'https://www.thehotline.org',
  },
]

export default function CrisisBanner({ category }) {
  const [expanded, setExpanded] = useState(false)
  const [showAll, setShowAll] = useState(false)

  // Only show for sensitive categories
  const sensitiveCategories = ['SELF_HARM', 'HARASSED', 'BULLIED']
  if (!sensitiveCategories.includes(category)) return null

  return (
    <div className="crisis-banner">
      <div className="crisis-banner-header" onClick={() => setExpanded(!expanded)}>
        <span className="crisis-icon">🆘</span>
        <div className="crisis-banner-text">
          <strong>You're not alone — help is available</strong>
          <p>If you're going through a difficult time, these resources are here for you 24/7.</p>
        </div>
        <button className="crisis-toggle-btn" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && (
        <div className="crisis-resources-list">
          <div className="crisis-primary">
            <span className="crisis-primary-number">Call or text <strong>988</strong></span>
            <span className="crisis-primary-desc">Suicide & Crisis Lifeline — 24/7 free, confidential</span>
          </div>

          {(showAll ? CRISIS_RESOURCES : CRISIS_RESOURCES.slice(0, 2)).map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="crisis-resource-item"
            >
              <strong>{r.name}</strong>
              <span className="crisis-number">{r.number}</span>
              <span className="crisis-desc">{r.description}</span>
            </a>
          ))}

          <button className="crisis-show-all" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : `Show all ${CRISIS_RESOURCES.length} resources`}
          </button>

          <p className="crisis-footer-text">
            These resources are free, confidential, and available 24/7. You matter.
          </p>
        </div>
      )}
    </div>
  )
}
