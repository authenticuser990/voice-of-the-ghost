import { useState, useEffect, useCallback, useMemo } from 'react'
import { posts } from '../api'
import { formatCategory, formatEmotion, timeAgo, getAnonymousAvatar } from '../utils'
import CrisisBanner from '../components/CrisisBanner'
import MediaViewer from '../components/MediaViewer'
import ReportModal from '../components/ReportModal'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

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

export default function PostDetail({ postId, onBack }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [commentCount, setCommentCount] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMoreEmojis, setShowMoreEmojis] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentGif, setCommentGif] = useState('')
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [showReport, setShowReport] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const allMedia = useMemo(() => {
    if (!post) return []
    const items = []
    if (post.images) post.images.forEach((img) => items.push({ ...img, type: 'image' }))
    if (post.videos) post.videos.forEach((vid) => items.push({ ...vid, type: 'video' }))
    return items
  }, [post])

  const openViewer = (index) => {
    setViewerIndex(index)
    setViewerOpen(true)
  }

  const loadPost = useCallback(async () => {
    setLoading(true)
    try {
      const data = await posts.getById(postId)
      setPost(data)
      setComments(data.comments || [])
      setCommentCount(data._count?.comments || data.comments?.length || 0)
    } catch (err) {
      console.error('Failed to load post:', err)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    loadPost()
  }, [loadPost])

  if (loading) return <div className="loading-screen">Loading post...</div>
  if (!post) return <div className="loading-screen">Post not found</div>

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
    if ((!commentText.trim() && !commentGif) || submitting) return
    setSubmitting(true)
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
    } catch (err) {
      console.error('Comment error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="post-detail-page">
      <header className="post-detail-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Back</button>
        <h1>Post</h1>
      </header>

      <div className="post-detail-content">
        <div className="post-detail-card">
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
          <p className="post-body">{post.body}</p>

          {post.images?.length > 0 && (
            <div className="post-detail-media">
              {post.images.map((img, i) => (
                <div key={img.id} className={`post-image-wrapper ${post.isUncensored ? 'nsfw-blur' : ''}`}>
                  <img src={img.url} alt="" className="post-detail-image" loading="lazy" onClick={() => openViewer(i)} />
                </div>
              ))}
            </div>
          )}

          {post.videos?.length > 0 && (
            <div className="post-detail-media">
              {post.videos.map((vid, i) => (
                <video
                  key={vid.id}
                  src={vid.url}
                  poster={vid.thumbnailUrl || undefined}
                  className="post-detail-video"
                  controls
                  preload="metadata"
                  playsInline
                  onClick={() => openViewer(post.images?.length ? post.images.length + i : i)}
                />
              ))}
            </div>
          )}

          {post.audioFiles?.length > 0 && (
            <div className="post-audio-list" style={{ padding: '0 var(--space-5)' }}>
              {post.audioFiles.map((a) => (
                <div key={a.id} className="post-audio-item">
                  <audio src={a.url} controls preload="metadata" />
                </div>
              ))}
            </div>
          )}

          {post.documents?.length > 0 && (
            <div className="post-document-list" style={{ padding: '0 var(--space-5)' }}>
              {post.documents.map((d) => (
                <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" className="post-document-item">
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
              <button key={emoji} className="reaction-chip" onClick={() => handleReact(emoji)}>
                {emoji} {count}
              </button>
            ))}
            <div className="reaction-actions">
              <button className="reaction-add-btn" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowMoreEmojis(false) }}>
                + 😊
              </button>
              <button className="report-btn" onClick={() => setShowReport(post.id)}>
                🚩
              </button>
            </div>
          </div>

          {showReport === post.id && (
            <ReportModal contentId={post.id} contentType="POST" onClose={() => setShowReport(false)} />
          )}

          {showEmojiPicker && (
            <div className="emoji-picker" style={{ margin: '0 var(--space-5) var(--space-3)' }}>
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

          <div className="post-footer">
            <span className="post-upvotes">▲ {post.upvotes || 0}</span>
          </div>

          <CrisisBanner category={post.category} />
        </div>

        <div className="post-detail-comments">
          <h3>
            💬 Comments
            {commentCount > 0 && <span className="tag category">{commentCount}</span>}
          </h3>

          {comments.length === 0 ? (
            <p className="placeholder-text">No comments yet. Be the first to respond.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment-item">
                <div className="comment-header">
                  <strong>@{c.user?.username}</strong>
                  <button className="report-btn-sm" onClick={() => setShowReport(c.id)} title="Report comment">🚩</button>
                </div>
                <span>{c.body}</span>
                {c.gifUrl && <img src={c.gifUrl} alt="gif" className="comment-gif" />}
                {showReport === c.id && (
                  <ReportModal contentId={c.id} contentType="COMMENT" onClose={() => setShowReport(false)} />
                )}
              </div>
            ))
          )}

          <div className="post-detail-comment-input">
            <div className="comment-input-area" style={{ margin: 0 }}>
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
                <button
                  className="send-comment-btn"
                  onClick={handleSubmitComment}
                  disabled={submitting || (!commentText.trim() && !commentGif)}
                >
                  {submitting ? 'Posting...' : 'Send'}
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
          </div>
        </div>

        {viewerOpen && allMedia.length > 0 && (
          <MediaViewer items={allMedia} initialIndex={viewerIndex} onClose={() => setViewerOpen(false)} />
        )}
      </div>
    </div>
  )
}
