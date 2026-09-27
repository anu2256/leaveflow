
import { useEffect, useState } from 'react'
import { getLeaveRequests } from './api'

function MyLeave({ token, refreshKey }) {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true)
        setError('')

        const data = await getLeaveRequests(token)
        setRequests(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [token, refreshKey])

  function formatDate(date) {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  function getStatusClass(status) {
    return status.toLowerCase()
  }

  return (
    <div className="my-leave-section">

      {/* Header */}
      <div className="my-leave-title">
        <div>
          <span className="leave-eyebrow">
            LEAVE HISTORY
          </span>

          <h2>My Leave Requests</h2>

          <p>
            Track your submitted leave requests and their status.
          </p>
        </div>

        <div className="request-count">
          <strong>{requests.length}</strong>
          <span>Requests</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="table-message">
          <span className="button-spinner dark-spinner" />
          Loading your requests...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="table-error">
          <span>!</span>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && requests.length === 0 && (
        <div className="table-empty">
          <div>📋</div>

          <h3>No leave requests yet</h3>

          <p>
            Your submitted requests will appear here.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && requests.length > 0 && (
        <div className="leave-table-wrapper">

          <table className="leave-table">

            <thead>
              <tr>
                <th>REQUEST</th>
                <th>LEAVE TYPE</th>
                <th>START DATE</th>
                <th>END DATE</th>
                <th>REASON</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>

                  <td>
                    <span className="request-number">
                      #{request.id}
                    </span>
                  </td>

                  <td>
                    <span className="leave-type">
                      {request.leave_type || 'Leave'}
                    </span>
                  </td>

                  <td>
                    {formatDate(request.start_date)}
                  </td>

                  <td>
                    {formatDate(request.end_date)}
                  </td>

                  <td>
                    <span className="reason-text">
                      {request.reason || '—'}
                    </span>

                    {request.status === 'REJECTED' &&
                      request.decision_note && (
                        <div className="rejection-note">
                          <strong>Reason:</strong>{' '}
                          {request.decision_note}
                        </div>
                      )}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${getStatusClass(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  )
}

export default MyLeave
