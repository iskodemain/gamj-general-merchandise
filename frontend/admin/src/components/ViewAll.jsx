import React, { useEffect, useMemo, useState, useRef, useContext } from "react";
import "./ViewAll.css";
import { FaTrashCan, FaArrowLeft } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import Loading from "../components/Loading.jsx"
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { toast } from "react-toastify";

const SELECT_ALL_STATUS_OPTIONS = [
  { key: "Pending", color: "#FFA600" },
  { key: "Processing", color: "#00E3B6" },
  { key: "Out for Delivery", color: "#656DFF" },
  { key: "Delivered", color: "#00DD31" },
];

const STATUS_OPTIONS = [
  { key: "Pending", color: "#FFA600" },
  { key: "Processing", color: "#00E3B6" },
  { key: "Out for Delivery", color: "#656DFF" },
  { key: "Delivered", color: "#00DD31" },
  { key: "Cancelled", color: "#e36666" },
];

function ViewAll({ order = null, onClose = () => {}, orderStatus = "" }) {
  const { handleChangeOrderStatus, adminDeleteOrderItem, addOrderDeliveryProof, fetchOrderDeliveryProof, toastError } = useContext(AdminContext);
  const [loading, setLoading] = useState(false);

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

  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryItems, setDeliveryItems] = useState([]);

  const [riderName, setRiderName] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProof, setReviewProof] = useState(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const deliverySummary = useMemo(() => {
    const totalQty = deliveryItems.reduce((sum, i) => sum + Number(i.qty || 0), 0);

    const totalAmount = deliveryItems.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0),
      0
    );

    return { totalQty, totalAmount };
  }, [deliveryItems]);

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

    let filteredItems =
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

  const changeStatus = async (id, status) => {
    if (status === "Delivered") {
      const item = items.find((i) => i.id === id);

      setDeliveryItems([item]);
      setDeliveryModalOpen(true);
      setOpenDropdown(null);

      return; // STOP status change until proof submitted
    }

    if (status === "Cancelled") {
      const item = items.find((i) => i.id === id);
      openCancelModalFor(item);
      setOpenDropdown(null);
      return;
    }

    setLoading(true);

    const payload = [
      {
        customerID: order.customerId,
        orderItemID: id,
        changeStatus: status,
      },
    ];

    const created = await handleChangeOrderStatus(payload);

    setLoading(false);
    setOpenDropdown(null);

    if (created) {
      setTimeout(() => window.location.reload(), 500);
    }
  };


  const changeStatusForSelected = async (status) => {
    if (selected.size === 0) return;

    if (status === "Delivered") {

      const selectedItems = [...selected].map(id =>
        items.find(i => i.id === id)
      );

      setDeliveryItems(selectedItems);
      setDeliveryModalOpen(true);
      setBulkDropdownOpen(false);

      return;
    }

    setLoading(true);

    const payload = [...selected].map((id) => ({
      customerID: order.customerId,
      orderItemID: id, // priority to change
      changeStatus: status, // priority to change
    }));

    const created = await handleChangeOrderStatus(payload);

    setLoading(false);
    setBulkDropdownOpen(false);

    if (created) {
      setSelected(new Set());
      setShowBulkStatus(false);
      setTimeout(() => window.location.reload(), 500);
    }
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


  const submitCancel = async() => {
    if (!cancelItem) return;

    setLoading(true);

    const payload = [
      {
        customerID: order.customerId,
        orderItemID: cancelItem.id, // priority to change
        changeStatus: "Cancelled", // priority to change
        cancelComments: cancelReason, // priority to add
      },
    ];

    const created = await handleChangeOrderStatus(payload);
    setLoading(false);

    if (created) {
      setTimeout(() => window.location.reload(), 500);
    }

    setCancelModalOpen(false);
    setCancelItem(null);
  };

  const submitDeliveryProof = async () => {
    if (!deliveryItems.length) return;

    if (!riderName.trim() || !proofImage) {
      alert("Rider name and proof image are required.");
      return;
    }

    setLoading(true);

    // CREATE MULTIPLE DELIVERY PROOFS
    for (const item of deliveryItems) {

      const payload = {
        orderItemId: item.id,
        riderName: riderName,
        deliveryNotes: deliveryNotes,
        proofImage: proofImage
      };

      await addOrderDeliveryProof(payload);
    }

    // UPDATE ORDER STATUS FOR ALL
    const statusPayload = deliveryItems.map(item => ({
      customerID: order.customerId,
      orderItemID: item.id,
      changeStatus: "Delivered",
    }));

    await handleChangeOrderStatus(statusPayload);

    setDeliveryModalOpen(false);
    setDeliveryItems([]);
    setProofPreviewUrl(null);

    setTimeout(() => window.location.reload(), 500);

    setLoading(false);
  };

  // -------------------------------------------
  // INDIVIDUAL ITEM STATUS OPTIONS LOGIC
  // -------------------------------------------
  const getIndividualOptions = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return ["Processing", "Cancelled"];
      case "Processing":
        return ["Out for Delivery"];
      case "Out for Delivery":
        return ["Delivered"];
      case "Delivered":
        return []; // no dropdown
      default:
        return [];
    }
  };

  // -------------------------------------------
  // BULK STATUS OPTIONS LOGIC (based on orderStatus tab)
  // -------------------------------------------
  const getBulkOptions = () => {
    switch (orderStatus) {
      case "Pending":
        return ["Processing"];
      case "Processing":
        return ["Out for Delivery"];
      case "Out for Delivery":
        return ["Delivered"];
      case "Delivered":
        return []; // replaced with delete all
      default:
        return [];
    }
  };

  const openDeliveryProofReview = (itemId) => {

    const proof = fetchOrderDeliveryProof.find(
      (p) => p.orderItemId === itemId
    );

    if (!proof) {
      toast.error("Delivery proof not found.", { ...toastError });
      return;
    }

    setReviewProof(proof);
    setReviewModalOpen(true);

  };

  return (
    <div className="vap-wrapper">
      {loading && <Loading />}
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
                  
                  {/* If Delivered, show DELETE ALL instead of bulk dropdown */}
                  {orderStatus === "Delivered" ? (
                    <button
                      className="vap-trash-btn"
                      onClick={() => {
                        if (window.confirm("Delete all selected delivered items?")) {
                          [...selected].forEach(id => deleteItem(id));
                        }
                      }}
                    >
                      <FaTrashCan />
                    </button>
                  ) : (
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
                          {getBulkOptions().map((key) => {
                            const opt = SELECT_ALL_STATUS_OPTIONS.find(o => o.key === key);
                            return (
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
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

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

                  <div className="vap-status-pick">
                    {item.status === "Delivered" ? (
                      // ── DELIVERED STATE: ViewProof + Trash, NO pill ──
                      <div className="vap-delivered-actions">
                        <button
                          className="vap-review-btn"
                          onClick={() => openDeliveryProofReview(item.id)}
                        >
                          View Proof
                        </button>

                        <button
                          className="vap-trash-btn"
                          onClick={() => deleteItem(item.id)}
                        >
                          <FaTrashCan />
                        </button>
                      </div>

                    ) : (
                      // ── ALL OTHER STATUSES: pill + dropdown ──
                      <>
                        <button
                          className="vap-status-pill"
                          onClick={() =>
                            setOpenDropdown(openDropdown === item.id ? null : item.id)
                          }
                        >
                          <span className="vap-pill-label">{item.status}</span>
                          <IoIosArrowDown />
                        </button>

                        {openDropdown === item.id && (
                          <div className="vap-status-menu">
                            {getIndividualOptions(item.status).map((key) => {
                              const opt = STATUS_OPTIONS.find((o) => o.key === key);
                              return (
                                <button
                                  key={opt.key}
                                  className="vap-status-item"
                                  onClick={() => changeStatus(item.id, opt.key)}
                                >
                                  <span
                                    className="vap-menu-dot"
                                    style={{ background: opt.color }}
                                  />
                                  {opt.key}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
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

      {reviewModalOpen && reviewProof && (
        <div className="pod-modal-overlay">
          <div className="pod-modal">

            {/* Close */}
            <button
              className="pod-close-btn"
              onClick={() => {
                setReviewModalOpen(false);
                setReviewProof(null);
              }}
            >
              ✕
            </button>

            <div className="pod-header">Delivery Proof</div>

            <div className="pod-divider" />

            <div className="pod-fields">

              {/* Rider Name */}
              <div className="pod-field">
                <label>Rider Name</label>
                <input
                  type="text"
                  value={reviewProof.riderName}
                  disabled
                />
              </div>

              {/* Delivery Notes */}
              <div className="pod-field">
                <label>Delivery Notes</label>
                <textarea
                  value={reviewProof.deliveryNotes || ""}
                  rows={3}
                  disabled
                />
              </div>

              {/* Delivered At */}
              <div className="pod-field">
                <label>Delivered At</label>
                <input
                  type="text"
                  value={new Date(reviewProof.deliveredAt).toLocaleString()}
                  disabled
                />
              </div>

              {/* Proof Image */}
              <div className="pod-field">
                <label>Proof Image</label>

                <div className="pod-upload-zone pod-has-preview">

                  <div
                    className="pod-upload-preview-wrap"
                    style={{ cursor: "pointer" }}
                    onClick={() => setImagePreviewOpen(true)}
                  >

                    <img
                      className="pod-upload-preview"
                      src={reviewProof.proofImage}
                      alt="Proof"
                    />

                    <span className="pod-upload-preview-badge">
                      Click to view
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      
      {imagePreviewOpen && reviewProof && (
        <div
          className="vap-image-preview-overlay"
          onClick={() => setImagePreviewOpen(false)}
        >
          <div
            className="vap-image-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="vap-image-preview-close"
              onClick={() => setImagePreviewOpen(false)}
            >
              ✕
            </button>

            <div className="vap-image-preview-container">
              <img
                src={reviewProof.proofImage}
                alt="Delivery Proof"
                className="vap-image-preview-img"
              />
            </div>
          </div>
        </div>
      )}

      
      {deliveryModalOpen && deliveryItems.length > 0 && (
        <div className="pod-modal-overlay">
          <div className="pod-modal">

            {/* Close */}
            <button
              className="pod-close-btn"
              onClick={() => {
                setDeliveryModalOpen(false);
                setDeliveryItems([]);
                setProofPreviewUrl(null);
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div className="pod-header">Proof of Delivery</div>

            {/* Product snapshot */}
            {/* Selected Items */}
            <div className="pod-items-container">

              <div className="pod-items-header">
                {deliveryItems.length} item{deliveryItems.length > 1 ? "s" : ""} selected
              </div>

              <div className="pod-items-list">

                {deliveryItems.map((item) => {

                  const subtotal = Number(item.price || 0) * Number(item.qty || 0);

                  return (
                    <div key={item.id} className="pod-item-row">

                      <img
                        className="pod-item-img"
                        src={item.image}
                        alt={item.name}
                      />

                      <div className="pod-item-info">

                        <div className="pod-item-name">
                          {item.name}
                        </div>

                        <div className="pod-item-meta">

                          <span className="pod-meta">
                            Qty: {item.qty}
                          </span>

                          {item.value && (
                            <span className="pod-meta">
                              Variant: {item.value}
                            </span>
                          )}

                        </div>

                        <div className="pod-item-price">
                          ₱{Number(item.price).toFixed(2)}
                        </div>

                      </div>

                      <div className="pod-item-subtotal">
                        ₱{subtotal.toFixed(2)}
                      </div>

                    </div>
                  );
                })}

              </div>

              <div className="pod-summary">

                <div className="pod-summary-row">
                  <span>Total Quantity</span>
                  <span>{deliverySummary.totalQty}</span>
                </div>

                <div className="pod-summary-row pod-total">
                  <span>Total Amount</span>
                  <span>₱{deliverySummary.totalAmount.toFixed(2)}</span>
                </div>

              </div>

            </div>

            <div className="pod-divider" />

            {/* Form fields */}
            <div className="pod-fields">

              {/* Rider Name */}
              <div className="pod-field">
                <label>Rider Name *</label>
                <input
                  type="text"
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  placeholder="Enter rider name"
                />
              </div>

              {/* Delivery Notes */}
              <div className="pod-field">
                <label>Delivery Notes</label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional notes about the delivery"
                />
              </div>

              {/* Proof Image Upload */}
              <div className="pod-field">
                <label>Proof Image *</label>

                <div className={`pod-upload-zone ${proofPreviewUrl ? "pod-has-preview" : ""}`}>
                  {/* Hidden real file input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setProofImage(file);
                      if (file) setProofPreviewUrl(URL.createObjectURL(file));
                      else setProofPreviewUrl(null);
                    }}
                  />

                  {proofPreviewUrl ? (
                    /* ── Preview state ── */
                    <div className="pod-upload-preview-wrap">
                      <img
                        className="pod-upload-preview"
                        src={proofPreviewUrl}
                        alt="Proof preview"
                      />
                      <span className="pod-upload-preview-badge">
                        {proofImage?.name?.length > 20
                          ? proofImage.name.slice(0, 18) + "…"
                          : proofImage?.name}
                      </span>
                    </div>
                  ) : (
                    /* ── Empty / prompt state ── */
                    <>
                      <div className="pod-upload-icon">
                        {/* MdCloudUpload icon — swap for any react-icon you prefer */}
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                          <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                        </svg>
                      </div>
                      <span className="pod-upload-text">Click or tap to upload photo</span>
                      <span className="pod-upload-hint">JPG, PNG, WEBP · Max 10MB</span>
                    </>
                  )}

                  {/* Change photo label shown on top of preview */}
                  {proofPreviewUrl && (
                    <span className="pod-upload-change-label">Tap to change photo</span>
                  )}
                </div>
              </div>

            </div>

            {/* Submit */}
            <div className="pod-actions">
              <button className="pod-submit-btn" onClick={submitDeliveryProof}>
                Submit Delivery Proof
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ViewAll;