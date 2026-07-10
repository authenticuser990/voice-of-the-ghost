import { useState, useRef, useEffect } from 'react'

export default function CommunityTabs({ activeTab, onTabChange, myCount = 0, exploreCount = 0 }) {
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const tabsRef = useRef({})

  useEffect(() => {
    const activeEl = tabsRef.current[activeTab]
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      })
    }
  }, [activeTab])

  const tabs = [
    { id: 'my', label: 'My Communities', count: myCount },
    { id: 'explore', label: 'Explore', count: exploreCount },
  ]

  return (
    <div className="community-tabs">
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (tabsRef.current[tab.id] = el)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            {tab.count > 0 && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
        <div className="tab-indicator" style={indicatorStyle} />
      </div>
    </div>
  )
}
