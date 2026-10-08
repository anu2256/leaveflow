import { useEffect, useState } from 'react'
import { getTeamRequests } from './api'

function HrAdmin({ token }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true)
        setError('')

        const data = await getTeamRequests(token)
        setRequests(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [token])

  function formatDate(date) {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  function countByStatus(status) {
    return requests.filter((request) => request.status === status).length
  }

  const cancelledCount = countByStatus('CANCELLED')

  const stats = [
    { label: 'Total Requests', value: requests.length, tone: 'total' },
    { label: 'Pending', value: countByStatus('PENDING'), tone: 'pending' },
    { label: 'Approved', value: countByStatus('APPROVED'), tone: 'approved' },
    { label: 'Rejected', value: countByStatus('REJECTED'), tone: 'rejected' },
  ]

  return (
    <div className="hr-section">

      {/* Header */}
      <div className="hr-header">
        <span className="dashboard-eyebrow">
          HR ADMINISTRATION
        </span>

        <h2>Leave Requests</h2>

        <p>Monitor and review all employee leave requests.</p>
      </div>

      {/* Stats */}
      <div className="hr-stats">
        {stats.map((stat) => (
          <div className={`hr-stat hr-stat-${stat.tone}`} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{loading ? '–' : stat.value}</strong>
          </div>
        ))}
      </div>

      {!loading && cancelledCount > 0 && (
        <p className="hr-stats-note">
          Total includes {cancelledCount} cancelled{' '}
          {cancelledCount === 1 ? 'request' : 'requests'}.
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="approval-error" role="alert">
          <span className="approval-error-icon">!</span>
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="approvals-loading">
          <span className="approvals-spinner" />
          <p>Loading leave requests...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && requests.length === 0 && (
        <div className="approvals-empty">
          <div className="empty-icon hr-empty-icon">📋</div>

          <h3>No leave requests found</h3>

          <p>
            Leave requests submitted by employees will appear here.
          </p>
        </div>
      )}

      {/* Request cards */}
      {!loading && requests.length > 0 && (
        <div className="hr-list">
          {requests.map((request) => (
            <article
              className={`approval-card hr-card ${request.status.toLowerCase()}`}
              key={request.id}
            >

              <div className="approval-card-top">
                <div className="employee-cell">
                  <div className="employee-avatar">
                    {request.employee_name
                      ? request.employee_name.charAt(0)
                      : '?'}
                  </div>

                  <div className="employee-info">
                    <strong>{request.employee_name}</strong>
                    <span>{request.employee_email}</span>
                  </div>
                </div>

                <div className="hr-card-meta">
                  <span className="request-number">
                    #{request.id}
                  </span>

                  <span className="approval-leave-type">
                    {request.leave_type || 'Leave'}
                  </span>

                  {request.day_part && request.day_part !== 'FULL' && (
                    <span className="half-day-badge">
                      {request.day_part}
                    </span>
                  )}
                </div>
              </div>

              <div className="approval-dates">
                <div className="approval-date">
                  <span>START</span>
                  <strong>{formatDate(request.start_date)}</strong>
                </div>

                <div className="approval-date-arrow">→</div>

                <div className="approval-date">
                  <span>END</span>
                  <strong>{formatDate(request.end_date)}</strong>
                </div>
              </div>

              <div className="approval-reason">
                <span>REASON</span>
                <p className={request.reason ? '' : 'muted'}>
                  {request.reason || 'No reason provided.'}
                </p>
              </div>

              <div className="hr-card-footer">
                <span
                  className={`status-badge ${request.status.toLowerCase()}`}
                >
                  {request.status}
                </span>

                {request.decided_at && (
                  <span className="hr-decided-at">
                    Decided {formatDate(request.decided_at)}
                  </span>
                )}
              </div>

              {request.decision_note && (
                <div
                  className={`hr-decision-note ${request.status.toLowerCase()}`}
                >
                  <span>
                    {request.status === 'REJECTED'
                      ? 'REJECTION REASON'
                      : 'DECISION NOTE'}
                  </span>
                  <p>{request.decision_note}</p>
                </div>
              )}

            </article>
          ))}
        </div>
      )}

    </div>
  )
}

export default HrAdmin
