import React, { useState } from 'react';
import './notification.css';

function Notification() {
    const [notifications, setNotifications] = useState([
        { id: 1, institution: 'Medical Hospital Cavite', action: 'placed an order #254845', timeAgo: '9 hours ago', active: true },
        { id: 2, institution: 'St. Mary Clinic', action: 'canceled an order #254844', timeAgo: '1 day ago', active: true },
        { id: 3, institution: 'City Health Center', action: 'placed an order #254843', timeAgo: '2 days ago', active: false },
        { id: 4, institution: 'Green Valley Labs', action: 'sent a message', timeAgo: '3 days ago', active: false },
    ]);

    function dismiss(id) {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }

    function removeAll() {
        setNotifications([]);
    }

    function sendNotification() {
        const nextId = notifications.length ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
        const newNotif = {
            id: nextId,
            institution: 'New Medical Center',
            action: `placed an order #${Math.floor(100000 + Math.random() * 900000)}`,
            timeAgo: 'just now',
            active: true
        };
        setNotifications(prev => [newNotif, ...prev]);
    }

    function initials(name) {
        return name.split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase();
    }

    return (
        <div className="notification-card">
            <div className="card-header">
                <h2 className="header-title">All Notifications</h2>
            </div>

            <div className="notification-list">
                {notifications.length === 0 && (
                    <div className="empty-state">No notifications</div>
                )}

                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`notification-item ${n.active ? 'active' : ''}`}
                    >
                        <div className="left">
                            <div className="avatar" aria-hidden="true">
                                {initials(n.institution)}
                            </div>
                            <div className="text">
                                <div className="main">
                                    <span className="institution">{n.institution}</span>
                                    <span className="action"> {n.action}</span>
                                </div>
                                <div className="time">{n.timeAgo}</div>
                            </div>
                        </div>

                        <button
                            className="close-btn"
                            onClick={() => dismiss(n.id)}
                            aria-label={`Dismiss notification ${n.id}`}
                            title="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <div className="card-actions">
                <button className="btn send" onClick={sendNotification}>Send Notification</button>
                <button className="btn remove" onClick={removeAll}>Remove All</button>
            </div>
        </div>
    );
}
export default Notification;