import { useState } from 'react'
import { login } from './api'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      <aside className="login-brand" aria-hidden="true">
        <div className="login-brand-shapes">
          <span className="shape shape-ring" />
          <span className="shape shape-grid" />
          <span className="shape shape-circle" />
        </div>

        <div className="login-brand-content">
          <div className="login-brand-mark">
            <span className="login-logo small">LF</span>
            <span>LeaveFlow</span>
          </div>

          <div className="login-brand-copy">
            <h2>LeaveFlow</h2>

            <p>
              Simple leave management for modern teams.
            </p>
          </div>

          <ul className="login-features">
            <li>
              <span className="feature-icon">✓</span>
              <div>
                <strong>Easy leave requests</strong>
                <span>Apply for leave in a few clicks.</span>
              </div>
            </li>

            <li>
              <span className="feature-icon">✓</span>
              <div>
                <strong>Clear approval tracking</strong>
                <span>Know exactly where every request stands.</span>
              </div>
            </li>

            <li>
              <span className="feature-icon">✓</span>
              <div>
                <strong>Real-time leave balances</strong>
                <span>See your remaining days at a glance.</span>
              </div>
            </li>
          </ul>

          <p className="login-brand-footer">
            © {new Date().getFullYear()} LeaveFlow
          </p>
        </div>
      </aside>

      <main className="login-panel">
        <div className="login-card">

          <div className="login-logo">
            LF
          </div>

          <div className="login-heading">
            <p className="eyebrow">LEAVE MANAGEMENT</p>

            <h1>Welcome back</h1>

            <p>
              Sign in to your LeaveFlow account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">

            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">
                  Password
                </label>
              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>

          <div className="login-footer">
            <span>LeaveFlow</span>
            <span>•</span>
            <span>Secure employee portal</span>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Login