import React, { useEffect, useMemo, useState, useRef } from "react";
import "./ViewAll.css";
import { FaTrashCan, FaArrowLeft } from "react-icons/fa6";

const STATUS_OPTIONS = [
  { key: "Pending", color: "#F5A623" },
  { key: "Processing", color: "#17A2A2" },
  { key: "Out for Delivery", color: "#2B7BEF" },
  { key: "Delivered", color: "#2FA14C" },
  { key: "Cancelled", color: "#8c8d8e" },
];

function ViewAll({ order = null, onClose = () => {} }) {

  // -----------------------------
  // INTERNAL STATES
  // -----------------------------
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showBulkStatus, setShowBulkStatus] = useState(false);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);

  const searchRef = useRef(null);

  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelItem, setCancelItem] = useState(null);
  const [cancelReason, setCancelReason] = useState("");


  // -----------------------------
  // LOAD NEW ORDER
  // -----------------------------
  useEffect(() => {
    if (!order) return;

    setItems(order.items || []);
    setSelected(new Set());
    setSearch("");
    setOpenDropdown(null);
    setShowBulkStatus(false);
    setBulkDropdownOpen(false);
    setCancelModalOpen(false);
    setCancelItem(null);
  }, [order]);


  // -----------------------------
  // SEARCH FILTER
  // -----------------------------
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        (i.name || "").toLowerCase().includes(q) ||
        String(i.id).includes(q)
    );
  }, [items, search]);


  // -----------------------------
  // SELECT ALL
  // -----------------------------
  const toggleSelectAll = () => {
    const allIds = visible.map((i) => i.id);
    const next = new Set(selected);
    const allSelected = allIds.every((id) => next.has(id));

    if (allSelected) {
      allIds.forEach((id) => next.delete(id));
      setShowBulkStatus(false);
      setBulkDropdownOpen(false);
    } else {
      allIds.forEach((id) => next.add(id));
      setShowBulkStatus(true);
    }

    setSelected(next);
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);

    setSelected(next);
    setShowBulkStatus(next.size > 1);
    if (next.size === 0) setBulkDropdownOpen(false);
  };


  // -----------------------------
  // STATUS CHANGE
  // -----------------------------
  const changeStatus = (id, status) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
    setOpenDropdown(null);
  };

  const changeStatusForSelected = (status) => {
    setItems((prev) =>
      prev.map((i) =>
        selected.has(i.id) ? { ...i, status } : i
      )
    );
    setSelected(new Set());
    setShowBulkStatus(false);
    setBulkDropdownOpen(false);
  };

  const bulkLabel = useMemo(() => {
    if (selected.size === 0) return "Pending";
    const statuses = new Set();
    for (const id of selected) {
      const item = items.find((x) => x.id === id);
      statuses.add(item?.status || "Pending");
      if (statuses.size > 1) return "Pending";
    }
    return [...statuses][0];
  }, [selected, items]);


  // -----------------------------
  // DELETE ITEM (local)
  // -----------------------------
  const deleteItem = (id) => {
    if (!window.confirm(`Delete item #${id}?`)) return;
    setItems((prev) => prev.filter((i) => i.id !== id));

    const next = new Set(selected);
    next.delete(id);
    setSelected(next);
  };


  // -----------------------------
  // CANCEL MODAL
  // -----------------------------
  const openCancelModalFor = (item) => {
    setCancelItem(item);
    setCancelReason(
      `Magandang araw. Napansin namin na may sira ang natanggap na produkto (${item.name}). Nais naming humiling ng refund at ibalik ang bayad.`
    );
    setCancelModalOpen(true);
    setOpenDropdown(null);
  };

  const submitCancel = () => {
    console.log("CANCEL ITEM:", cancelItem, "Reason:", cancelReason);
    setCancelModalOpen(false);
    setCancelItem(null);
  };


  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="view-all-wrapper">

      {/* Top Bar */}
      <div className="view-all-topbar">
        <button className="back-btn" onClick={onClose}>
          <FaArrowLeft />
        </button>

        <div className="order-title">
          Order #{order?.orderId || "—"}
        </div>
      </div>


      {/* Main */}
      <div className="view-all-content">
        <div className="card">

          {/* HEADER */}
          <div className="card-header sticky">
            <div className="header-left">
              <label className="all-checkbox">
                <input
                  type="checkbox"
                  checked={
                    visible.length > 0 &&
                    visible.every((i) => selected.has(i.id))
                  }
                  onChange={toggleSelectAll}
                />
                <span className="all-label">All ({selected.size})</span>
              </label>
            </div>

            <div className="header-right">
              <div className="search-wrap">
                <input
                  ref={searchRef}
                  className="search-input"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {showBulkStatus && (
                <div className="bulk-status-bar">
                  <div className="bulk-dropdown">
                    <button
                      className="bulk-pill"
                      onClick={() => setBulkDropdownOpen((v) => !v)}
                    >
                      <span
                        className="pill-dot"
                        style={{
                          background:
                            STATUS_OPTIONS.find((s) => s.key === bulkLabel)
                              ?.color || "#F5A623",
                        }}
                      />
                      <span className="pill-label">{bulkLabel}</span>
                      ▾
                    </button>

                    {bulkDropdownOpen && (
                      <div className="bulk-menu">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            className="bulk-menu-item"
                            onClick={() => changeStatusForSelected(opt.key)}
                          >
                            <span
                              className="menu-dot"
                              style={{ background: opt.color }}
                            />
                            {opt.key}
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

          {/* ITEMS */}
          <ul className="items-list">
            {visible.map((item) => (
              <li
                key={item.id}
                className={`items-row ${
                  selected.has(item.id) ? "selected" : ""
                }`}
              >
                {/* LEFT */}
                <div className="col item-col">
                  <div className="row-left">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="row-checkbox"
                    />

                    <img className="thumb" src={item.image} alt={item.name} />

                    <div className="item-meta">
                      <div className="item-name">{item.name}</div>

                      <div className="item-sub">
                        <span className="meta">Quantity: {item.qty}</span>

                        {item.value && (
                          <span className="meta">{item.value}</span>
                        )}
                      </div>

                      <div className="item-price">
                        ₱{Number(item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* STATUS */}
                <div className="col status-col">
                  <div className="status-inner">
                    <span
                      className="status-dot"
                      style={{
                        background:
                          STATUS_OPTIONS.find((s) => s.key === item.status)
                            ?.color || "#F5A623",
                      }}
                    />
                    <span className="status-label">{item.status}</span>
                  </div>
                </div>

                {/* PAYMENT + STATUS PICK */}
                <div className="col pay-col">
                  <div className="pay-meta">
                    <div className="pay-method">
                      <span className="small-label">Payment Method:</span>
                      <span className="method-val">
                        {order?.method || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="status-pick">
                    {item.status === "Delivered" && (
                      <button
                        className="row-trash-btn"
                        onClick={() => deleteItem(item.id)}
                      >
                        <FaTrashCan />
                      </button>
                    )}

                    <button
                      className="status-pill"
                      onClick={() =>
                        item.status === "Cancelled"
                          ? openCancelModalFor(item)
                          : setOpenDropdown(
                              openDropdown === item.id ? null : item.id
                            )
                      }
                    >
                      <span
                        className="pill-dot"
                        style={{
                          background:
                            STATUS_OPTIONS.find((s) => s.key === item.status)
                              ?.color,
                        }}
                      />
                      <span className="pill-label">{item.status}</span>
                      ▾
                    </button>

                    {openDropdown === item.id && (
                      <div className="status-menu">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            className="status-menu-item"
                            onClick={() => changeStatus(item.id, opt.key)}
                          >
                            <span
                              className="menu-dot"
                              style={{ background: opt.color }}
                            />
                            {opt.key}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}

            {visible.length === 0 && (
              <li className="empty-row">No items found.</li>
            )}
          </ul>
        </div>
      </div>


      {/* CANCEL MODAL */}
      {cancelModalOpen && cancelItem && (
        <div className="cancel-modal-overlay">
          <div className="cancel-modal">

            <button
              className="cancel-modal-close"
              onClick={() => {
                setCancelModalOpen(false);
                setCancelItem(null);
              }}
            >
              ✕
            </button>

            <div className="cancel-modal-header">Cancel Order Item</div>

            <div className="cancel-product-box">
              <img
                className="product-image"
                src={cancelItem.image}
                alt={cancelItem.name}
              />

              <div className="product-details">
                <div className="product-name">{cancelItem.name}</div>

                <div className="product-meta">
                  <span>Quantity: {cancelItem.qty}</span>
                  {cancelItem.value && <span>{cancelItem.value}</span>}
                </div>

                <div className="product-price">
                  ₱{Number(cancelItem.price).toFixed(2)}
                </div>
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
              <button className="cancel-submit-btn" onClick={submitCancel}>
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
