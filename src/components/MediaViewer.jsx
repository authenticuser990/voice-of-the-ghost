import { useState, useEffect, useCallback } from 'react'

const Close = () => (
  <svg viewBox="0 0 24 24" width="28" height="28"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
)

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" width="32" height="32"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" width="32" height="32"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export default function MediaViewer({ items, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const current = items[index]

  useEffect(() => {
    setIndex(initialIndex)
  }, [initialIndex])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
    if (e.key === 'ArrowRight') setIndex((i) => Math.min(items.length - 1, i + 1))
  }, [items.length, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  if (!current) return null

  const isVideo = current.type === 'video' || Boolean(current.url?.match(/\.(mp4|webm|ogg)$/i))
  const hasPrev = index > 0
  const hasNext = index < items.length - 1

  return (
    <div className="media-viewer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <button className="media-viewer-close" onClick={onClose}><Close /></button>

      <div className="media-viewer-content">
        {isVideo ? (
          <video
            key={current.url}
            src={current.url}
            className="media-viewer-video"
            controls
            autoPlay
            playsInline
          />
        ) : (
          <img
            key={current.url}
            src={current.url}
            alt=""
            className="media-viewer-image"
          />
        )}
      </div>

      {items.length > 1 && (
        <div className="media-viewer-counter">{index + 1} / {items.length}</div>
      )}

      {hasPrev && (
        <button className="media-viewer-nav media-viewer-prev" onClick={() => setIndex(index - 1)}>
          <ChevronLeft />
        </button>
      )}
      {hasNext && (
        <button className="media-viewer-nav media-viewer-next" onClick={() => setIndex(index + 1)}>
          <ChevronRight />
        </button>
      )}
    </div>
  )
}
