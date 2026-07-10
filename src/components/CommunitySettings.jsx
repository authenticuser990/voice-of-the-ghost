import { useState, useEffect } from 'react'
import { communities } from '../api'
import Markdown from 'react-markdown'

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
)

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6"/>
  </svg>
)

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
)

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const ExitIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)

const TransferIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 1l4 4-4 4"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <path d="M7 23l-4-4 4-4"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)

const muteDurations = [
  { value: '1h', label: '1 hour' },
  { value: '8h', label: '8 hours' },
  { value: '1d', label: '1 day' },
  { value: '1w', label: '1 week' },
  { value: '1m', label: '1 month' },
  { value: '1y', label: '1 year' },
  { value: 'forever', label: 'Always' },
]

export default function CommunitySettings({ community, currentUser, onClose, onLeave, onUpdate }) {
  const [view, setView] = useState('main')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editName, setEditName] = useState(community?.name || '')
  const [editDesc, setEditDesc] = useState(community?.description || '')
  const [editRules, setEditRules] = useState(community?.rules || '')
  const [mentionSetting, setMentionSetting] = useState(community?.mentionSetting || 'everyone')
  const [muteSetting, setMuteSetting] = useState('none')
  const [muteDuration, setMuteDuration] = useState('1h')
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [addMemberTab, setAddMemberTab] = useState('search')
  const [addMemberQuery, setAddMemberQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [followers, setFollowers] = useState([])
  const [loadingFollowers, setLoadingFollowers] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [visibility, setVisibility] = useState(community?.visibility || 'PUBLIC')
  const [copied, setCopied] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferTarget, setTransferTarget] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  // Sync state with community prop when it updates
  useEffect(() => {
    if (community) {
      setEditName(community.name || '')
      setEditDesc(community.description || '')
      setEditRules(community.rules || '')
      setMentionSetting(community.mentionSetting || 'everyone')
      setVisibility(community.visibility || 'PUBLIC')
    }
  }, [community?.id, community?.rules, community?.name, community?.description, community?.mentionSetting, community?.visibility])

  const isAdmin = community?.members?.some(
    (m) => m.userId === currentUser?.id && m.role === 'ADMIN'
  ) && community?.adminId === currentUser?.id
  const isSubAdmin = community?.members?.some(
    (m) => m.userId === currentUser?.id && m.role === 'SUB_ADMIN'
  )
  const canManage = isAdmin || isSubAdmin

  useEffect(() => {
    if (view === 'members') {
      loadMembers()
    }
  }, [view])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const data = await communities.getMembers(community.id)
      setMembers(data)
    } catch (err) {
      console.error('Failed to load members:', err)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/communities/${community.id}/search-users?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('votg_token')}` }
      })
      const data = await res.json()
      setSearchResults(data)
    } catch (err) {
      console.error('Failed to search users:', err)
    } finally {
      setSearching(false)
    }
  }

  const loadFollowers = async () => {
    setLoadingFollowers(true)
    try {
      const res = await fetch(`/api/communities/${community.id}/followers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('votg_token')}` }
      })
      const data = await res.json()
      setFollowers(data)
    } catch (err) {
      console.error('Failed to load followers:', err)
    } finally {
      setLoadingFollowers(false)
    }
  }

  const handleAddMember = async (userId) => {
    try {
      await fetch(`/api/communities/${community.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('votg_token')}`
        },
        body: JSON.stringify({ userId })
      })
      setSuccess('Member added')
      setAddMemberQuery('')
      setSearchResults([])
      loadMembers()
      onUpdate?.()
    } catch (err) {
      setError('Failed to add member')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the community?')) return
    try {
      await fetch(`/api/communities/${community.id}/members/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('votg_token')}` }
      })
      setSuccess('Member removed')
      loadMembers()
      onUpdate?.()
    } catch (err) {
      setError('Failed to remove member')
    }
  }

  const handlePromoteMember = async (userId) => {
    try {
      await fetch(`/api/communities/${community.id}/members/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('votg_token')}`
        },
        body: JSON.stringify({ role: 'SUB_ADMIN' })
      })
      setSuccess('Member promoted to Sub-Admin')
      loadMembers()
      onUpdate?.()
    } catch (err) {
      setError('Failed to promote member')
    }
  }

  const handleDemoteMember = async (userId) => {
    try {
      await fetch(`/api/communities/${community.id}/members/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('votg_token')}`
        },
        body: JSON.stringify({ role: 'MEMBER' })
      })
      setSuccess('Sub-Admin demoted to Member')
      loadMembers()
      onUpdate?.()
    } catch (err) {
      setError('Failed to demote member')
    }
  }

  const handleUpdateCommunity = async () => {
    try {
      await fetch(`/api/communities/${community.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('votg_token')}`
        },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          rules: editRules,
          mentionSetting,
          visibility
        })
      })
      setSuccess('Community updated')
      onUpdate?.()
      setTimeout(() => setView('main'), 1000)
    } catch (err) {
      setError('Failed to update community')
    }
  }

  const handleUpdateRules = async () => {
    try {
      await fetch(`/api/communities/${community.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('votg_token')}`
        },
        body: JSON.stringify({ rules: editRules })
      })
      setSuccess('Rules updated successfully')
      onUpdate?.()
    } catch (err) {
      setError('Failed to update rules')
    }
  }

  const handleTransferOwnership = async () => {
    if (!transferTarget) {
      setError('Please select a member to transfer ownership to')
      return
    }
    setTransferLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/communities/${community.id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('votg_token')}`
        },
        body: JSON.stringify({ transferTo: transferTarget })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to transfer ownership')
      setShowTransferModal(false)
      onUpdate?.()
    } catch (err) {
      setError(err.message || 'Failed to transfer ownership')
    } finally {
      setTransferLoading(false)
    }
  }

  const handleDeleteCommunity = async () => {
    try {
      await fetch(`/api/communities/${community.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('votg_token')}` }
      })
      setShowDeleteModal(false)
      onClose('deleted')
    } catch (err) {
      setError('Failed to delete community')
    }
  }

  const handleLeaveCommunity = async () => {
    try {
      const res = await fetch(`/api/communities/${community.id}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('votg_token')}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to leave community')
      setShowLeaveModal(false)
      onLeave?.()
    } catch (err) {
      setError(err.message || 'Failed to leave community')
    }
  }

  const handleGenerateInvite = async () => {
    setInviteLoading(true)
    try {
      const res = await fetch(`/api/communities/${community.id}/invite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('votg_token')}` }
      })
      const data = await res.json()
      setInviteLink(data.inviteLink)
      setSuccess('Invite link generated')
    } catch (err) {
      setError('Failed to generate invite link')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy link')
    }
  }

  const handleShareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${community.name}`,
          text: `You're invited to join ${community.name}!`,
          url: inviteLink
        })
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyInvite()
    }
  }

  const openAddMemberModal = () => {
    setShowAddMemberModal(true)
    setAddMemberTab('search')
    setAddMemberQuery('')
    setSearchResults([])
    setFollowers([])
    setInviteLink('')
  }

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return <span className="role-badge admin">Admin</span>
    if (role === 'SUB_ADMIN') return <span className="role-badge subadmin">Sub-Admin</span>
    return null
  }

  const renderMainView = () => {
    const otherMembers = community.members?.filter(m => m.userId !== currentUser?.id) || []
    const hasSubAdmins = community.members?.some(m => m.userId !== currentUser?.id && m.role === 'SUB_ADMIN')

    return (
    <div className="settings-sections">
      <button className="settings-item" onClick={() => setView('members')}>
        <UsersIcon />
        <span>Members</span>
        <span className="settings-item-count">{community.members?.length || 0}</span>
        <ChevronRight />
      </button>

      {isAdmin && (
        <>
          <button 
            className="settings-item" 
            onClick={() => setShowTransferModal(true)}
            disabled={!hasSubAdmins}
          >
            <TransferIcon />
            <span>Transfer Ownership</span>
          </button>
          <button className="settings-item" onClick={() => setShowLeaveModal(true)}>
            <ExitIcon />
            <span>Leave Community</span>
          </button>
          <div className="settings-divider" />
          <button className="settings-item" onClick={() => setView('notifications')}>
            <BellIcon />
            <span>Notification Settings</span>
            <ChevronRight />
          </button>
          <button className="settings-item" onClick={() => setView('rules')}>
            <ShieldIcon />
            <span>Rules & Guidelines</span>
            <ChevronRight />
          </button>
          <div className="settings-divider" />
          <button className="settings-item" onClick={() => setView('admin')}>
            <EditIcon />
            <span>Community Settings</span>
            <ChevronRight />
          </button>
          <button className="settings-item danger" onClick={() => setShowDeleteModal(true)}>
            <TrashIcon />
            <span>Delete Community</span>
          </button>
        </>
      )}

      {!isAdmin && (
        <>
          <button className="settings-item danger" onClick={() => setShowLeaveModal(true)}>
            <ExitIcon />
            <span>Leave Community</span>
          </button>
          <div className="settings-divider" />
          <button className="settings-item" onClick={() => setView('notifications')}>
            <BellIcon />
            <span>Notification Settings</span>
            <ChevronRight />
          </button>
          <button className="settings-item" onClick={() => setView('rules')}>
            <ShieldIcon />
            <span>Rules & Guidelines</span>
            <ChevronRight />
          </button>
        </>
      )}
    </div>
    )
  }

  const renderMembersView = () => (
    <div className="settings-sections">
      <div className="settings-header-row">
        <button className="back-btn-settings" onClick={() => setView('main')}>
          <ChevronLeft />
        </button>
        <h3>Members ({members.length})</h3>
        {canManage && (
          <button className="add-member-btn" onClick={openAddMemberModal}>
            <UserPlusIcon />
          </button>
        )}
      </div>

      {loading ? (
        <div className="settings-loading">Loading members...</div>
      ) : (
        <div className="members-list">
          {members.map((member) => (
            <div key={member.userId} className="member-item">
              <div className="member-avatar">
                {member.user?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="member-info">
                <span className="member-name">
                  {member.user?.username}
                  {getRoleBadge(member.role)}
                </span>
                {member.user?.displayName && (
                  <span className="member-display">{member.user.displayName}</span>
                )}
              </div>
              {canManage && member.userId !== currentUser?.id && member.role !== 'ADMIN' && (
                <div className="member-actions">
                  {isAdmin && member.role === 'MEMBER' && (
                    <button
                      className="member-action-btn promote"
                      onClick={() => handlePromoteMember(member.id)}
                      title="Promote to Sub-Admin"
                    >
                      <StarIcon />
                    </button>
                  )}
                  {isAdmin && member.role === 'SUB_ADMIN' && (
                    <button
                      className="member-action-btn demote"
                      onClick={() => handleDemoteMember(member.id)}
                      title="Demote to Member"
                    >
                      <MinusIcon />
                    </button>
                  )}
                  <button
                    className="member-action-btn remove"
                    onClick={() => handleRemoveMember(member.id)}
                    title="Remove from community"
                  >
                    <MinusIcon />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderNotificationsView = () => (
    <div className="settings-sections">
      <div className="settings-header-row">
        <button className="back-btn-settings" onClick={() => setView('main')}>
          <ChevronLeft />
        </button>
        <h3>Notification Settings</h3>
      </div>

      <div className="settings-group">
        <label className="settings-label">Notification Preferences</label>
        <div className="radio-group">
          <label className="radio-item">
            <input
              type="radio"
              name="notif"
              value="all"
              checked={muteSetting === 'none'}
              onChange={() => setMuteSetting('none')}
            />
            <span>Get All Notifications</span>
          </label>
          <label className="radio-item">
            <input
              type="radio"
              name="notif"
              value="mentions"
              checked={muteSetting === 'mentions_only'}
              onChange={() => setMuteSetting('mentions_only')}
            />
            <span>Get Notified on Mentions Only</span>
          </label>
          <label className="radio-item">
            <input
              type="radio"
              name="notif"
              value="mute_all"
              checked={muteSetting === 'mute_all'}
              onChange={() => setMuteSetting('mute_all')}
            />
            <span>Mute All Notifications</span>
          </label>
          <label className="radio-item">
            <input
              type="radio"
              name="notif"
              value="mute_mentions"
              checked={muteSetting === 'mute_mentions'}
              onChange={() => setMuteSetting('mute_mentions')}
            />
            <span>Mute Mentions Only</span>
          </label>
        </div>
      </div>

      {muteSetting !== 'none' && (
        <div className="settings-group">
          <label className="settings-label">Mute Duration</label>
          <div className="duration-chips">
            {muteDurations.map((d) => (
              <button
                key={d.value}
                className={`duration-chip ${muteDuration === d.value ? 'active' : ''}`}
                onClick={() => setMuteDuration(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="settings-save-btn" onClick={() => setSuccess('Settings saved')}>
        Save Settings
      </button>
    </div>
  )

  const renderRulesView = () => (
    <div className="settings-sections">
      <div className="settings-header-row">
        <button className="back-btn-settings" onClick={() => setView('main')}>
          <ChevronLeft />
        </button>
        <h3>Rules & Guidelines</h3>
      </div>

      {isAdmin ? (
        <>
          <div className="settings-group">
            <label className="settings-label">Edit Rules (Markdown supported)</label>
            <textarea
              className="settings-textarea"
              value={editRules}
              onChange={(e) => setEditRules(e.target.value)}
              rows={8}
              maxLength={2000}
              placeholder={"# Community Rules\n\n- Be kind and respectful\n- No hate speech\n- Help others when you can"}
            />
          </div>

          {editRules && (
            <div className="settings-group">
              <label className="settings-label">Preview</label>
              <div className="rules-content markdown-body">
                <Markdown>{editRules}</Markdown>
              </div>
            </div>
          )}

          {error && <div className="settings-error">{error}</div>}
          {success && <div className="settings-success">{success}</div>}
          <button className="settings-save-btn" onClick={handleUpdateRules}>
            Save Rules
          </button>
        </>
      ) : (
        <div className="rules-content markdown-body">
          {community.rules ? (
            <Markdown>{community.rules}</Markdown>
          ) : (
            <p className="no-rules">No rules have been set for this community.</p>
          )}
        </div>
      )}
    </div>
  )

  const renderAdminView = () => (
    <div className="settings-sections">
      <div className="settings-header-row">
        <button className="back-btn-settings" onClick={() => setView('main')}>
          <ChevronLeft />
        </button>
        <h3>Community Settings</h3>
      </div>

      <div className="settings-group">
        <label className="settings-label">Community Name</label>
        <input
          type="text"
          className="settings-input"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          maxLength={50}
        />
      </div>

      <div className="settings-group">
        <label className="settings-label">Description</label>
        <textarea
          className="settings-textarea"
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="settings-group">
        <label className="settings-label">Rules</label>
        <textarea
          className="settings-textarea"
          value={editRules}
          onChange={(e) => setEditRules(e.target.value)}
          rows={4}
          maxLength={2000}
        />
      </div>

      <div className="settings-group">
        <label className="settings-label">Visibility</label>
        <div className="radio-group">
          <label className="radio-item">
            <input
              type="radio"
              name="visibility"
              value="PUBLIC"
              checked={visibility === 'PUBLIC'}
              onChange={() => setVisibility('PUBLIC')}
            />
            <GlobeIcon />
            <span>Public - Anyone can find and join</span>
          </label>
          <label className="radio-item">
            <input
              type="radio"
              name="visibility"
              value="PRIVATE"
              checked={visibility === 'PRIVATE'}
              onChange={() => setVisibility('PRIVATE')}
            />
            <LockIcon />
            <span>Private - Invite only</span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">Mention Permissions</label>
        <div className="radio-group">
          <label className="radio-item">
            <input
              type="radio"
              name="mention"
              value="everyone"
              checked={mentionSetting === 'everyone'}
              onChange={() => setMentionSetting('everyone')}
            />
            <span>Let users use @everyone</span>
          </label>
          <label className="radio-item">
            <input
              type="radio"
              name="mention"
              value="single"
              checked={mentionSetting === 'single'}
              onChange={() => setMentionSetting('single')}
            />
            <span>Users can only ping one person</span>
          </label>
        </div>
      </div>

      {error && <div className="settings-error">{error}</div>}
      {success && <div className="settings-success">{success}</div>}

      <button className="settings-save-btn" onClick={handleUpdateCommunity}>
        Save Changes
      </button>
    </div>
  )

  const renderAddMemberModal = () => {
    if (!showAddMemberModal) return null

    return (
      <div className="add-member-modal-overlay" onClick={() => setShowAddMemberModal(false)}>
        <div className="add-member-modal" onClick={(e) => e.stopPropagation()}>
          <div className="add-member-modal-header">
            <h3>Add Members</h3>
            <button className="settings-close" onClick={() => setShowAddMemberModal(false)}>
              <CloseIcon />
            </button>
          </div>

          <div className="add-member-modal-tabs">
            <button
              className={`add-member-tab ${addMemberTab === 'search' ? 'active' : ''}`}
              onClick={() => {
                setAddMemberTab('search')
                setInviteLink('')
              }}
            >
              <SearchIcon /> Search
            </button>
            <button
              className={`add-member-tab ${addMemberTab === 'followers' ? 'active' : ''}`}
              onClick={() => {
                setAddMemberTab('followers')
                setInviteLink('')
                if (followers.length === 0) loadFollowers()
              }}
            >
              <UsersIcon /> Followers
            </button>
            <button
              className={`add-member-tab ${addMemberTab === 'invite' ? 'active' : ''}`}
              onClick={() => setAddMemberTab('invite')}
            >
              <LinkIcon /> Invite Link
            </button>
          </div>

          <div className="add-member-modal-body">
            {addMemberTab === 'search' && (
              <>
                <div className="add-member-search-bar">
                  <input
                    type="text"
                    placeholder="Search users by username..."
                    value={addMemberQuery}
                    onChange={(e) => {
                      setAddMemberQuery(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    autoFocus
                  />
                </div>
                {searching && <div className="settings-loading">Searching...</div>}
                {searchResults.length > 0 && (
                  <div className="add-member-results">
                    {searchResults.map((user) => (
                      <div key={user.id} className="add-member-result-item">
                        <div className="member-avatar">
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="member-info">
                          <span className="member-name">{user.username}</span>
                          {user.profile?.displayName && (
                            <span className="member-display">{user.profile.displayName}</span>
                          )}
                        </div>
                        <button
                          className="add-member-action-btn"
                          onClick={() => handleAddMember(user.id)}
                        >
                          <PlusIcon /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {!searching && addMemberQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="settings-loading">No users found</div>
                )}
              </>
            )}

            {addMemberTab === 'followers' && (
              <>
                {loadingFollowers && <div className="settings-loading">Loading followers...</div>}
                {!loadingFollowers && followers.length === 0 && (
                  <div className="settings-loading">No followers to add</div>
                )}
                {followers.length > 0 && (
                  <div className="add-member-results">
                    {followers.map((user) => (
                      <div key={user.id} className="add-member-result-item">
                        <div className="member-avatar">
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="member-info">
                          <span className="member-name">{user.username}</span>
                          {user.profile?.displayName && (
                            <span className="member-display">{user.profile.displayName}</span>
                          )}
                        </div>
                        <button
                          className="add-member-action-btn"
                          onClick={() => handleAddMember(user.id)}
                        >
                          <PlusIcon /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {addMemberTab === 'invite' && (
              <div className="invite-section">
                {!inviteLink ? (
                  <div className="invite-generate">
                    <p>Generate a link to invite people to this community.</p>
                    <button
                      className="settings-save-btn"
                      onClick={handleGenerateInvite}
                      disabled={inviteLoading}
                    >
                      {inviteLoading ? 'Generating...' : 'Generate Invite Link'}
                    </button>
                  </div>
                ) : (
                  <div className="invite-link-display">
                    <div className="invite-link-box">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="invite-link-input"
                      />
                      <button className="invite-copy-btn" onClick={handleCopyInvite}>
                        {copied ? 'Copied!' : <CopyIcon />}
                      </button>
                    </div>
                    <div className="invite-actions">
                      <button className="invite-share-btn" onClick={handleShareInvite}>
                        <ShareIcon /> Share
                      </button>
                    </div>
                    <p className="invite-note">Anyone with this link can join the community.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (view) {
      case 'members': return renderMembersView()
      case 'notifications': return renderNotificationsView()
      case 'rules': return renderRulesView()
      case 'admin': return renderAdminView()
      default: return renderMainView()
    }
  }

  return (
    <div className="settings-overlay" onClick={() => onClose()}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={() => onClose()}>
            <CloseIcon />
          </button>
        </div>

        <div className="settings-community-info">
          <div className="settings-community-avatar">
            {community.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="settings-community-meta">
            <h3>{community.name}</h3>
            <span>{community.visibility} · {community.contentRating}</span>
          </div>
        </div>

        <div className="settings-body">
          {renderView()}
        </div>
      </div>

      {renderAddMemberModal()}

      {showTransferModal && (
        <div className="add-member-modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="add-member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-member-modal-header">
              <h3>Transfer Ownership</h3>
              <button className="settings-close" onClick={() => setShowTransferModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="add-member-modal-body">
              <div className="confirm-modal-content">
                <div className="confirm-modal-icon transfer">
                  <TransferIcon />
                </div>
                <p className="confirm-modal-title">Transfer Community Ownership</p>
                <p className="confirm-modal-desc">
                  You are about to transfer ownership of this community to another member. 
                  You will be demoted to Sub-Admin and will retain your membership. 
                  This action can be reversed by the new admin.
                </p>
                <div className="confirm-modal-community">
                  <div className="confirm-modal-avatar">
                    {community.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="confirm-modal-community-info">
                    <span className="confirm-modal-community-name">{community.name}</span>
                    <span className="confirm-modal-community-members">
                      {community.members?.length || 0} members
                    </span>
                  </div>
                </div>
              </div>

              <div className="transfer-select-section">
                <p className="transfer-select-label">Select a Sub-Admin to become the new admin:</p>
                <div className="transfer-members-list">
                  {community.members?.filter(m => m.userId !== currentUser?.id && m.role === 'SUB_ADMIN').map((member) => (
                    <label key={member.userId} className={`transfer-member-item ${transferTarget === member.userId ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="transferTarget"
                        value={member.userId}
                        checked={transferTarget === member.userId}
                        onChange={() => setTransferTarget(member.userId)}
                      />
                      <div className="member-avatar">
                        {member.user?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="member-info">
                        <span className="member-name">
                          {member.user?.username}
                          <span className="role-badge subadmin">Sub-Admin</span>
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {community.members?.filter(m => m.userId !== currentUser?.id && m.role === 'SUB_ADMIN').length === 0 && (
                <div className="transfer-no-members">
                  <p className="transfer-no-members-title">No Sub-Admins Available</p>
                  <p className="transfer-no-members-desc">
                    Ownership can only be transferred to a Sub-Admin. 
                    Please promote a member to Sub-Admin before transferring ownership.
                  </p>
                </div>
              )}

              {error && <div className="settings-error">{error}</div>}
            </div>
            <div className="edit-rules-footer">
              <button className="edit-rules-cancel" onClick={() => setShowTransferModal(false)}>
                Cancel
              </button>
              <button
                className="edit-rules-save warning"
                onClick={handleTransferOwnership}
                disabled={!transferTarget || transferLoading}
              >
                {transferLoading ? 'Transferring...' : 'Transfer Ownership'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Community Confirmation Modal */}
      {showDeleteModal && (
        <div className="add-member-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="add-member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-member-modal-header">
              <h3>Delete Community</h3>
              <button className="settings-close" onClick={() => setShowDeleteModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="add-member-modal-body">
              <div className="confirm-modal-content">
                <div className="confirm-modal-icon delete">
                  <TrashIcon />
                </div>
                <p className="confirm-modal-title">Permanently Delete This Community?</p>
                <p className="confirm-modal-desc">
                  This action is irreversible and cannot be undone. Once deleted:
                </p>
                <ul className="confirm-modal-list">
                  <li>All members will be removed immediately</li>
                  <li>All messages and shared content will be permanently erased</li>
                  <li>The community URL can never be used again</li>
                </ul>
                <div className="confirm-modal-community">
                  <div className="confirm-modal-avatar">
                    {community.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="confirm-modal-community-info">
                    <span className="confirm-modal-community-name">{community.name}</span>
                    <span className="confirm-modal-community-members">
                      {community.members?.length || 0} members will be affected
                    </span>
                  </div>
                </div>
              </div>
              {error && <div className="settings-error">{error}</div>}
            </div>
            <div className="edit-rules-footer">
              <button className="edit-rules-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                className="edit-rules-save danger"
                onClick={handleDeleteCommunity}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Community Confirmation Modal */}
      {showLeaveModal && (
        <div className="add-member-modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="add-member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-member-modal-header">
              <h3>Leave Community</h3>
              <button className="settings-close" onClick={() => setShowLeaveModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="add-member-modal-body">
              <div className="confirm-modal-content">
                <div className="confirm-modal-icon leave">
                  <ExitIcon />
                </div>
                {isAdmin ? (
                  <>
                    <p className="confirm-modal-title">Ownership Transfer Required</p>
                    <p className="confirm-modal-desc">
                      As the community creator, you cannot leave without first transferring 
                      ownership to a Sub-Admin. This ensures the community continues to be 
                      managed after your departure.
                    </p>
                    <div className="confirm-modal-steps">
                      <div className="confirm-modal-step">
                        <span className="step-number">1</span>
                        <span className="step-text">Transfer ownership to a Sub-Admin</span>
                      </div>
                      <div className="confirm-modal-step">
                        <span className="step-number">2</span>
                        <span className="step-text">Then you can leave the community</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="confirm-modal-title">Leave This Community?</p>
                    <p className="confirm-modal-desc">
                      You are about to leave this community. Please review the following:
                    </p>
                    <ul className="confirm-modal-list">
                      <li>You will lose access to all community content and messages</li>
                      <li>You will be removed from the member list</li>
                      <li>You can rejoin later if the community is public</li>
                    </ul>
                  </>
                )}
                <div className="confirm-modal-community">
                  <div className="confirm-modal-avatar">
                    {community.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="confirm-modal-community-info">
                    <span className="confirm-modal-community-name">{community.name}</span>
                    <span className="confirm-modal-community-members">
                      {community.members?.length || 0} members
                    </span>
                  </div>
                </div>
              </div>
              {error && <div className="settings-error">{error}</div>}
            </div>
            <div className="edit-rules-footer two-buttons">
              <button className="edit-rules-stay" onClick={() => setShowLeaveModal(false)}>
                Stay
              </button>
              {isAdmin ? (
                <button
                  className="edit-rules-save warning"
                  onClick={() => {
                    setShowLeaveModal(false)
                    setShowTransferModal(true)
                  }}
                >
                  Transfer & Leave
                </button>
              ) : (
                <button
                  className="edit-rules-save danger"
                  onClick={handleLeaveCommunity}
                >
                  Leave Community
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
