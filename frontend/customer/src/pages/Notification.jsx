import React, { useState } from 'react'
import './Notification.css'

const Notification = () => {
  const [showList, setShowList] = useState(false)

  const handleShowNotifications = () => {
    setShowList(!showList)
  }

  return (
        <>
      <div className="notification-container">
        <p> Notifications</p>
      </div>
        </>
    
    
  )
}

export default Notification
