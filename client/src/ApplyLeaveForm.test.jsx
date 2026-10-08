import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import ApplyLeaveForm from './ApplyLeaveForm'
import { createLeaveRequest } from './api'

// Mock the API module so tests never hit a real backend.
vi.mock('./api', () => ({
  createLeaveRequest: vi.fn(),
}))

describe('ApplyLeaveForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits a valid leave request and reports success', async () => {
    // Arrange
    const user = userEvent.setup()
    createLeaveRequest.mockResolvedValueOnce({ id: 1, status: 'PENDING' })
    const onCreated = vi.fn()

    render(<ApplyLeaveForm token="test-token" onCreated={onCreated} />)

    // Act
    await user.selectOptions(
      screen.getByLabelText(/leave type/i),
      '2' // Casual Leave
    )
    await user.type(screen.getByLabelText(/start date/i), '2026-07-06')
    await user.type(screen.getByLabelText(/end date/i), '2026-07-08')
    await user.type(
      screen.getByLabelText(/reason/i),
      'Family trip to Kandy'
    )
    await user.click(
      screen.getByRole('button', { name: /submit request/i })
    )

    // Assert — API called with the expected payload
    await waitFor(() => {
      expect(createLeaveRequest).toHaveBeenCalledTimes(1)
    })
    expect(createLeaveRequest).toHaveBeenCalledWith('test-token', {
      leave_type_id: 2,
      start_date: '2026-07-06',
      end_date: '2026-07-08',
      reason: 'Family trip to Kandy',
      day_part: 'FULL',
    })

    // Assert — success message shown and callback fired
    expect(
      await screen.findByText(/leave request submitted successfully/i)
    ).toBeInTheDocument()
    expect(onCreated).toHaveBeenCalledTimes(1)
  })

  test('blocks submission when the end date is before the start date', async () => {
    // Arrange
    const user = userEvent.setup()
    const onCreated = vi.fn()

    render(<ApplyLeaveForm token="test-token" onCreated={onCreated} />)

    // Act — end date earlier than start date
    await user.type(screen.getByLabelText(/start date/i), '2026-07-10')
    await user.type(screen.getByLabelText(/end date/i), '2026-07-06')
    await user.click(
      screen.getByRole('button', { name: /submit request/i })
    )

    // Assert — validation error shown, API and callback never invoked
    expect(
      await screen.findByText(/end date must be on or after start date/i)
    ).toBeInTheDocument()
    expect(createLeaveRequest).not.toHaveBeenCalled()
    expect(onCreated).not.toHaveBeenCalled()
  })
})
