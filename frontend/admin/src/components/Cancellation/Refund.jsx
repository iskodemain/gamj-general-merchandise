import React, { useState, useRef, useEffect } from "react";
import './refund.css';
import { FaCloudUploadAlt } from "react-icons/fa";

function Refund({
  item = { name: "Isopropyl Alcohol (Green Cross)", quantity: 2, size: "500ml", price: "₱149.00" },
  order = { id: "ORD-0001" },
  reason = "",
  notes = "",
  paypalEmail = "",
  onDone = () => {},
  onBack = () => {}
}) {
  const [transactionId, setTransactionId] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  // custom dropdown state
  const [status, setStatus] = useState("Refunded");
  const [open, setOpen] = useState(false);
  const ddRef = useRef(null);
  const options = ["Refunded", "Processing", "Pending"];

  useEffect(() => {
    const onDocClick = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : "");
  };

  const handleSubmit = () => {
    onDone({ transactionId, fileName, status });
  };

  return (
    <div className="refund-page">
      <div className="refund-card" role="dialog" aria-label="Refund confirmation">
        <div className="top-row">
          <div className="profile">
            <div className="avatar" aria-hidden="true">
              {/* simple flat avatar */}
              <svg width="48" height="48" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="64" height="64" rx="32" fill="#F6A34B"/>
                <path d="M32 36c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9zM12 52c0-5 7-9 20-9s20 4 20 9v3H12v-3z" fill="#fff"/>
              </svg>
            </div>
            <div className="profile-texts">
              <div className="customer-name">Medical Hospital Cavite</div>
              <div className="muted">Customer</div>
              <div className="muted">Payment: Paid</div>
            </div>
          </div>

          <div className="status-col">
            {/* custom dropdown */}
            <div
              className={`custom-select ${open ? "open" : ""}`}
              ref={ddRef}
            >
              <button
                type="button"
                className="custom-select__trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span className="custom-select__value">{status}</span>
                <span className="custom-select__caret" aria-hidden="true">▾</span>
              </button>

              {open && (
                <ul
                  className="custom-select__list"
                  role="listbox"
                  aria-label="Refund status options"
                >
                  {options.map((opt) => (
                    <li
                      key={opt}
                      role="option"
                      aria-selected={opt === status}
                      tabIndex={0}
                      className={`custom-select__option ${opt === status ? "selected" : ""}`}
                      onClick={() => { setStatus(opt); setOpen(false); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") { setStatus(opt); setOpen(false); }
                      }}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="product-box1" role="group" aria-label="Product order">
          <div className="product-thumb" aria-hidden="true">
            {/* simple bottle illustration */}
            <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <rect x="18" y="8" width="28" height="40" rx="6" fill="#E6FDF0"/>
              <rect x="26" y="4" width="12" height="8" rx="2" fill="#D1F7D9"/>
              <rect x="30" y="22" width="4" height="12" fill="#9EE0A7"/>
            </svg>
          </div>

          <div className="product-meta">
            <div className="product-title">Isopropyl Alcohol (Green Cross)</div>
            <div className="product-sub">Quantity: 2 &nbsp; Size: 500ml</div>
            <div className="product-price">Price: ₱149.00</div>
          </div>

          <div className="payment-badge">
            <span className="pay-label">Payment:</span>
            <span className="paypal-logo">PayPal</span>
          </div>
        </div>

        <div className="section">
          <label className="section-title">1. Upload an image or screenshot of your refund payment receipt</label>
          <div className="upload-row">
            <button type="button" className="upload-btn" onClick={handleUploadClick}>
              <FaCloudUploadAlt className="upload-icon" />
              <span>Upload Proof of Refund Payment</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div className="file-name" aria-live="polite">{fileName || "No file selected"}</div>
          </div>
        </div>

        <div className="section">
          <label className="section-title">2. PayPal Transaction ID</label>
          <input
            className="txn-input"
            type="text"
            placeholder="Enter your PayPal Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            aria-label="PayPal Transaction ID"
          />
        </div>

        <div className="actions">
          <button
            type="button"
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!transactionId.trim() || !fileName}
            title={!transactionId.trim() || !fileName ? "Provide transaction ID and upload proof" : "Submit as Refunded"}
          >
            Submit as Refunded
          </button>
        </div>
      </div>
    </div>
  );
}

export default Refund;