import React, { useEffect, useMemo, useState, useRef } from "react";
import { assets } from "../assets/assets.js";
import "./ViewAll.css";
import { FaTrashCan, FaArrowLeft } from "react-icons/fa6";
const STATUS_OPTIONS = [
  { key: "Pending", color: "#F5A623" },
  { key: "Processing", color: "#17A2A2" },
  { key: "Out for Delivery", color: "#2B7BEF" },
  { key: "Delivered", color: "#2FA14C" },
  { key: "Cancelled", color: "#8c8d8e" }
];

function ViewAll({ order = null, onClose = () => {} }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [openDropdown, setOpenDropdown] = useState(null);
  const searchRef = useRef(null);
  const [showBulkStatus, setShowBulkStatus] = useState(false);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);

  // NEW: cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelItem, setCancelItem] = useState(null);
  const [cancelReason, setCancelReason] = useState(
    "Magandang araw. Napansin namin na may sira ang natanggap na produkto. Nais naming humiling ng refund at ibalik ang bayad sa parehong paraan ng pagbabayad. Salamat po."
  );

  useEffect(() => {
    if (order) {
      setItems(order.items.map(i => ({ ...i, status: order.status || "Pending" })));
      setSelected(new Set());
      setSearch("");
      setOpenDropdown(null);
      setShowBulkStatus(false);
      setBulkDropdownOpen(false);
      // close modal when order changes
      setCancelModalOpen(false);
      setCancelItem(null);
    } else {
      setItems([]);
    }
  }, [order]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => (i.name || "").toLowerCase().includes(q) || String(i.id).includes(q));
  }, [items, search]);

  const toggleSelectAll = () => {
    const allVisibleIds = visible.map(i => i.id);
    const next = new Set(selected);
    const allSelected = allVisibleIds.every(id => next.has(id));
    if (allSelected) {
      allVisibleIds.forEach(id => next.delete(id));
      setShowBulkStatus(false);
      setBulkDropdownOpen(false);
    } else {
      allVisibleIds.forEach(id => next.add(id));
      setShowBulkStatus(true);
    }
    setSelected(next);
  };

  const toggleSelect = id => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setShowBulkStatus(next.size > 1); // show/hide bulk pill based on selection
    if (next.size === 0) setBulkDropdownOpen(false);
  };

  const changeStatus = (id, status) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, status } : it)));
    setOpenDropdown(null);
  };

  // determine label for bulk pill: if all selected share same status show it, otherwise show "Pending"
  const bulkLabel = useMemo(() => {
    if (selected.size === 0) return "Pending";
    const statuses = new Set();
    for (const id of selected) {
      const it = items.find(x => x.id === id);
      statuses.add(it ? it.status : "Pending");
      if (statuses.size > 1) break;
    }
    return statuses.size === 1 ? [...statuses][0] : "Pending";
  }, [items, selected]);

  // apply status to all selected items
  const changeStatusForSelected = (status) => {
    if (selected.size === 0) return;
    setItems(prev => prev.map(it => (selected.has(it.id) ? { ...it, status } : it)));
    setSelected(new Set());
    setShowBulkStatus(false);
    setBulkDropdownOpen(false);
  };
  
  // delete single item (used for delivered items only)
  const deleteItem = id => {
    if (!window.confirm(`Delete item #${id}?`)) return;
    setItems(prev => prev.filter(it => it.id !== id));
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // NEW: open cancel modal for an item
  const openCancelModalFor = (item) => {
    setCancelItem(item);
    setCancelReason(
      `Magandang araw. Napansin namin na may sira ang natanggap na produkto (${item.name}). Nais naming humiling ng refund at ibalik ang bayad sa parehong paraan ng pagbabayad. Salamat po.`
    );
    setCancelModalOpen(true);
    setOpenDropdown(null);
  };

  // NEW: submit cancellation (placeholder)
  const handleSubmitCancellation = () => {
    // implement actual cancellation logic here (API call etc.)
    console.log("Submitting cancellation for:", cancelItem?.id, { reason: cancelReason });
    setCancelModalOpen(false);
    setCancelItem(null);
  };
  
  return (
    <div className="view-all-wrapper">
      <div className="view-all-topbar">
        <button className="back-btn" type="button" onClick={onClose}><FaArrowLeft /></button>
        <div className="order-title">Order #{order ? order.id : "—"}</div>
      </div>

      <div className="view-all-content">
        <div className="card">
          <div className="card-header sticky">
            <div className="header-left">
              <label
                className="all-checkbox"
              >
                <input
                  type="checkbox"
                  aria-label="select all"
                  onChange={toggleSelectAll}
                  checked={visible.length > 0 && visible.every(i => selected.has(i.id))}
                />
                <span className="all-label">All({selected.size})</span>
              </label>
            </div>

            <div className="header-right">
              <div className="search-wrap">
                <input
                  ref={searchRef}
                  className="search-input"
                  placeholder="Search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

              {showBulkStatus && (
                <div className="bulk-status-bar" role="region" aria-label="Bulk status actions">
                  <div className="bulk-dropdown">
                    <button
                      type="button"
                      className="bulk-pill"
                      onClick={() => setBulkDropdownOpen(v => !v)}
                      aria-expanded={bulkDropdownOpen}
                      aria-haspopup="menu"
                    >
                      <span className="pill-dot" style={{ background: (STATUS_OPTIONS.find(s => s.key === bulkLabel) || {}).color }} />
                      <span className="pill-label">{bulkLabel}</span>
                      <span className="chev">▾</span>
                    </button>

                    {bulkDropdownOpen && (
                      <div className="bulk-menu" role="menu">
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            className="bulk-menu-item"
                            onClick={() => changeStatusForSelected(opt.key)}
                          >
                            <span className="menu-dot" style={{ background: opt.color }} /> {opt.key}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="divider" />

          <ul className="items-list" role="list">
            {visible.map(item => (
              <li key={item.id} className={`items-row ${selected.has(item.id) ? "selected" : ""}`}>
                <div className="col item-col">
                  <div className="row-left">
                    <input
                      type="checkbox"
                      className="row-checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      aria-label={`select item ${item.id}`}
                    />
                    <img className="thumb" src={item.image || "https://via.placeholder.com/64"} alt={item.name} />
                    <div className="item-meta">
                      <div className="item-name">{item.name}</div>
                      <div className="item-sub">
                        <span className="meta">Quantity: {item.qty}</span>
                        <span className="meta">Size: {item.size}</span>
                        {item.color && <span className="meta">Color: {item.color}</span>}
                      </div>
                      <div className="item-price">₱{Number(item.price).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="col status-col">
                  <div className="status-inner">
                    <span className="status-dot" style={{ background: (STATUS_OPTIONS.find(s => s.key === item.status) || {}).color || "#F5A623" }} />
                    <span className="status-label">{item.status}</span>
                  </div>
                </div>

                <div className="col pay-col">
                  <div className="pay-meta">
                    <div className="pay-method"><span className="small-label">Payment Method:</span> <span className="method-val">{order?.method || "—"}</span></div>
                  </div>

                  <div className="status-pick">
                    {/* show delete/trash only for delivered items */}
                    {item.status === "Delivered" && (
                      <button
                        className="row-trash-btn"
                        type="button"
                        aria-label={`Delete item ${item.id}`}
                        onClick={() => deleteItem(item.id)}
                      >
                        <FaTrashCan />
                      </button>
                    )}
                    <button
                      className="status-pill"
                      type="button"
                      onClick={() => {
                        if (item.status === "Cancelled") {
                          openCancelModalFor(item); // NEW: open modal when cancelled status clicked
                        } else {
                          setOpenDropdown(openDropdown === item.id ? null : item.id);
                        }
                      }}
                      aria-haspopup="true"
                      aria-expanded={openDropdown === item.id}
                    >
                      <span className="pill-dot" style={{ background: (STATUS_OPTIONS.find(s => s.key === item.status) || {}).color }} />
                      <span className="pill-label">{item.status}</span>
                      <span className="chev">▾</span>
                    </button>

                    {openDropdown === item.id && (
                      <div className="status-menu" role="menu">
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.key}
                            className="status-menu-item"
                            type="button"
                            onClick={() => changeStatus(item.id, opt.key)}
                          >
                            <span className="menu-dot" style={{ background: opt.color }} /> {opt.key}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}

            {visible.length === 0 && <li className="empty-row">No items found.</li>}
          </ul>
        </div>
      </div>

      {/* NEW: Cancel Order Item Modal */}
      {cancelModalOpen && cancelItem && (
        <div
          className="cancel-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Cancel Order Item"
          onMouseDown={(e) => {
            // close when clicking the backdrop
            if (e.target === e.currentTarget) {
              setCancelModalOpen(false);
              setCancelItem(null);
            }
          }}
        >
          <div className="cancel-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button
              className="cancel-modal-close"
              aria-label="Close cancel modal"
              onClick={() => { setCancelModalOpen(false); setCancelItem(null); }}
            >
              ✕
            </button>

            <div className="cancel-modal-header">Cancel Order Item</div>

            <div className="cancel-product-box">
              <img className="product-image" src={cancelItem.image || "https://via.placeholder.com/96"} alt={cancelItem.name} />
              <div className="product-details">
                <div className="product-name">{cancelItem.name || "Disposable Face Mask (indoplas) – 50 pcs"}</div>
                <div className="product-meta">
                  <span>Quantity: {cancelItem.qty ?? 1}</span>
                  <span>Size: {cancelItem.size ?? "—"}</span>
                  {cancelItem.color && <span>Color: {cancelItem.color}</span>}
                </div>
                <div className="product-price">₱{Number(cancelItem.price ?? 149).toFixed(2)}</div>
              </div>
            </div>

            <div className="cancel-section-title">Cancellation Reason</div>

            <textarea
              className="cancel-reason-input"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={6}
            />

            <div className="cancel-actions">
              <button
                className="cancel-submit-btn"
                type="button"
                onClick={handleSubmitCancellation}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ViewAll;