import React, { useState } from "react";
import './cancelReason.css';

import Refund from "../Cancellation/Refund";
function CancelReason({ item = null, order = null, onClose = () => {} }) {
  const [reason, setReason] = useState("Wrong Item Ordered");
  const [notes, setNotes] = useState("Nagkamali lang po ng order");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [showRefund, setShowRefund] = useState(false);

  const handleSubmit = () => {
    // show refund view with collected data
    setShowRefund(true);
  };

  const handleRefundClose = (completed = false) => {
    // if refund completed, notify parent; otherwise just go back to the form
    setShowRefund(false);
    if (completed) onClose();
  };

  if (showRefund) {
    return (
      <div className="cancel-reason-page">
        <div className="cancel-reason-root" role="dialog" aria-modal="true" aria-label="Refund card">
          <Refund
            item={item}
            order={order}
            reason={reason}
            notes={notes}
            paypalEmail={paypalEmail}
            onDone={() => handleRefundClose(true)}
            onBack={() => handleRefundClose(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="cancel-reason-page">
      <div className="cancel-reason-root" role="dialog" aria-modal="true" aria-label="Cancel reason card">
        <div className="top-section">
          <div className="top-left">
            <div className="avatar" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="#F6A34B"/>
                <path d="M12 13c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM4 20.5c0-2.5 3.581-4 8-4s8 1.5 8 4V22H4v-1.5z" fill="#fff"/>
              </svg>
            </div>
            <div className="user-texts">
              <div className="org">Medical Hospital Cavite</div>
              <div className="muted">Customer</div>
              <div className="muted">Payment: Paid</div>
            </div>
          </div>

          <div className="top-right">
            <button className="status-pill" type="button" aria-haspopup="listbox">
              Processing <span className="chev">▾</span>
            </button>
          </div>
        </div>

        <div className="item-card">
          <div className="product-img" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
              <rect x="18" y="8" width="28" height="40" rx="6" fill="#E6FDF0"/>
              <rect x="26" y="4" width="12" height="8" rx="2" fill="#D1F7D9"/>
              <rect x="30" y="22" width="4" height="12" fill="#9EE0A7"/>
            </svg>
          </div>

          <div className="product-meta">
            <div className="product-name">Isopropyl Alcohol (Green Cross)</div>
            <div className="product-sub">Quantity: 2 &nbsp; Size: 500ml</div>
            <div className="product-price">₱149.00</div>
          </div>

          <div className="payment-badge" aria-hidden="true">
            <span className="pay-label">Payment:</span>
            <span className="paypal-badge">PayPal</span>
          </div>
        </div>

        <div className="form-section">
          <label className="q-label">1. Reason for Cancellation</label>
          <input
            className="single-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-label="Reason for cancellation"
          />
          <textarea
            className="multi-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            aria-label="Additional notes"
          />

          <label className="q-label" style={{ marginTop: 16 }}>2. PayPal email address</label>
          <input
            className="single-input"
            placeholder="sample@example.com"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            aria-label="PayPal email address"
          />
        </div>

        <div className="action-row">
          <button
            className="primary-btn"
            type="button"
            onClick={handleSubmit}
            disabled={!paypalEmail.trim()}
          >
            Proceed with the Refund Process
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelReason;

