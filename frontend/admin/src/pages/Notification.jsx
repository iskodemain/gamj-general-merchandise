import React, { useContext, useState, useEffect } from 'react';
import './notification.css';
import Navbar from '../components/Navbar';
import { AdminContext } from '../context/AdminContextProvider';
import { assets } from '../assets/assets';

function Notification() {
    const { fetchNotifications } = useContext(AdminContext);
    const [notifications, setNotifications] = useState([]);

    // Update notifications when fetchNotifications changes
    useEffect(() => {
        if (fetchNotifications && Array.isArray(fetchNotifications)) {
            // Filter only Admin notifications
            const adminNotifications = fetchNotifications.filter(
                n => n.receiverType === 'Admin'
            );
            setNotifications(adminNotifications);
        }
    }, [fetchNotifications]);

    // Format time ago
    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        
        const years = Math.floor(months / 12);
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }

    // Get initials from title
    function initials(title) {
        if (!title) return '??';
        
        // Handle specific notification types
        if (title.includes('Low Stock') || title.includes('Stock')) return 'LS';
        if (title.includes('Congratulations')) return 'CO';
        if (title.includes('Order Cancellation')) return 'OC';
        if (title.includes('Cancelled')) return 'OC';
        
        // Get first 2 words and take first letter of each
        return title
            .split(' ')
            .slice(0, 2)
            .map(s => s[0])
            .join('')
            .toUpperCase();
    }

    // Refresh notifications from context
    function refresh() {
        if (fetchNotifications && Array.isArray(fetchNotifications)) {
            // Filter only Admin notifications
            const adminNotifications = fetchNotifications.filter(
                n => n.receiverType === 'Admin'
            );
            setNotifications(adminNotifications);
        }
    }

    return (
        <>
            <Navbar TitleName="Notifications"/>

            <div className="notif-container">
                <div className="notif-header">
                    <h2 className="notif-header-title">
                        All Notifications
                        {notifications.length > 0 && (
                            <span className="notif-badge-count">{notifications.length}</span>
                        )}
                    </h2>
                </div>

                <div className="notif-list">
                    {notifications.length === 0 && (
                        <div className="notif-empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p>No notifications yet</p>
                        </div>
                    )}

                    {notifications.map(n => (
                        <div key={n.ID} className="notif-item">
                            <div className="notif-content-left">
                                <div className="notif-avatar">
                                    <img src={assets.admin_gamj_logo} alt="Admin Gamj Logo" />
                                </div>
                                <div className="notif-text-wrapper">
                                    <div className="notif-text-main">
                                        <span className="notif-title">{n.title}</span>
                                        <span className="notif-message"> {n.message}</span>
                                        <div className="notif-meta">
                                            <span className="notif-time">{timeAgo(n.createAt)}</span>
                                            <span className="notif-separator">•</span>
                                            <span className="notif-badge-receiver">{n.receiverType}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {notifications.length > 0 && (
                    <div className="notif-actions">
                        <button className="notif-btn notif-btn-refresh" onClick={refresh}>
                            Refresh
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default Notification;