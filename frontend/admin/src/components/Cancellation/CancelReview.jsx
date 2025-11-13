import React, { useState } from "react";
import './CancelReview.css';

function CancelReview({ item = null, order = null, onClose = () => {} }) {
  const [notes, setNotes] = useState(
`Marami pong kaming nakitang defect sa mask namin late na po namin na i-check.
Wag niyo rin pong kalimutan ibigay sa amin ang PayPal email address niyo para po maibalik namin ang pera sainyo. Yun lamang po salamat.`
  );

  // new state: toggle between edit view and summary view
  const [showSummary, setShowSummary] = useState(false);
  const [refundEmail, setRefundEmail] = useState("");

  const handleSave = () => {
    // instead of closing, show the summary view that replaces the previous one
    setShowSummary(true);
  };

  const handleProceed = () => {
    console.log("Proceed refund with email:", refundEmail);
    onClose();
  };

  if (showSummary) {
    return (
      <div className="cancel-reason-page">
        <div className="cancel-reason-root" role="dialog" aria-modal="true" aria-label="Refund summary">
          {/* Header Section (Top Left) */}
          <div className="customer-row">
            <div className="cust-left">
              <div className="avatar" aria-hidden="true">
                <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect width="64" height="64" rx="32" fill="#F6A34B"/>
                  <path d="M32 36c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9zM12 52c0-5 7-9 20-9s20 4 20 9v3H12v-3z" fill="#fff"/>
                </svg>
              </div>

              <div className="user-texts">
                <div className="org">Medical Hospital Cavite</div>
                <div className="muted">Customer</div>
                <div className="muted">Payment: Paid</div>
              </div>
            </div>

            <div className="cust-right">
              <select className="status-select" aria-label="Order status">
                <option>Processing</option>
                <option>Pending</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          {/* Product Information Box (Centered, Mid Section) */}
          <div className="product-box" role="group" aria-label="Product details">
            <div className="product-thumb" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="10" width="52" height="36" rx="6" fill="#E8F5FF"/>
                <rect x="12" y="6" width="40" height="8" rx="3" fill="#CFEFFF"/>
                <g fill="#6BB0E6"><rect x="18" y="20" width="28" height="4" rx="2"/><rect x="18" y="28" width="28" height="4" rx="2"/></g>
              </svg>
            </div>

            <div className="product-details">
              <div className="product-name">Disposable Face Mask (indoplas) – 50 pcs</div>
              <div className="product-sub">Quantity: 2 &nbsp; Size: 500ml &nbsp; Color: Blue</div>
              <div className="product-price">Price: ₱149.00</div>
            </div>

            <div className="product-payment" aria-hidden="true">
              <span className="payment-label">Payment:</span>
              <span className="paypal-badge">PayPal</span>
            </div>
          </div>

          {/* Refund Section (Below Product Box) */}
          <div className="refund-form" style={{ marginTop: 22 }}>
            <div className="summary-title">MEDICAL HOSPITAL CAVITE REFUND PROCESS</div>

            <label className="q-label1" style={{ textAlign: 'center', width: '100%' }}>
              Medical Hospital Cavite PayPal Email Address for Refund
            </label>

            <input
              className="summary-email-input"
              placeholder="sample@example.com"
              value={refundEmail}
              onChange={(e) => setRefundEmail(e.target.value)}
              aria-label="Medical Hospital Cavite PayPal Email Address"
            />

            <div className="proceed-row" style={{ width: '100%' }}>
              <button
                type="button"
                className="proceed-btn"
                onClick={handleProceed}
                disabled={!refundEmail.trim()}
                title={!refundEmail.trim() ? "Enter PayPal email address" : "Proceed with the Refund Process"}
              >
                Proceed with the Refund Process
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // original edit view
  return (
    <div className="cancel-reason-page">
      <div className="cancel-reason-root" role="dialog" aria-modal="true" aria-label="Cancel review card">
        {/* Top notice */}
        <div className="top-notice" role="alert">
          <span className="note-prefix">NOTE:</span>
          <span className="note-body"> WAITING FOR MEDICAL HOSPITAL CAVITE TO 
            <br />PROVIDE A PAYPAL EMAIL ADDRESS TO PROCESS 
            <br />THE REFUND.</span>
        </div>

        {/* Customer info + status */}
        <div className="customer-row">
          <div className="cust-left">
            <div className="avatar avatar-striped" aria-hidden="true">
              <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#F6C6A6" />
                    <stop offset="1" stopColor="#F2A57A" />
                  </linearGradient>
                </defs>
                <rect width="44" height="44" rx="22" fill="url(#g)"/>
                <g transform="translate(6,6)" fill="#2E2E2E" opacity="0.12">
                  <rect x="0" y="0" width="32" height="4" rx="2"/>
                  <rect x="0" y="8" width="32" height="4" rx="2"/>
                </g>
                <path d="M22 28c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z" fill="#fff" opacity="0.12"/>
              </svg>
            </div>

            <div className="user-texts">
              <div className="org">{item?.sellerName || "Medical Hospital Cavite"}</div>
              <div className="muted">Customer</div>
              <div className="muted">Payment: {order?.paid ? "Paid" : (order?.method || "Paid")}</div>
            </div>
          </div>

          <div className="cust-right">
            <select className="status-select" aria-label="status">
              <option>Processing</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Product order box */}
        <div className="product-box1">
          <div className="product-thumb" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="10" width="52" height="36" rx="6" fill="#E8F5FF"/>
              <rect x="12" y="6" width="40" height="8" rx="3" fill="#CFEFFF"/>
              <g fill="#6BB0E6"><rect x="18" y="20" width="28" height="4" rx="2"/><rect x="18" y="28" width="28" height="4" rx="2"/></g>
            </svg>
          </div>

          <div className="product-details">
            <div className="product-name">{item?.name || "Disposable Face Mask (Indoplas) – 50 pcs"}</div>
            <div className="product-sub">{`Quantity: ${item?.qty ?? 2}  Size: ${item?.size || "500ml"}  Color: ${item?.color || "Blue"}`}</div>
            <div className="product-price">{item?.price ? `₱${Number(item.price).toFixed(2)}` : "₱149.00"}</div>
          </div>

          <div className="product-payment">
            <span className="payment-label">Payment:</span>
            <span className="paypal-badge">PayPal</span>
          </div>
        </div>

        {/* Refund reason */}
        <div className="form-section">
          <label className="q-label">1. Admin Reason for Cancellation</label>
          <textarea
            className="multi-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            aria-label="Admin reason for cancellation"
          />
        </div>

        {/* Action */}
        <div className="action-row">
          <button
            className="primary-btn save-btn"
            type="button"
            onClick={handleSave}
            disabled={!notes.trim()}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelReview;