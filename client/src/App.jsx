import { useState } from 'react'
import './App.css'
import Login from './Login'
import MyLeave from './MyLeave'
import LeaveBalance from './LeaveBalance'
import ApplyLeaveForm from './ApplyLeaveForm'
import Approvals from './Approvals'
import HrAdmin from './HrAdmin'

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [leaveRefreshKey, setLeaveRefreshKey] = useState(0)

  function handleLogin(loggedInUser) {
    setUser(loggedInUser)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const token = localStorage.getItem('token')

  return (
    <div className="app-container">
      <div className="app-content">

        <div className="dashboard-header">
          <span className="dashboard-eyebrow">
            LEAVEFLOW PORTAL
          </span>

          <h1 className="welcome-title">
            Welcome back, {user.name}
          </h1>

          <p className="welcome-subtitle">
            Manage your leave requests and track their status.
          </p>
        </div>

        {user.role === 'EMPLOYEE' && (
          <>
            <LeaveBalance token={token} />

            <MyLeave token={token} refreshKey={leaveRefreshKey} />

            <ApplyLeaveForm
              token={token}
              onCreated={() => setLeaveRefreshKey((key) => key + 1)}
            />
          </>
        )}

        {user.role === 'MANAGER' && (
          <Approvals token={token} />
        )}

        {user.role === 'HR_ADMIN' && (
          <HrAdmin token={token} />
        )}

        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>

      </div>
    </div>
  )
}

export default App