import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const ROLES = [
  { value: 'SAGE', label: 'Sage — A good listener & advisor' },
  { value: 'HELPSEEKER', label: 'Help Seeker — Looking for support' },
  { value: 'BOTH', label: 'Both — I want to give & receive help' },
]

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'HELPSEEKER', dateOfBirth: '', agreedToTos: false,
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (mode === 'register') {
        if (!form.agreedToTos) {
          throw new Error('You must agree to the Terms of Service to create an account')
        }
        await register(form)
      } else {
        await login({ username: form.username, password: form.password })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-icon">👻</span>
          <h1>Voice of the Ghost</h1>
          <p className="tagline">You are not alone. Speak your truth.</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError('') }}
          >
            Sign In
          </button>
          <button
            className={`tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError('') }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a unique username"
              required
              minLength={3}
              autoComplete="username"
            />
          </div>

          {mode === 'register' && (
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
          )}

          {mode === 'register' && (
            <div className="field">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
              required
              minLength={8}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {mode === 'register' && (
            <div className="field">
              <label>I am a...</label>
              <div className="role-options">
                {ROLES.map((r) => (
                  <label key={r.value} className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={form.role === r.value}
                      onChange={handleChange}
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {mode === 'register' && (
            <label className="checkbox-label tos-agree">
              <input
                type="checkbox"
                name="agreedToTos"
                checked={form.agreedToTos}
                onChange={handleChange}
              />
              <span>
                I agree to the <strong>Terms of Service</strong>, <strong>Privacy Policy</strong>, and <strong>Content Policy</strong> (including NSFW content rules).
              </span>
            </label>
          )}

          <button type="submit" className="auth-submit">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          {mode === 'login' ? (
            <>No account? <button className="link-btn" onClick={() => setMode('register')}>Sign up</button></>
          ) : (
            <>Already have an account? <button className="link-btn" onClick={() => setMode('login')}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}
