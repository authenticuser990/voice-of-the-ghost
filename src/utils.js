const CATEGORY_LABELS = {
  MENTAL_HEALTH: 'Mental Health',
  FRIENDS: 'Friends',
  LONELINESS_AND_LEFT_OUT: 'Loneliness & Left Out',
  BROKEN_HEARTED: 'Broken Hearted',
  BULLIED: 'Bullied',
  HARASSED: 'Harassed',
  SELF_HARM: 'Self Harm',
  JOY: 'Joy',
  OTHERS: 'Others',
  VENT: 'Vent',
}

const EMOTION_LABELS = {
  HAPPY: '😊 Happy',
  CALM: '😌 Calm',
  SAD: '😢 Sad',
  DEPRESSED: '😫 Depressed',
  ANXIOUS: '😰 Anxious',
  ANGRY: '😡 Angry',
  FRUSTRATED: '😤 Frustrated',
  HOPEFUL: '🤞 Hopeful',
  NUMB: '😶 Numb',
  OVERWHELMED: '😵 Overwhelmed',
}

export function formatCategory(cat) {
  return CATEGORY_LABELS[cat] || cat
}

export function formatEmotion(emo) {
  return EMOTION_LABELS[emo] || emo
}

export function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const ANON_AVATARS = ['👻', '🕵️', '🎭', '🌑', '🫥', '👀']

export function getAnonymousAvatar(postId) {
  const index = postId ? postId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % ANON_AVATARS.length : 0
  return ANON_AVATARS[index]
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}