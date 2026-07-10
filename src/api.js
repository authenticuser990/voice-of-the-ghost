const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('votg_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  let data
  const text = await res.text()
  try {
    data = JSON.parse(text)
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`)
  }

  return data
}

export const auth = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  refreshToken: () => request('/auth/refresh-token', { method: 'POST' }),
}

export const users = {
  getAll: () => request('/users'),
  getByUsername: (username) => request(`/users/${username}`),
  follow: (username) => request(`/users/${username}/follow`, { method: 'POST' }),
}

export const posts = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/posts${qs ? `?${qs}` : ''}`)
  },
  getById: (id) => request(`/posts/${id}`),
  create: (data) => request('/posts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  upvote: (id) => request(`/posts/${id}/upvote`, { method: 'POST' }),
  // Comments
  getComments: (id) => request(`/posts/${id}/comments`),
  addComment: (id, data) => request(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  deleteComment: (postId, commentId) => request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
  // Reactions
  toggleReaction: (id, emoji) => request(`/posts/${id}/react`, { method: 'POST', body: JSON.stringify({ emoji }) }),
}

export const communities = {
  getAll: () => request('/communities'),
  getMy: () => request('/communities/my'),
  getById: (id) => request(`/communities/${id}`),
  create: (data) => request('/communities', { method: 'POST', body: JSON.stringify(data) }),
  join: (id) => request(`/communities/${id}/join`, { method: 'POST' }),
  leave: (id) => request(`/communities/${id}/leave`, { method: 'POST' }),
  processRequest: (id, requestId, status) =>
    request(`/communities/${id}/requests/${requestId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getMembers: (id) => request(`/communities/${id}/members`),
  search: (query) => request(`/communities/search?q=${encodeURIComponent(query)}`),
}

export const dms = {
  send: (data) => request('/dms', { method: 'POST', body: JSON.stringify(data) }),
  getConversations: () => request('/dms/conversations'),
  getMessages: (username) => request(`/dms/${username}`),
}

export const notifications = {
  getAll: () => request('/notifications'),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  getUnreadCount: () => request('/notifications/unread-count'),
  mute: (data) => request('/notifications/mute', { method: 'POST', body: JSON.stringify(data) }),
}

export const profiles = {
  getMe: () => request('/profiles/me'),
  update: (data) => request('/profiles/me', { method: 'PATCH', body: JSON.stringify(data) }),
}

export const search = {
  all: (q) => {
    const showUncensored = localStorage.getItem('votg_show_uncensored') !== 'false'
    return request(`/search?q=${encodeURIComponent(q)}&showUncensored=${showUncensored}`)
  },
  posts: (q) => {
    const showUncensored = localStorage.getItem('votg_show_uncensored') !== 'false'
    return request(`/search?q=${encodeURIComponent(q)}&type=posts&showUncensored=${showUncensored}`)
  },
  users: (q) => request(`/search?q=${encodeURIComponent(q)}&type=users`),
  communities: (q) => {
    const showUncensored = localStorage.getItem('votg_show_uncensored') !== 'false'
    return request(`/search?q=${encodeURIComponent(q)}&type=communities&showUncensored=${showUncensored}`)
  },
}

async function uploadFile(url, formData) {
  const token = localStorage.getItem('votg_token')
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: formData,
  })
  let data
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    data = await res.json()
  } else {
    const text = await res.text()
    throw new Error(text || `Upload failed (HTTP ${res.status})`)
  }
  if (!res.ok) throw new Error(data?.error || 'Upload failed')
  return data
}

export const upload = {
  file: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return uploadFile(`${API_BASE}/upload`, formData)
  },
  multiple: (files) => {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    return uploadFile(`${API_BASE}/upload/multiple`, formData)
  },
}

export const reports = {
  create: (data) => request('/reports', { method: 'POST', body: JSON.stringify(data) }),
  getAll: (params) => request(`/reports?${new URLSearchParams(params || {})}`),
  resolve: (id, status) => request(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

export const moderation = {
  deletePost: (id) => request(`/moderation/posts/${id}`, { method: 'DELETE' }),
  deleteComment: (id) => request(`/moderation/comments/${id}`, { method: 'DELETE' }),
  banUser: (data) => request('/moderation/bans', { method: 'POST', body: JSON.stringify(data) }),
  liftBan: (id) => request(`/moderation/bans/${id}/lift`, { method: 'PATCH' }),
  getBanStatus: (userId) => request(`/moderation/bans/${userId}`),
  checkBan: () => request('/moderation/check'),
  markNsfw: (postId) => request(`/moderation/posts/${postId}/nsfw`, { method: 'PATCH' }),
  getLogs: (params) => request(`/moderation/logs?${new URLSearchParams(params || {})}`),
}

export const blocks = {
  block: (userId) => request(`/blocks/${userId}`, { method: 'POST' }),
  unblock: (userId) => request(`/blocks/${userId}`, { method: 'DELETE' }),
  getBlocked: () => request('/blocks'),
  check: (userId) => request(`/blocks/check/${userId}`),
}

export const settings = {
  deleteAccount: (confirmation) => request('/auth/account', { method: 'DELETE', body: JSON.stringify({ confirmation }) }),
}