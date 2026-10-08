
import { useState } from 'react'
import { createLeaveRequest } from './api'

function ApplyLeaveForm({ token, onCreated }) {
  const [leaveTypeId, setLeaveTypeId] = useState('1')
  const [dayPart, setDayPart] = useState('FULL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setError('')

    if (endDate < startDate) {
      setError('End date must be on or after start date.')
      return
    }

    setLoading(true)

    try {
      await createLeaveRequest(token, {
        leave_type_id: Number(leaveTypeId),
        start_date: startDate,
        end_date: endDate,
        reason,
        day_part: dayPart,
      })

      setMessage('Leave request submitted successfully.')
      setDayPart('FULL')
      setStartDate('')
      setEndDate('')
      setReason('')

      if (onCreated) {
        onCreated()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="leave-card">
      <div className="leave-card-header">
        <div>
          <span className="leave-eyebrow">
            LEAVE MANAGEMENT
          </span>

          <h2>Apply for Leave</h2>

          <p>
            Submit a new leave request for manager approval.
          </p>
        </div>

        <div className="leave-icon">
          📅
        </div>
      </div>

      <div className="form-divider" />

      <form onSubmit={handleSubmit} className="leave-form">

        {/* Leave Type */}
        <div className="form-group">
          <label htmlFor="leaveType">
            Leave Type
          </label>

          <select
            id="leaveType"
            value={leaveTypeId}
            onChange={(event) =>
              setLeaveTypeId(event.target.value)
            }
          >
            <option value="1">Annual Leave</option>
            <option value="2">Casual Leave</option>
            <option value="3">Sick Leave</option>
          </select>
        </div>

        {/* Duration */}
        <div className="form-group">
          <label htmlFor="dayPart">
            Duration
          </label>

          <select
            id="dayPart"
            value={dayPart}
            onChange={(event) => {
              const value = event.target.value
              setDayPart(value)
              // Half-days are a single date: mirror start → end.
              if (value !== 'FULL') {
                setEndDate(startDate)
              }
            }}
          >
            <option value="FULL">Full Day(s)</option>
            <option value="AM">Half Day (Morning - AM)</option>
            <option value="PM">Half Day (Afternoon - PM)</option>
          </select>
        </div>

        {/* Dates */}
        <div className="date-grid">

          <div className="form-group">
            <label htmlFor="startDate">
              Start Date
            </label>

            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => {
                const value = event.target.value
                setStartDate(value)
                // For a half-day the end date always equals the start date.
                if (dayPart !== 'FULL') {
                  setEndDate(value)
                }
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">
              End Date
            </label>

            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
              disabled={dayPart !== 'FULL'}
              required
            />
          </div>

        </div>

        {/* Reason */}
        <div className="form-group">
          <div className="label-row">
            <label htmlFor="reason">
              Reason
            </label>

            <span>Optional</span>
          </div>

          <textarea
            id="reason"
            rows="4"
            placeholder="Tell us briefly why you need leave..."
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
          />
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <div className="alert-icon">!</div>

            <div>
              <strong>Unable to submit</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="alert alert-success">
            <div className="alert-icon">✓</div>

            <div>
              <strong>Request submitted</strong>
              <p>{message}</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="button-spinner" />
              Submitting...
            </>
          ) : (
            <>
              Submit Request
              <span className="button-arrow">→</span>
            </>
          )}
        </button>

      </form>
    </div>
  )
}

export default ApplyLeaveForm
