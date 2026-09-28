import { test, expect } from '@playwright/test'

const EMPLOYEE = {
  email: 'ishara@ceylonroots.lk',
  password: 'Password123!',
}
const MANAGER = {
  email: 'ruwan@ceylonroots.lk',
  password: 'Password123!',
}

// A safe future weekday range in 2026 that is not a weekend and not one of the
// project holidays (Apr 13-14, May 1-2). Mon 2026-09-07 -> Tue 2026-09-08.
const START_DATE = '2026-09-07'
const END_DATE = '2026-09-08'

async function login(page, { email, password }) {
  await page.getByLabel(/email address/i).fill(email)
  await page.getByLabel(/^password$/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
}

async function logout(page) {
  await page.getByRole('button', { name: /logout/i }).click()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
}

test('employee applies for leave and manager approves it', async ({ page }) => {
  // Unique marker so the test never depends on existing rows, IDs, or order.
  const reason = `E2E apply-approve ${Date.now()}`

  // --- Employee: log in and apply ---
  await page.goto('/')
  await login(page, EMPLOYEE)

  // Dashboard is visible.
  await expect(
    page.getByRole('heading', { name: /apply for leave/i })
  ).toBeVisible()

  // Fill and submit the leave form.
  await page.getByLabel(/leave type/i).selectOption('1') // Annual Leave
  await page.getByLabel(/start date/i).fill(START_DATE)
  await page.getByLabel(/end date/i).fill(END_DATE)
  await page.getByLabel(/reason/i).fill(reason)
  await page.getByRole('button', { name: /submit request/i }).click()

  // Success feedback.
  await expect(
    page.getByText(/leave request submitted successfully/i)
  ).toBeVisible()

  // It shows up as PENDING in My Leave.
  const myLeaveRow = page.locator('tr', { hasText: reason })
  await expect(myLeaveRow).toContainText('PENDING')

  // --- Manager: log in and approve ---
  await logout(page)
  await login(page, MANAGER)

  await expect(
    page.getByRole('heading', { name: /leave approvals/i })
  ).toBeVisible()

  // Locate the newly created request by its unique reason and approve it.
  const card = page.locator('article', { hasText: reason })
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: /approve/i }).click()

  // Once approved it leaves the manager's PENDING approvals list.
  await expect(page.locator('article', { hasText: reason })).toHaveCount(0)

  // --- Employee: confirm the status is now APPROVED via the UI ---
  await logout(page)
  await login(page, EMPLOYEE)

  const approvedRow = page.locator('tr', { hasText: reason })
  await expect(approvedRow).toContainText('APPROVED')
})
