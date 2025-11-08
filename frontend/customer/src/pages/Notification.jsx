import React, { useState } from 'react'
import './Notification.css'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Loading from '../components/Loading'
import { useEffect } from 'react'
import { IoCloseOutline } from "react-icons/io5";

// 🔹 Helper to format date & time like "Nov 6, 2025 • 12:20 PM"
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const timeOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  const formattedDate = date.toLocaleDateString('en-US', options);
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions).toLowerCase();
  return `${formattedDate} • ${formattedTime}`;
};


const Notification = () => {
  const { fetchNotifications, deleteNotification } = useContext(ShopContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fetchNotifications && Array.isArray(fetchNotifications)) {
      const sortedNotifications = [...fetchNotifications].sort((a, b) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateB - dateA; // Newest first
      });
      setNotifications(sortedNotifications);
      setLoading(false);
    }
  }, [fetchNotifications]);


  const handleDeleteNotification = async (ID) => {
    if (ID) {
      setLoading(true);
      await deleteNotification(ID);
      setLoading(false);
    }
  }

  const handleReadNotification = (ID) => {
    // LATER THIS LOGIC
  }

  if (loading) return <Loading />;

  return (
    <div className="custNotif-container">
      <div className="custNotif-header">
        <p className="custNotif-title">Notifications</p>
      </div>

      {notifications.length === 0 ? (
        <div className="custNotif-empty">
          <p>No notifications available</p>
        </div>
      ) : (
        <ul className="custNotif-list">
          {notifications.map((notif) => (
            <li
              key={notif.ID}
              className={`custNotif-item ${notif.isRead ? 'read' : 'unread'}`}
              onClick={() => handleReadNotification(notif.ID)}
            >
              <div className="custNotif-avatar">
                <img src={assets.notification_icon} alt="Notification" />
                {!notif.isRead && <span className="custNotif-dot" />}
              </div>

              <div className="custNotif-content">
                <div className="custNotif-titleRow">
                  <b>{notif.title}</b>
                </div>
                <p className="custNotif-message">{notif.message}</p>
                <span className="custNotif-time">{formatDateTime(notif.createAt)}</span>
              </div>

              <button
                className="custNotif-dismiss"
                onClick={() => handleDeleteNotification(notif.ID)}
                aria-label="Dismiss"
              >
                <IoCloseOutline />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Notification
