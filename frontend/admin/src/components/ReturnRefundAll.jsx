import React, { useMemo, useState } from "react";
import "./returnRefundAll.css";
import ReviewRefund from "./ReviewRefund";
import { FaArrowLeft } from "react-icons/fa6";
const SAMPLE_ITEMS = [
  {
    id: 1,
    name: "Isopropyl Alcohol (Green Cross)",
    qty: 2,
    size: "500ml",
    color: null,
    price: 149.0,
    payment: "PayPal",
    img: "https://via.placeholder.com/72x56?text=IPA",
  },
  {
    id: 2,
    name: "Disposable Face Mask (Indoplas) – 50 pcs",
    qty: 2,
    size: "50 pcs",
    color: "Blue",
    price: 149.0,
    payment: "PayPal",
    img: "https://via.placeholder.com/72x56?text=Mask",
  },
];

function ReturnRefundAll({ order = null, onClose = () => {} }) {
  // Use items from the order when provided, otherwise fallback to sample data
  const itemsSource =
    order?.items?.map((it) => ({
      id: it.id,
      name: it.name,
      qty: it.qty ?? 1,
      size: it.size ?? "N/A",
      color: it.color ?? null,
      price: it.price ?? 0,
      payment: order?.method ?? "—",
      img: it.image || "https://via.placeholder.com/72x56?text=Item",
    })) ?? SAMPLE_ITEMS;

  const [items] = useState(itemsSource);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [reviewItem, setReviewItem] = useState(null); // NEW: item to review

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        (it.name || "").toLowerCase().includes(q) ||
        String(it.id).includes(q) ||
        (it.payment || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    const visibleIds = visible.map((v) => v.id);
    const allSelected = visibleIds.every((id) => selected.has(id));
    if (allSelected) {
      const next = new Set(selected);
      visibleIds.forEach((id) => next.delete(id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      visibleIds.forEach((id) => next.add(id));
      setSelected(next);
    }
  };

  return (
    <div className="rr-page">
      {/* TOPBAR: moved outside of the card as requested */}
      <div className="rr-topbar">
        <div className="rr-topbar-inner">
          <button className="rr-back" aria-label="Back" onClick={onClose}>
            <FaArrowLeft />
          </button>
          <div className="rr-top-title">
            <strong>Order No.</strong> {order ? `#${order.id}` : ""}
          </div>
        </div>
      </div>

      <div className="rr-card" role="region" aria-label="Return and refund list">
        {/* REPLACE: when reviewItem is set, show ReviewRefund in place of the list */}
        {reviewItem ? (
          <div className="rr-detail-replace">
            <ReviewRefund item={reviewItem} onClose={() => setReviewItem(null)} />
          </div>
        ) : (
          <>
            {/* HEADER now contains select-all on the left and search on the right for aligned baseline */}
            <div className="rr-header">
              <div className="rr-header-left">
                <label className="rr-all-checkbox header-all">
                  <input
                    type="checkbox"
                    checked={
                      visible.length > 0 && visible.every((i) => selected.has(i.id))
                    }
                    onChange={toggleSelectAll}
                  />
                  <span className="rr-all-label">All({selected.size})</span>
                </label>
              </div>

              <div className="rr-header-right">
                <div className="rr-search">
                  <input
                    className="rr-search-input"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search"
                  />
                  <svg
                    className="rr-search-icon"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </div>
            </div>

            <div className="rr-divider" />

            <ul className="rr-items" role="list">
              {visible.map((it) => (
                <li key={it.id} className="rr-item-row">
                  <div className="rr-item-left">
                    <input
                      type="checkbox"
                      className="rr-row-checkbox"
                      checked={selected.has(it.id)}
                      onChange={() => toggleSelect(it.id)}
                      aria-label={`select item ${it.id}`}
                    />
                    <img className="rr-thumb" src={it.img} alt={it.name} />
                    <div className="rr-item-meta">
                      <div className="rr-item-name">{it.name}</div>
                      <div className="rr-item-sub">
                        <span>Quantity: {it.qty}</span>
                        <span>Size: {it.size}</span>
                        {it.color && <span>Color: {it.color}</span>}
                      </div>
                      <div className="rr-item-price">
                        <strong>Price: ₱{Number(it.price).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="rr-item-middle">
                    <span className="rr-status">
                      <span className="rr-dot" aria-hidden="true" />
                      <em>Return/Refund (Pending)</em>
                    </span>
                  </div>

                  <div className="rr-item-right">
                    <div className="rr-payment">
                      Payment Method:{" "}
                      <span className="rr-payment-val">{it.payment}</span>
                    </div>
                    <button
                      className="rr-review-btn"
                      onClick={() => setReviewItem(it)}
                    >
                      Review
                    </button>
                  </div>
                </li>
              ))}

              {visible.length === 0 && <li className="empty-row">No items found.</li>}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default ReturnRefundAll;