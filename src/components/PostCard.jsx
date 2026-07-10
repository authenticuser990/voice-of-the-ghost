import { useState, useMemo } from 'react'
import { posts } from '../api'
import { formatCategory, formatEmotion, timeAgo, getAnonymousAvatar } from '../utils'
import CrisisBanner from './CrisisBanner'
import MediaViewer from './MediaViewer'
import ReportModal from './ReportModal'

const QUICK_EMOJIS = ['❤️', '🔥', '💯', '🙏', '😢', '😡', '😂', '😭', '🤗', '👍']

const MORE_EMOJIS = [
  { label: 'Love', emojis: ['❤️', '💕', '💖', '💗', '💝', '🥰', '😍', '😘'] },
  { label: 'Support', emojis: ['🙏', '💪', '🤝', '👏', '✨', '🌟', '💫', '🌈'] },
  { label: 'Feelings', emojis: ['😢', '😭', '😤', '😡', '😰', '😌', '🥺', '😊'] },
  { label: 'Reactions', emojis: ['🔥', '💯', '😂', '🎉', '👀', '🫂', '🤗', '🫶'] },
]

const GIF_SUGGESTIONS = [
  'https://media.tenor.com/6B7yG8Qw5a4AAAAC/self-love.gif',
  'https://media.tenor.com/7XGFvQ-HzRkAAAAC/youre-not-alone.gif',
  'https://media.tenor.com/5wT8GtQx4RAAAAAC/stay-strong.gif',
]

export default function PostCard({ post: initialPost, compact, onClick }) {
  const [post, setPost] = useState(initialPost)
  const [deleted, _setDeleted] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMoreEmojis, setShowMoreEmojis] = useState(false)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentGif, setCommentGif] = useState('')
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [showReport, setShowReport] = useState(false)
  const [comments, setComments] = useState(post.comments || [])
  const [commentCount, setCommentCount] = useState(post._count?.comments || comments.length)

  const allMedia = useMemo(() => {
    const items = []
    if (post.images) post.images.forEach((img) => items.push({ ...img, type: 'image' }))
    if (post.videos) post.videos.forEach((vid) => items.push({ ...vid, type: 'video' }))
    return items
  }, [post.images, post.videos])

  const openViewer = (index) => {
    setViewerIndex(index)
    setViewerOpen(true)
  }

  if (deleted) return null

  const avatar = post.isAnonymous
    ? getAnonymousAvatar(post.id)
    : post.user?.username?.[0]?.toUpperCase() || '?'

  const reactions = post.reactions || []
  const groupedReactions = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1
    return acc
  }, {})

  const handleReact = async (emoji) => {
    try {
      const result = await posts.toggleReaction(post.id, emoji)
      setPost(prev => {
        const wasActive = result.active
        let newReactions
        if (wasActive) {
          newReactions = [...(prev.reactions || []), { id: Date.now().toString(), emoji, user: { username: 'you' } }]
        } else {
          const idx = prev.reactions.findIndex(r => r.emoji === emoji)
          newReactions = prev.reactions.filter((_, i) => i !== idx)
        }
        return { ...prev, reactions: newReactions }
      })
    } catch (err) {
      console.error('React error:', err)
    }
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim() && !commentGif) return
    try {
      const res = await posts.addComment(post.id, {
        body: commentText.trim(),
        gifUrl: commentGif || undefined,
      })
      setComments((prev) => [...prev, res.comment])
      setCommentCount(res.commentCount)
      setCommentText('')
      setCommentGif('')
      setShowGifPicker(false)
      setShowCommentInput(false)
    } catch (err) {
      console.error('Comment error:', err)
    }
  }

  const loadAllComments = async () => {
    try {
      const data = await posts.getComments(post.id)
      setComments(data)
      setShowAllComments(true)
    } catch (err) {
      console.error('Load comments error:', err)
    }
  }

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e)
    }
  }

  const handleActionClick = (e, cb) => {
    e.stopPropagation()
    cb()
  }

  const hasImages = post.images?.length > 0
  const hasVideos = post.videos?.length > 0
  const hasAudio = post.audioFiles?.length > 0
  const hasDocuments = post.documents?.length > 0

  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="post-card" data-vent={post.isVent || undefined} onClick={handleCardClick}>
      <div className="post-header">
        <div className="post-author">
          <div className="post-avatar" data-anonymous={post.isAnonymous || undefined}>
            {avatar}
          </div>
          <div className="post-meta">
            <span className="post-username">
              {post.isAnonymous ? 'Anonymous' : `@${post.user?.username}`}
              {post.user?.role && !post.isAnonymous && (
                <span className="post-role-badge">
                  {post.user.role === 'SAGE' ? 'Sage' : post.user.role === 'HELPSEEKER' ? 'Help Seeker' : 'Both'}
                </span>
              )}
            </span>
            <span className="post-time">{timeAgo(post.createdAt)}</span>
          </div>
        </div>
        <div className="post-tags">
          <span className="tag category">{formatCategory(post.category)}</span>
          <span className="tag emotion">{formatEmotion(post.emotion)}</span>
          {post.isUncensored && <span className="tag nsfw">NSFW</span>}
          {post.isVent && <span className="tag vent-tag">Vent</span>}
        </div>
      </div>

      <h3 className="post-title">{post.title}</h3>
      <p className={`post-body ${compact ? 'post-body-compact' : ''}`}>{post.body}</p>

      {hasImages && (
        <div className="post-media">
          {post.images.map((img, i) => (
            <div key={img.id} className={`post-image-wrapper ${post.isUncensored ? 'nsfw-blur' : ''}`} onClick={(e) => { e.stopPropagation(); openViewer(i) }}>
              <img src={img.url} alt="" className="post-image" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {hasVideos && (
        <div className="post-media">
          {post.videos.map((vid, i) => (
            <div key={vid.id} className="post-video-wrapper" onClick={(e) => { e.stopPropagation(); openViewer(hasImages ? post.images.length + i : i) }}>
              <video
                src={vid.url}
                poster={vid.thumbnailUrl || undefined}
                className="post-video"
                controls
                preload="metadata"
                playsInline
              />
            </div>
          ))}
        </div>
      )}

      {hasAudio && (
        <div className="post-audio-list">
          {post.audioFiles.map((a) => (
            <div key={a.id} className="post-audio-item" onClick={(e) => e.stopPropagation()}>
              <audio src={a.url} controls preload="metadata" />
            </div>
          ))}
        </div>
      )}

      {hasDocuments && (
        <div className="post-document-list">
          {post.documents.map((d) => (
            <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" className="post-document-item" onClick={(e) => e.stopPropagation()}>
              <span className="post-document-icon">📄</span>
              <div className="post-document-info">
                <span className="post-document-name">{d.name}</span>
                {d.size > 0 && <span className="post-document-size">{formatSize(d.size)}</span>}
              </div>
              <span className="post-download-btn">Download</span>
            </a>
          ))}
        </div>
      )}

      <div className="post-reactions">
        {Object.entries(groupedReactions).map(([emoji, count]) => (
          <button key={emoji} className="reaction-chip" onClick={(e) => handleActionClick(e, () => handleReact(emoji))}>
            {emoji} {count}
          </button>
        ))}
        <div className="reaction-actions">
          <button className="reaction-add-btn" onClick={(e) => handleActionClick(e, () => { setShowEmojiPicker(!showEmojiPicker); setShowMoreEmojis(false) })}>
            + 😊
          </button>
          <button className="comment-btn" onClick={(e) => handleActionClick(e, () => setShowCommentInput(!showCommentInput))}>
            💬 {commentCount > 0 && commentCount}
          </button>
          <button className="report-btn" onClick={(e) => handleActionClick(e, () => setShowReport(true))}>
            🚩
          </button>
        </div>
      </div>

      {showEmojiPicker && (
        <div className="emoji-picker" onClick={(e) => e.stopPropagation()}>
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="emoji-option"
              onClick={() => { handleReact(emoji); setShowEmojiPicker(false); setShowMoreEmojis(false) }}
            >
              {emoji}
            </button>
          ))}
          <button className="more-emojis-btn" onClick={() => setShowMoreEmojis(!showMoreEmojis)}>
            {showMoreEmojis ? '▲ Less' : '▼ More'}
          </button>
          {showMoreEmojis && (
            <div className="more-emojis-grid">
              {MORE_EMOJIS.map((group) => (
                <div key={group.label} className="emoji-group">
                  <span className="emoji-group-label">{group.label}</span>
                  <div className="emoji-group-emojis">
                    {group.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        className="emoji-option"
                        onClick={() => { handleReact(emoji); setShowEmojiPicker(false); setShowMoreEmojis(false) }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {comments.length > 0 && (
        <div className="comment-list" onClick={(e) => e.stopPropagation()}>
          {(showAllComments ? comments : comments.slice(0, 2)).map((c) => (
            <div key={c.id} className="comment-item">
              <strong>@{c.user?.username}</strong>
              <span>{c.body}</span>
              {c.gifUrl && <img src={c.gifUrl} alt="gif" className="comment-gif" />}
            </div>
          ))}
          {!showAllComments && commentCount > 2 && (
            <button className="see-all-comments" onClick={loadAllComments}>
              See all {commentCount} comments
            </button>
          )}
        </div>
      )}

      {showCommentInput && (
        <div className="comment-input-area" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
          />
          <div className="comment-input-actions">
            <button className="gif-btn" onClick={() => setShowGifPicker(!showGifPicker)}>
              GIF
            </button>
            <button className="send-comment-btn" onClick={handleSubmitComment}>
              Send
            </button>
          </div>
          {showGifPicker && (
            <div className="gif-picker">
              {GIF_SUGGESTIONS.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="gif"
                  className="gif-option"
                  onClick={() => { setCommentGif(url); setShowGifPicker(false) }}
                />
              ))}
            </div>
          )}
          {commentGif && <img src={commentGif} alt="selected gif" className="selected-gif" />}
        </div>
      )}

      {showReport && (
        <ReportModal contentId={post.id} contentType="POST" onClose={() => setShowReport(false)} />
      )}

      {viewerOpen && allMedia.length > 0 && (
        <MediaViewer items={allMedia} initialIndex={viewerIndex} onClose={() => setViewerOpen(false)} />
      )}

      <CrisisBanner category={post.category} />

      <div className="post-footer" onClick={(e) => e.stopPropagation()}>
        <span className="post-upvotes">▲ {post.upvotes || 0}</span>
        <span className="post-comment-count">💬 {commentCount}</span>
      </div>
    </div>
  )
}
