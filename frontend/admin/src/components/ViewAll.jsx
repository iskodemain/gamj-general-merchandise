import React, { useEffect, useMemo, useState, useRef } from "react";
import "./ViewAll.css";
import { FaTrashCan, FaArrowLeft } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";

const SELECT_ALL_STATUS_OPTIONS = [
  { key: "Pending", color: "#F5A623" },
  { key: "Processing", color: "#17A2A2" },
  { key: "Out for Delivery", color: "#2B7BEF" },
  { key: "Delivered", color: "#2FA14C" },
];

const STATUS_OPTIONS = [
  { key: "Pending", color: "#F5A623" },
  { key: "Processing", color: "#17A2A2" },
  { key: "Out for Delivery", color: "#2B7BEF" },
  { key: "Delivered", color: "#2FA14C" },
  { key: "Cancelled", color: "#e36666" },
];

function ViewAll({ order = null, onClose = () => {}, orderStatus = "" }) {

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showBulkStatus, setShowBulkStatus] = useState(false);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);

  const searchRef = useRef(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelItem, setCancelItem] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // ✅ CLICK OUTSIDE — SIMPLEST & BUG-FREE SOLUTION
  useEffect(() => {
    function handleClickOutside(e) {
      const isPill = e.target.closest(".vap-status-pill");
      const isMenu = e.target.closest(".vap-status-menu");

      if (!isPill && !isMenu) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!order) return;

    const filteredItems =
      orderStatus && order.items
        ? order.items.filter((i) => i.status === orderStatus)
        : order.items || [];

    setItems(filteredItems);
    setSelected(new Set());
    setSearch("");
    setOpenDropdown(null);
    setShowBulkStatus(false);
    setBulkDropdownOpen(false);
    setCancelModalOpen(false);
    setCancelItem(null);
  }, [order, orderStatus]);


  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return items;

    return items.filter(
      (i) =>
        (i.name || "").toLowerCase().includes(q) ||
        String(i.id).includes(q)
    );
  }, [items, search]);


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

  const changeStatus = (id, status) => {
    if (status === "Cancelled") {
      const item = items.find((i) => i.id === id);
      openCancelModalFor(item);
      setOpenDropdown(null);
      return; // STOP — do not update status
    }

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

  const deleteItem = (id) => {
    if (!window.confirm(`Delete item #${id}?`)) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    const next = new Set(selected);
    next.delete(id);
    setSelected(next);
  };

  const openCancelModalFor = (item) => {
  setCancelItem(item);
  setCancelModalOpen(true);
  setOpenDropdown(null);
};


  const submitCancel = () => {
    console.log("CANCEL ITEM:", cancelItem, "Reason:", cancelReason);
    setCancelModalOpen(false);
    setCancelItem(null);
  };

  return (
    <div className="vap-wrapper">
      <div className="vap-topbar">
        <button className="vap-back-btn" onClick={onClose}>
          <FaArrowLeft />
        </button>
        <div className="vap-order-title">
          Order #{order?.orderId || "—"}
        </div>
      </div>

      <div className="vap-content">
        <div className="vap-card">
          <div className="vap-card-header">
            <div className="vap-header-left">
              <label className="vap-all-checkbox">
                <input
                  type="checkbox"
                  checked={
                    visible.length > 0 &&
                    visible.every((i) => selected.has(i.id))
                  }
                  onChange={toggleSelectAll}
                />
                <span className="vap-all-label">All ({selected.size})</span>
              </label>
            </div>

            <div className="vap-header-right">
              <div className="vap-search-wrap">
                <input ref={searchRef} className="vap-search-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
                <IoSearchOutline className="search-bar-item"/>
              </div>

              {showBulkStatus && (
                <div className="vap-bulk-status">
                  <div className="vap-bulk-dropdown">
                    <button
                      className="vap-bulk-pill"
                      onClick={() => setBulkDropdownOpen((v) => !v)}
                    >
                      <span
                        className="vap-pill-dot"
                        style={{
                          background:
                            SELECT_ALL_STATUS_OPTIONS.find((s) => s.key === bulkLabel)
                              ?.color || "#F5A623",
                        }}
                      />
                      <span className="vap-pill-label">{bulkLabel}</span>
                      ▾
                    </button>

                    {bulkDropdownOpen && (
                      <div className="vap-bulk-menu">
                        {SELECT_ALL_STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            className="vap-bulk-item"
                            onClick={() => changeStatusForSelected(opt.key)}
                          >
                            <span
                              className="vap-menu-dot"
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

          <div className="vap-divider" />

          <ul className="vap-list">
            {visible.length === 0 && (
              <li className="vap-empty">No items found.</li>
            )}
            {visible.map((item) => (
              <li key={item.id} className={`vap-row ${ selected.has(item.id) ? "vap-selected" : ""}`}>

                <div className="vap-item-col">
                  <div className="vap-row-left">
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="vap-row-checkbox"/>

                    <img className="vap-thumb" src={item.image} alt={item.name} />

                    <div className="vap-item-meta">
                      <div className="vap-item-name">{item.name}</div>

                      <div className="vap-item-sub">
                        <span className="vap-meta">Quantity: <span className="vap-qty-variant">{item.qty}</span> </span>
                        {item.value && (
                          <span className="vap-meta">Variant: <span className="vap-qty-variant">{item.value}</span></span>
                        )}
                      </div>

                      <div className="vap-item-price">
                        ₱{Number(item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="vap-status-col">
                  <div className="vap-status-inner">
                    <span
                      className="vap-status-dot"
                      style={{
                        background:
                          STATUS_OPTIONS.find((s) => s.key === item.status)
                            ?.color || "#F5A623",
                      }}
                    />
                    <span className="vap-status-label">{item.status}</span>
                  </div>
                </div>

                <div className="vap-pay-col">
                  <div className="vap-pay-meta">
                    <div className="vap-pay-method">
                      <span className="vap-small-label">Payment Method:</span>
                      <span className="vap-method-val">
                        {order?.method}
                      </span>
                    </div>
                  </div>

                  <div className="vap-status-pick" >
                    {item.status === "Delivered" && (
                      <button
                        className="vap-trash-btn"
                        onClick={() => deleteItem(item.id)}
                      >
                        <FaTrashCan />
                      </button>
                    )}

                    <button className="vap-status-pill" onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}>
                      <span className="vap-pill-label">{item.status}</span>
                      <IoIosArrowDown />
                    </button>

                    {openDropdown === item.id && (
                      <div className="vap-status-menu">
                        {STATUS_OPTIONS.map((opt) => (
                          <button key={opt.key} className="vap-status-item" onClick={() => changeStatus(item.id, opt.key)}>
                            <span className="vap-menu-dot" style={{ background: opt.color }} />
                            {opt.key}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                </div>

              </li>
            ))}
          </ul>
        </div>
      </div>

      {cancelModalOpen && cancelItem && (
        <div className="vap-modal-overlay">
          <div className="vap-modal">

            <button
              className="vap-modal-close"
              onClick={() => {
                setCancelModalOpen(false);
                setCancelItem(null);
              }}
            >
              ✕
            </button>

            <div className="vap-modal-header">Cancelled Item</div>
            <div className="vap-product-box">
              <img
                className="vap-product-image"
                src={cancelItem.image}
                alt={cancelItem.name}
              />

              <div className="vap-product-details">
                <div className="vap-product-name">{cancelItem.name}</div>

                <div className="vap-product-meta">
                  <div className="vap-cancel-qty">
                    <p>Quantity: </p>
                    {cancelItem.qty}
                  </div>
                  {cancelItem.value && 
                  <div className="vap-cancel-variant">
                    <p>Variant: </p> 
                    {cancelItem.value}
                  </div>}
                </div>

                <div className="vap-product-price">
                  ₱{Number(cancelItem.price).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="vap-cancel-title">Cancellation Reason</div>

            <textarea
              className="vap-cancel-input"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={6}
              placeholder="Reason for cancellation"
            />

            <div className="vap-cancel-actions">
              <button className="vap-cancel-submit" onClick={submitCancel}>
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
