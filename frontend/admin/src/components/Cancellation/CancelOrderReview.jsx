import React, { useEffect, useMemo, useState, useRef } from "react";
import "./CancelOrderReview.css";
import { FaTrashCan, FaArrowLeft } from "react-icons/fa6";
import CancelReason from "./CancelReason";
import CancelReview from "./CancelReview";
import AdminCancel from "./AdminCancel";
import CustomerCancel from "./CustomerCancel";

function CancelOrderReview({ order = null, onClose = () => {} }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [openDropdown, setOpenDropdown] = useState(null);
  const [reasonItem, setReasonItem] = useState(null); // modal (unused now)
  const [detailViewItem, setDetailViewItem] = useState(null); // NEW: item shown in full-page CancelReason
  const searchRef = useRef(null);

  useEffect(() => {
    if (order) {
      // keep original item.status (used for display) but we no longer expose a dropdown to change it
      setItems(order.items.map(i => ({ ...i, status: i.status || order.status || "Pending" })));
      setSelected(new Set());
      setSearch("");
      setOpenDropdown(null);
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
    } else {
      allVisibleIds.forEach(id => next.add(id));
    }
    setSelected(next);
  };

  const toggleSelect = id => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const deleteItem = id => {
    if (!window.confirm(`Delete item #${id}?`)) return;
    setItems(prev => prev.filter(it => it.id !== id));
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className="view-all-wrapper">
      {/* global top bar (always visible, outside the card) */}
      <div className="view-all-topbar" style={{ justifyContent: "flex-start" }}>
        <button
          className="back-btn"
          type="button"
          onClick={() => {
            if (detailViewItem) setDetailViewItem(null);
            else onClose();
          }}
        >
          <FaArrowLeft />
        </button>

        <div className="order-title" style={{ marginLeft: 12 }}>
          {order ? `Order #${order.id}` : "Order #—"}
        </div>
      </div>

      <div className="view-all-content">
        {/* If detailViewItem is set, render ONLY the CancelReason view (replace the card/list).
            This prevents the list from still being visible behind the CancelReason UI. */}
        {detailViewItem ? (
          <div className="card1">
            <div style={{ paddingTop: 0 }}>
              {detailViewItem.mode === "review" ? (
                <CancelReview item={detailViewItem.item} order={order} onClose={() => setDetailViewItem(null)} />
              ) : detailViewItem.mode === "admin" ? (
                <AdminCancel item={detailViewItem.item} order={order} onClose={() => setDetailViewItem(null)} />
              ) : detailViewItem.mode === "customer" ? (
                <CustomerCancel item={detailViewItem.item} order={order} onClose={() => setDetailViewItem(null)} />
              ) : (
                <CancelReason item={detailViewItem.item} order={order} onClose={() => setDetailViewItem(null)} />
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-header sticky">
              <div className="header-left">
                <label className="all-checkbox">
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
              </div>
            </div>

            <div className="divider" />

            <ul className="items-list" role="list">
              {visible.map((item, idx) => {
                // first visible item => Reason, others => Review
                const actionLabel = idx === 0 ? "Reason" : "Review";
                const isReviewAction = actionLabel === "Review";

                // detect Cash On Delivery methods
                const isCOD = /(cash|cod|cash on delivery)/i.test(order?.method || "");

                // override status text for cancelled states per requirement
                const syntheticStatus = isReviewAction
                  ? "Cancelled by You (Processing)"
                  : "Cancelled by User (Processing)";

                const statusParts = (syntheticStatus || "").match(/^(.*?)(?:\s*\((.*)\))?$/);
                const mainLabel = statusParts ? statusParts[1].trim() : syntheticStatus;
                const bracket = statusParts && statusParts[2];

                return (
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
                        <span
                          className="status-dot"
                          style={{
                            background: syntheticStatus && syntheticStatus.startsWith("Cancelled by") ? "#FF3333" : "#FF3333"
                          }}
                        />
                        <span className="status-label">
                          {mainLabel} {bracket && <strong className="status-bracket">({bracket})</strong>}
                        </span>
                      </div>
                    </div>

                    <div className="col pay-col">
                      <div className="pay-meta">
                        <div className="pay-method"><span className="small-label">Payment Method:</span> <span className="method-val">{order?.method || "—"}</span></div>
                      </div>

                      <div className="status-pick">
                        {/* show trash for Review items */}
                        {isReviewAction && (
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
                          className={`action-btn ${isReviewAction ? "review-btn" : "reason-btn"}`}
                          type="button"
                          aria-label={actionLabel}
                          onClick={() => {
                            // If this is a Review action and the order is COD, open AdminCancel view
                            if (isReviewAction && isCOD) {
                              setDetailViewItem({ item, mode: "admin" });
                            } else if (!isReviewAction && isCOD) {
                              // If this is the Reason action and the order is COD, open CustomerCancel view
                              setDetailViewItem({ item, mode: "customer" });
                            } else {
                              // open the full detail view with mode so we can render CancelReview vs CancelReason
                              setDetailViewItem({ item, mode: isReviewAction ? "review" : "reason" });
                            }
                          }}
                        >
                          {actionLabel} <span className="notif-dot" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}

              {visible.length === 0 && <li className="empty-row">No items found.</li>}
            </ul>

            {/* legacy modal kept (optional) */}
            {reasonItem && (
              <div
                className="reason-modal-overlay"
                onClick={() => setReasonItem(null)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
              >
                <div
                  className="reason-modal"
                  onClick={(e) => e.stopPropagation()}
                  style={{ background: "#fff", padding: 20, borderRadius: 8, maxWidth: 720, width: "min(96%,720px)" }}
                >
                  <CancelReason item={reasonItem} order={order} onClose={() => setReasonItem(null)} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default CancelOrderReview;