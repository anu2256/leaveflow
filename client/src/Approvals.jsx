import { useEffect, useState } from 'react'
import {
  getTeamRequests,
  decideLeaveRequest
} from './api'

function Approvals({ token }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [decisionNote, setDecisionNote] = useState({})
  const [processingId, setProcessingId] = useState(null)
  const [processingAction, setProcessingAction] = useState(null)

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

  useEffect(() => {
    loadRequests()
  }, [token])

  async function handleDecision(id, action) {
    const note = decisionNote[id] || ''

    if (action === 'reject' && !note.trim()) {
      setError('Please provide a reason when rejecting a request.')
      return
    }

    try {
      setProcessingId(id)
      setProcessingAction(action)
      setError('')

      await decideLeaveRequest(
        token,
        id,
        action,
        note
      )

      await loadRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessingId(null)
      setProcessingAction(null)
    }
  }

  function formatDate(date) {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="approvals-section">

      {/* Header */}
      <div className="approvals-header">
        <div>
          <span className="dashboard-eyebrow">
            TEAM MANAGEMENT
          </span>

          <h2>
            Leave Approvals
          </h2>

          <p>
            Review and manage your team's leave requests.
          </p>
        </div>

        <div className="pending-stat">
          <div className="pending-stat-icon">⏳</div>

          <div>
            <strong>{loading ? '–' : requests.length}</strong>
            <span>Pending</span>
          </div>
        </div>
      </div>

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
          <p>Loading team requests...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && requests.length === 0 && (
        <div className="approvals-empty">
          <div className="empty-icon">
            ✓
          </div>

          <h3>
            No pending requests
          </h3>

          <p>
            There are no leave requests waiting for approval.
          </p>
        </div>
      )}

      {/* Request cards */}
      {!loading && requests.length > 0 && (
        <div className="approval-list">
          {requests.map((request) => {
            const isProcessing = processingId === request.id

            return (
              <article className="approval-card" key={request.id}>

                <div className="approval-card-top">
                  <div className="employee-cell">
                    <div className="employee-avatar">
                      {request.employee_name
                        ? request.employee_name.charAt(0)
                        : '?'}
                    </div>

                    <div className="employee-info">
                      <strong>
                        {request.employee_name}
                      </strong>

                      <span>
                        {request.employee_email}
                      </span>
                    </div>
                  </div>

                  <span className="approval-leave-type">
                    {request.leave_type || 'Leave'}
                  </span>

                  {request.day_part && request.day_part !== 'FULL' && (
                    <span className="half-day-badge">
                      {request.day_part}
                    </span>
                  )}
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

                <div className="decision-cell">
                  <label htmlFor={`decision-note-${request.id}`}>
                    Rejection reason
                    <span>Required only when rejecting</span>
                  </label>

                  <textarea
                    id={`decision-note-${request.id}`}
                    rows="2"
                    placeholder="Reason for rejection..."
                    value={decisionNote[request.id] || ''}
                    onChange={(event) =>
                      setDecisionNote({
                        ...decisionNote,
                        [request.id]: event.target.value,
                      })
                    }
                  />

                  <div className="decision-buttons">

                    <button
                      className="reject-button"
                      disabled={isProcessing}
                      onClick={() =>
                        handleDecision(
                          request.id,
                          'reject'
                        )
                      }
                    >
                      {isProcessing && processingAction === 'reject' && (
                        <span className="button-spinner red-spinner" />
                      )}
                      Reject
                    </button>

                    <button
                      className="approve-button"
                      disabled={isProcessing}
                      onClick={() =>
                        handleDecision(
                          request.id,
                          'approve'
                        )
                      }
                    >
                      {isProcessing && processingAction === 'approve' && (
                        <span className="button-spinner" />
                      )}
                      Approve
                    </button>

                  </div>
                </div>

              </article>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default Approvals
