import React, { useState } from 'react'
import './Notification.css'

const notificationData = [
  {
    id: 1,
    action: 'place an order #254845',
    timestamp: '9 hours ago',
    unread: true,
  },
  {
    id: 2,
    action: 'edit email address',
    timestamp: '2 days ago',
    unread: false,
  },
  {
    id: 3,
    action: 'cancel order #254845434',
    timestamp: '3 days ago',
    unread: true,
  },
  {
    id: 4,
    action: 'order processing',
    timestamp: '5 days ago',
    unread: false,
  },
 
]

const highlightAction = (action) => {
  // Highlight "place" and "cancel" keywords
  return action.replace(
    
    (match) =>
      `<span class="action-highlight">${match}</span>`
  )
}

const Notification = () => {
  const [notifications, setNotifications] = useState(notificationData)

  const handleDismiss = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  return (
    <div className="notification-container">
      <div className="notification-title">Notifications</div>
      <ul className="notification-list">
        {notifications.map((notif) => (
          <li
            className={`notification-item${/place|cancel/i.test(notif.action) ? ' highlighted' : ''}`}
            key={notif.id}
          >
            <div className="notification-avatar">
              <img
                src="https://ui-avatars.com/api/?name=Medical+Hospital+Cavite&background=red&color=fff&rounded=true"
                alt="avatar"
              />
              {notif.unread && <span className="notification-dot" />}
            </div>
            <div className="notification-content">
              <span className="notification-title-row">
                <b>Medical Hospital Cavite</b>
                <span
                  className="notification-action"
                  dangerouslySetInnerHTML={{
                    __html: highlightAction(notif.action),
                  }}
                />
              </span>
              <span className="notification-time">{notif.timestamp}</span>
            </div>
            <button
              className="notification-dismiss"
              onClick={() => handleDismiss(notif.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Notification
