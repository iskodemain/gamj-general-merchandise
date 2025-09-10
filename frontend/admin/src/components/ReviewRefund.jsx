import React, { useState, useRef, useEffect } from "react";
import "./reviewReturn.css";

function ReviewRefund({ item = null, onClose = () => {} }) {
  const customer = item?.customerName || "Medical Hospital Cavite";
  const paymentLabel = item?.payment || "Paid";

  const [status, setStatus] = useState("Pending");
  const [open, setOpen] = useState(false);
  const ddRef = useRef(null);
  const options = ["Pending", "Processing", "Successfully process"];

  const [reasonOption, setReasonOption] = useState(
    "Incomplete product received (missing items or accessories)"
  );
  const [reasonText, setReasonText] = useState(
    "I ordered 1,000 pieces of alcohol, but I only received 899."
  );
  const [solution, setSolution] = useState(
    "Resend Missing Items — For incomplete orders, resend the missing items instead of a full return."
  );

  // close on outside click or ESC
  useEffect(() => {
    function onDoc(e) {
      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="review-refund-container">
      <div className="rr-top-row">
        <div className="rr-customer">
          <div className="rr-avatar" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="40" height="40" xmlns="http://www.w3.org/2000/svg" fill="none">
              <rect width="48" height="48" rx="24" fill="#E6F7EE" />
              <g fill="#2A8F57">
                <circle cx="24" cy="16" r="8" />
                <path d="M12 38c1-6 11-6 12-6s11 0 12 6v2H12v-2z" />
              </g>
            </svg>
          </div>

          <div className="rr-customer-meta">
            <div className="rr-customer-name">{customer}</div>
            <div className="rr-customer-sub">Customer</div>
            <div className="rr-customer-sub">Payment: {paymentLabel}</div>
          </div>
        </div>

        <div className="rr-status-wrap">
          

          {/* custom dropdown */}
          <div className="rr-status-dropdown" ref={ddRef}>
            <button
              type="button"
              className={`rr-dd-toggle ${status === "Pending" ? "pending" : ""}`}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="rr-dd-value">{status}</span>
              <span className="rr-dd-chevron">v</span>
            </button>

            {open && (
              <ul className="rr-dd-menu" role="menu" aria-label="Status options">
                {options.map((opt) => (
                  <li key={opt} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={`rr-dd-option ${status === opt ? "active" : ""}`}
                      onClick={() => {
                        setStatus(opt);
                        setOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="rr-form-section">
        <h4 className="rr-section-title">Reason for Return Request</h4>

        <div className="rr-reason-display">
          Incomplete product received (missing items or accessories)
        </div>

        <textarea
          className="rr-reason-textarea"
          rows={4}
          value={reasonText}
          onChange={(e) => setReasonText(e.target.value)}
          aria-label="Reason details"
        />
      </div>

      <div className="rr-form-section">
        <h4 className="rr-section-title">Submitted Image Proof</h4>
        <div className="rr-thumbs">
          <img
            className="rr-thumb-img"
            src={item?.img || "https://images.unsplash.com/photo-1581574200006-6b2d3a3d0b5a?auto=format&fit=crop&w=400&q=60"}
            alt="proof 1"
          />
          <img
            className="rr-thumb-img"
            src="https://images.unsplash.com/photo-1598511720742-289c3b6d6a0f?auto=format&fit=crop&w=400&q=60"
            alt="proof 2"
          />
        </div>
      </div>

      <div className="rr-form-section">
        <h4 className="rr-section-title">Reason Request Solution</h4>
        <input
          className="rr-solution-input"
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          aria-label="Proposed solution"
        />
      </div>

      <div className="rr-actions">
        <button
          className="rr-reject-btn"
          onClick={() => {
            window.alert("Reject Request");
            if (onClose) onClose();
          }}
        >
          Reject Request
        </button>
      </div>
    </div>
  );
}

export default ReviewRefund;