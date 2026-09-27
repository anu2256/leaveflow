import { useEffect, useState } from 'react'
import { getBalances } from './api'

const LEAVE_ICONS = {
  annual: '🌴',
  casual: '☕',
  sick: '🩺',
}

function LeaveBalance({ token }) {
  const [balances, setBalances] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const year = new Date().getFullYear()

  useEffect(() => {
    async function loadBalances() {
      try {
        setLoading(true)
        setError('')

        const data = await getBalances(token, year)
        setBalances(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadBalances()
  }, [token, year])

  // NUMERIC columns arrive from the API as strings (e.g. "2.0")
  function toNumber(value) {
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
  }

  function getLeaveName(name) {
    if (!name) return 'Leave'
    return /leave$/i.test(name) ? name : `${name} Leave`
  }

  function getIcon(name) {
    return LEAVE_ICONS[(name || '').toLowerCase()] || '📅'
  }

  return (
    <div className="balance-section">

      {/* Header */}
      <div className="balance-header">
        <span className="leave-eyebrow">
          LEAVE BALANCE · {year}
        </span>

        <h2>Your Leave Balance</h2>

        <p>See how many days you have left for each leave type.</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="balance-grid">
          {[0, 1, 2].map((item) => (
            <div className="balance-card balance-skeleton" key={item}>
              <span className="skeleton-line short" />
              <span className="skeleton-line tall" />
              <span className="skeleton-line" />
              <span className="skeleton-line bar" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="approval-error" role="alert">
          <span className="approval-error-icon">!</span>
          <p>{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && balances.length === 0 && (
        <div className="balance-empty">
          <div>📊</div>

          <h3>No leave balance available</h3>

          <p>
            Your leave allocation for {year} hasn't been set up yet.
            Please contact HR if you think this is a mistake.
          </p>
        </div>
      )}

      {/* Balance cards */}
      {!loading && !error && balances.length > 0 && (
        <div className="balance-grid">
          {balances.map((balance) => {
            const allocated = toNumber(balance.annual_allocation)
            const used = toNumber(balance.used_days)
            const remaining = toNumber(balance.remaining_days)

            const usedPercent = allocated > 0
              ? Math.min(100, Math.max(0, (used / allocated) * 100))
              : 0

            return (
              <div className="balance-card" key={balance.leave_type_id}>

                <div className="balance-card-top">
                  <div className="balance-icon">
                    {getIcon(balance.leave_type)}
                  </div>

                  <span className="balance-type">
                    {getLeaveName(balance.leave_type)}
                  </span>
                </div>

                <div className="balance-remaining">
                  <strong>{remaining}</strong>
                  <span>
                    {remaining === 1 ? 'day' : 'days'} remaining
                  </span>
                </div>

                <div
                  className="balance-progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(usedPercent)}
                  aria-label={`${used} of ${allocated} days used`}
                >
                  <div
                    className={`balance-progress-fill ${
                      usedPercent >= 100 ? 'full' : ''
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>

                <p className="balance-meta">
                  {allocated} allocated · {used} used
                </p>

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default LeaveBalance
