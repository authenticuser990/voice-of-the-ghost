import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { reports, moderation, users as usersApi } from '../api'
import ReportModal from '../components/ReportModal'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

export default function AdminDashboard({ onBack }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('reports')
  const [reportList, setReportList] = useState([])
  const [reportTotal, setReportTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [banForm, setBanForm] = useState({ username: '', reason: '', banType: 'TEMPORARY', duration: 1440 })
  const [banResult, setBanResult] = useState(null)
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'SAGE' || user?.role === 'BOTH'

  const loadReports = useCallback(async (status) => {
    setLoading(true)
    try {
      const data = await reports.getAll({ status, limit: 100 })
      setReportList(data.reports || [])
      setReportTotal(data.total || 0)
    } catch (err) {
      console.error('Load reports error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadLogs = useCallback(async () => {
    try {
      const data = await moderation.getLogs({ limit: 100 })
      setLogs(data.logs || [])
    } catch (err) {
      console.error('Load logs error:', err)
    }
  }, [])

  useEffect(() => {
    if (tab === 'reports') loadReports()
    if (tab === 'logs') loadLogs()
  }, [tab, loadReports, loadLogs])

  const handleResolve = async (id, status) => {
    try {
      await reports.resolve(id, status)
      loadReports()
    } catch (err) {
      console.error('Resolve error:', err)
    }
  }

  const handleBan = async (e) => {
    e.preventDefault()
    setError('')
    setBanResult(null)
    try {
      const userData = await usersApi.getByUsername(banForm.username)
      if (!userData?.id) throw new Error('User not found')
      const result = await moderation.banUser({
        userId: userData.id,
        reason: banForm.reason,
        banType: banForm.banType,
        duration: banForm.banType === 'TEMPORARY' ? parseInt(banForm.duration) : undefined,
      })
      setBanResult(result)
      setBanForm({ username: '', reason: '', banType: 'TEMPORARY', duration: 1440 })
    } catch (err) {
      setError(err.message)
    }
  }

  if (!isAdmin) {
    return (
      <div className="legal-page">
        <header className="chat-header">
          <button className="back-btn" onClick={onBack}><ArrowLeft /> Settings</button>
          <h2>Admin</h2>
        </header>
        <div className="legal-content">
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
            Admin access required.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="legal-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Settings</button>
        <h2>Admin Dashboard</h2>
      </header>

      <div className="admin-tabs">
        {['reports', 'ban', 'logs'].map((t) => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'reports' ? `Reports (${reportTotal})` : t === 'ban' ? 'Ban User' : 'Mod Logs'}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === 'reports' && (
          <div className="report-list">
            {loading ? (
              <p className="placeholder-text">Loading reports...</p>
            ) : reportList.length === 0 ? (
              <p className="placeholder-text">No reports to review.</p>
            ) : (
              reportList.map((r) => (
                <div key={r.id} className={`report-card ${r.status === 'PENDING' ? 'pending' : ''}`}>
                  <div className="report-header">
                    <span className={`report-status ${r.status.toLowerCase()}`}>{r.status}</span>
                    <span className="report-type">{r.contentType}</span>
                    <span className="report-reason">{r.reason}</span>
                  </div>
                  <div className="report-meta">
                    Reported by <strong>@{r.reporter?.username}</strong> · {new Date(r.createdAt).toLocaleDateString()}
                    {r.description && <p className="report-desc">{r.description}</p>}
                  </div>
                  {r.status === 'PENDING' && (
                    <div className="report-actions">
                      <button className="btn-danger-sm" onClick={() => handleResolve(r.id, 'ACTION_TAKEN')}>Action Taken</button>
                      <button className="btn-outline-sm" onClick={() => handleResolve(r.id, 'DISMISSED')}>Dismiss</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'ban' && (
          <form className="ban-form" onSubmit={handleBan}>
            {error && <div className="auth-error">{error}</div>}
            {banResult && (
              <div className="success-banner">
                {banResult.message} (Strikes: {banResult.strikes}/3)
              </div>
            )}

            <label>Username to ban</label>
            <input
              value={banForm.username}
              onChange={(e) => setBanForm({ ...banForm, username: e.target.value })}
              placeholder="Enter username"
              required
            />

            <label>Reason</label>
            <textarea
              value={banForm.reason}
              onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
              placeholder="Reason for the ban"
              required
              rows={2}
            />

            <label>Ban Type</label>
            <select value={banForm.banType} onChange={(e) => setBanForm({ ...banForm, banType: e.target.value })}>
              <option value="TEMPORARY">Temporary (minutes)</option>
              <option value="PERMANENT">Permanent</option>
            </select>

            {banForm.banType === 'TEMPORARY' && (
              <>
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={banForm.duration}
                  onChange={(e) => setBanForm({ ...banForm, duration: e.target.value })}
                  min={1}
                  required
                />
              </>
            )}

            <button type="submit" className="auth-submit">Apply Ban</button>
          </form>
        )}

        {tab === 'logs' && (
          <div className="log-list">
            {logs.length === 0 ? (
              <p className="placeholder-text">No moderation logs.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="log-entry">
                  <span className="log-action">{log.action}</span>
                  <span className="log-target">{log.targetType}:{log.targetId?.slice(0, 8)}...</span>
                  <span className="log-admin">by @{log.admin?.username}</span>
                  <span className="log-time">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
