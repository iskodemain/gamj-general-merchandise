import React, { useContext, useEffect, useMemo, useState } from "react";
import "./ReviewRefund.css";
import { AdminContext } from "../../context/AdminContextProvider.jsx";
import { FaArrowLeft } from "react-icons/fa6";
import Loading from "../../../../customer/src/components/Loading.jsx";
import { toast } from "react-toastify";

/* ─── SMALL MODALS ─────────────────────────────────────────────────────────── */
function RejectReasonModal({ open, reason, setReason, onNext, onCancel }) {
  if (!open) return null;
  return (
    <div className="rr-modal-overlay">
      <div className="rr-modal rr-wide-modal">
        <h3 className="rr-modal-title">Return/Refund Rejected Reason</h3>
        <textarea className="rr-reject-textarea" placeholder="State the reason for rejecting this request..." value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="rr-modal-actions">
          <button className="rr-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="rr-modal-confirm" onClick={onNext} disabled={!reason.trim()}>Continue</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="rr-modal-overlay">
      <div className="rr-modal">
        <h3 className="rr-modal-title">{title}</h3>
        <p className="rr-modal-message">{message}</p>
        <div className="rr-modal-actions">
          <button className="rr-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="rr-modal-confirm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ─── READ-ONLY INFO BLOCK ──────────────────────────────────────────────────── */
function RefundInfoBlock({ refundRec, isPickup, existingPickupDate }) {
  const resolution = refundRec?.refundResolution || "";
  const refundMethod = refundRec?.refundMethod || "";
  const paypalEmail = refundRec?.refundPaypalEmail || "";
  const returnQuantity = refundRec?.returnQuantity || null;
  const returnMethod = refundRec?.returnMethod || null;
  return (
    <>
      <label className="rr-label">Reason for Return Request</label>
      <input className="rr-input" value={refundRec.reasonForRefund} readOnly />
      <label className="rr-label">Comment</label>
      <textarea className="rr-textarea" value={refundRec.refundComments || ""} readOnly />
      <label className="rr-label">Submitted Image Proof</label>
      <div className="rr-proof-row">
        <img src={refundRec.imageProof1} className="rr-proof-img" draggable="false" alt="proof 1" />
        <img src={refundRec.imageProof2} className="rr-proof-img" draggable="false" alt="proof 2" />
      </div>
      <label className="rr-label">Return Request Solution</label>
      <input className="rr-input" value={resolution} readOnly />
      {returnQuantity && (<><label className="rr-label">Return Quantity</label><input className="rr-input" value={`${returnQuantity} piece(s)`} readOnly /></>)}
      {returnMethod && (<><label className="rr-label">Return Method</label><input className="rr-input" value={returnMethod === "PICKUP" ? "Pickup" : "Drop-off"} readOnly /></>)}
      {isPickup && existingPickupDate && (<><label className="rr-label">Scheduled Pickup Date</label><input className="rr-input" value={existingPickupDate} readOnly /></>)}
      {(resolution === "Return and Refund" || resolution === "Other (please specify)") && (
        <>
          {resolution === "Other (please specify)" && (<><label className="rr-label">Other Reason</label><input className="rr-input" value={refundRec.otherReason || ""} readOnly /></>)}
          <label className="rr-label">Refund Method</label>
          <input className="rr-input" value={refundMethod || "—"} readOnly />
          {refundMethod.includes("PayPal") && (<><label className="rr-label">PayPal Email Address</label><input className="rr-input" value={paypalEmail || "—"} readOnly /></>)}
        </>
      )}
      {refundRec.rejectedReason && (<><label className="rr-label" style={{ color: "#e04242" }}>Rejected Reason</label><input className="rr-input" value={refundRec.rejectedReason} readOnly /></>)}
    </>
  );
}

/* ─── STOCK ADJUSTMENT MODAL ────────────────────────────────────────────────── */
function StockAdjustModal({ open, refundRec, item, onConfirm, onCancel }) {
  const [stockAction, setStockAction] = useState("RETURN");
  const [quantity, setQuantity] = useState(refundRec?.returnQuantity || 1);
  const maxQty = refundRec?.returnQuantity || 1;

  useEffect(() => {
    if (open) {
      setStockAction("RETURN");
      setQuantity(refundRec?.returnQuantity || 1);
    }
  }, [open, refundRec]);

  if (!open) return null;

  const isDamaged = stockAction === "DAMAGED";

  return (
    <div className="rr-modal-overlay">
      <div className="sam-modal">

        <h3 className="sam-title">Process return/refund stock</h3>
        <p className="sam-subtitle">Update inventory based on the returned product condition.</p>

        <div className="sam-product-row">
          <div className="sam-thumb-wrap">
            {item?.image
              ? <img src={item.image} alt={item?.name} className="sam-thumb" draggable="false" />
              : <i className="ti ti-box sam-thumb-icon" aria-hidden="true" />}
          </div>
          <div className="sam-product-meta">
            <div className="sam-product-name">{item?.name}</div>
            {item?.value && <div className="sam-product-sub">Variant: {item.value}</div>}
            <div className="sam-product-sub">Ordered qty: {item?.qty}</div>
          </div>
        </div>

        <div className="sam-field-group">
          <div className="sam-field">
            <label className="sam-label">
              Stock action <span className="sam-required">*</span>
            </label>
            <select
              className="sam-select"
              value={stockAction}
              onChange={(e) => setStockAction(e.target.value)}
            >
              <option value="RETURN">RETURN — restore stock (item in good condition)</option>
              <option value="DAMAGED">DAMAGED — deduct stock (item is damaged)</option>
            </select>
          </div>

          <div className="sam-field">
            <label className="sam-label">
              Quantity to process <span className="sam-required">*</span>
              <span className="sam-max-note">(max: {maxQty})</span>
            </label>
            <input
              className="sam-input"
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v < 1) setQuantity(1);
                else if (v > maxQty) setQuantity(maxQty);
                else setQuantity(v);
              }}
            />
          </div>
        </div>

        <div className={`sam-info-box ${isDamaged ? "sam-info-damaged" : "sam-info-return"}`}>
          <i className={`ti ${isDamaged ? "ti-alert-triangle" : "ti-circle-check"} sam-info-icon`} aria-hidden="true" />
          {isDamaged
            ? `${quantity} stock(s) will be deducted from inventory (damaged goods).`
            : `${quantity} stock(s) will be added back to inventory (returned goods).`}
        </div>

        <div className="sam-actions">
          <button className="sam-btn-cancel" type="button" onClick={onCancel}>Cancel</button>
          <button
            className={`sam-btn-confirm ${isDamaged ? "sam-btn-damaged" : "sam-btn-return"}`}
            type="button"
            onClick={() => onConfirm(stockAction, quantity)}
            disabled={!quantity || quantity < 1}
          >
            <i className="ti ti-check" aria-hidden="true" />
            Confirm &amp; update stock
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────────────────────────── */
function ReviewRefund({ item = null, onClose = () => {} }) {
  const {
    toastError, fetchOrders, fetchOrderItems, fetchReturnRefundOrders,
    customerList, processRefundRequest, fetchRefundProof, approveRefundRequest,
    rejectRefundRequest, submitRefundProof, deleteRefundRequest,
    successfullyProcessedRefund, processRefundStock,
  } = useContext(AdminContext);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [refundRec, setRefundRec] = useState(null);

  const [refundAmount, setRefundAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [paypalTxId, setPaypalTxId] = useState("");
  const [refundProofRecord, setRefundProofRecord] = useState(null);
  const [localStatus, setLocalStatus] = useState("");

  const [pickupScheduledDate, setPickupScheduledDate] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ title: "", message: "", action: null });

  // Stock modal
  const [stockModalOpen, setStockModalOpen] = useState(false);

  const openConfirm = (title, message, action) => {
    setConfirmData({ title, message, action });
    setConfirmOpen(true);
  };

  useEffect(() => {
    if (!item) return;
    const orderItem = fetchOrderItems?.find((oi) => oi.ID === item.id) || null;
    const orderRec = orderItem ? fetchOrders?.find((o) => o.ID === orderItem.orderId) || null : null;
    const cust = orderRec ? customerList?.find((c) => c.ID === orderRec.customerId) || null : null;
    const refundRecord = fetchReturnRefundOrders?.find(
      (r) => Number(r.orderItemId) === Number(item.id) && (orderRec ? Number(r.customerId) === Number(orderRec.customerId) : true)
    ) || null;

    setOrderData(orderRec);
    setCustomer(cust);
    setRefundRec(refundRecord);
    setLocalStatus(refundRecord?.refundStatus || "");
    setPickupScheduledDate(refundRecord?.pickupScheduledDate ? refundRecord.pickupScheduledDate.split("T")[0] : "");
    setRefundAmount("");
    setReceiptFile(null);
    setReceiptPreview("");
    setPaypalTxId("");
    setRefundProofRecord(null);

    if (refundRecord && fetchRefundProof?.length > 0) {
      const foundProof = fetchRefundProof.find((p) => Number(p.refundId) === Number(refundRecord.ID));
      setRefundProofRecord(foundProof || null);
      if (foundProof) {
        setRefundAmount(foundProof.refundAmount || "");
        setReceiptPreview(foundProof.receiptImage || "");
        setPaypalTxId(foundProof.transactionID || "");
      }
    }
  }, [item, fetchOrders, fetchOrderItems, fetchReturnRefundOrders, fetchRefundProof, customerList]);

  const paymentMethod = useMemo(() => orderData?.paymentMethod || "—", [orderData]);

  const handleReceiptFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { alert("Please upload an image only."); return; }
    setReceiptFile(f);
    setReceiptPreview(URL.createObjectURL(f));
  };

  // ── Status flags ──
  const rs = refundRec?.refundStatus || localStatus || "Pending";
  const isPending = rs === "Pending";
  const isProcessing = rs === "Processing";
  const isSuccessfullyProcessed = rs === "Successfully Processed";
  const isRejected = rs === "Rejected";

  const paypalEmail = refundRec?.refundPaypalEmail || "";
  const returnMethod = refundRec?.returnMethod || null;
  const isPickup = returnMethod === "PICKUP";

  const existingPickupDate = refundRec?.pickupScheduledDate
    ? new Date(refundRec.pickupScheduledDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  // PICKUP is fully done when pickupScheduledDate is already saved in the record
  const pickupAlreadyScheduled = Boolean(refundRec?.pickupScheduledDate);

  // ── Handlers ──
  const handleProceedWithRefund = async () => {
    if (!refundRec) return;
    setLoading(true);
    const success = await processRefundRequest(refundRec.ID, "Processing");
    setLoading(false);
    if (success) setTimeout(() => window.location.reload(), 500);
  };

  const handleApproveRequest = async () => {
    if (!refundRec) return;
    if (isPickup && !pickupScheduledDate) {
      return toast.error("Pickup scheduled date is required for PICKUP return method.", toastError);
    }
    setLoading(true);
    const success = await approveRefundRequest(refundRec.ID, "Processing", isPickup ? pickupScheduledDate : null);
    setLoading(false);
    if (success) setTimeout(() => window.location.reload(), 500);
  };

  const handleRejectRequest = async () => {
    if (!refundRec) return;
    setLoading(true);
    const success = await rejectRefundRequest(refundRec.ID, "Rejected", rejectReason);
    setLoading(false);
    if (success) setTimeout(() => window.location.reload(), 500);
  };

  const handleSuccessfullyProcessed = async () => {
    if (!refundRec || !orderData) return;

    if (!paypalEmail) {
      setLoading(true);
      const success = await successfullyProcessedRefund(refundRec.ID, "Successfully Processed");
      setLoading(false);
      if (success) {
        setLocalStatus("Successfully Processed");
        setStockModalOpen(true);
      }
      return;
    }

    if (!refundAmount || isNaN(Number(refundAmount))) return toast.error("Invalid amount.", toastError);
    if (!receiptFile && !receiptPreview) return toast.error("Upload proof.", toastError);
    if (!paypalTxId.trim()) return toast.error("Enter PayPal TxID.", toastError);

    const formData = new FormData();
    formData.append("newStatus", "Successfully Processed");
    formData.append("customerID", refundRec.customerId);
    formData.append("refundID", refundRec.ID);
    formData.append("refundAmount", refundAmount);
    formData.append("transactionID", paypalTxId.trim());
    if (receiptFile) formData.append("receiptImage", receiptFile);
    else if (receiptPreview) formData.append("receiptImage", receiptPreview);

    setLoading(true);
    const success = await submitRefundProof(formData);
    setLoading(false);
    if (success) {
      setLocalStatus("Successfully Processed");
      setStockModalOpen(true);
    }
  };

  const handleStockConfirm = async (stockAction, quantity) => {
    setStockModalOpen(false);
    setLoading(true);
    await processRefundStock(refundRec.ID, stockAction, quantity);
    setLoading(false);
    setTimeout(() => window.location.reload(), 500);
  };

  const handleDelete = async () => {
    if (!refundRec) return;
    if (deleteRefundRequest) await deleteRefundRequest(refundRec.ID);
    onClose();
  };

  return (
    <>
      {loading && <Loading />}

      <ConfirmModal
        open={confirmOpen}
        title={confirmData.title}
        message={confirmData.message}
        onConfirm={() => { confirmData.action(); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
      />

      <RejectReasonModal
        open={rejectModalOpen}
        reason={rejectReason}
        setReason={setRejectReason}
        onNext={() => {
          setRejectModalOpen(false);
          openConfirm("Reject Refund Request?", "Are you sure you want to reject this request?", handleRejectRequest);
        }}
        onCancel={() => setRejectModalOpen(false)}
      />

      <StockAdjustModal
        open={stockModalOpen}
        refundRec={refundRec}
        item={item}
        onConfirm={handleStockConfirm}
        onCancel={() => { setStockModalOpen(false); setTimeout(() => window.location.reload(), 300); }}
      />

      <div className="return-viewall-topbar">
        <button className="return-viewall-back-btn" onClick={onClose}><FaArrowLeft /></button>
        <div className="return-viewall-order-title">Back</div>
      </div>

      <div className="rr-page">
        <div className="rr-root">

          {/* CUSTOMER INFO */}
          <div className="rr-top">
            <div className="rr-top-left">
              <div className="rr-avatar">
                {customer?.profileImage
                  ? <img src={customer.profileImage} alt="Customer" draggable="false" />
                  : <div className="rr-avatar-fallback">{(customer?.medicalInstitutionName || "C").charAt(0)}</div>}
              </div>
              <div className="rr-user-text">
                <div className="rr-user-org">{customer?.medicalInstitutionName || "Unknown Customer"}</div>
                <div className="rr-user-muted">Customer</div>
              </div>
            </div>
            <div className="rr-top-right">
              <div className={`rr-status-pill${isSuccessfullyProcessed ? " rr-completed" : isRejected ? " rr-rejected" : isProcessing ? " rr-processing" : ""}`}>
                {rs}
              </div>
            </div>
          </div>

          {/* ITEM CARD */}
          <div className="rr-item-card">
            <div className="rr-item-left">
              <div className="rr-thumb">
                <img className="rr-thumb-img" src={item?.image} alt={item?.name} draggable="false" />
              </div>
              <div className="rr-product-meta">
                <div className="rr-product-name">{item?.name}</div>
                <div className="rr-product-sub">Qty: {item?.qty}{item?.value ? ` • ${item.value}` : ""}</div>
                <div className="rr-product-price">₱{Number(item?.price || 0).toFixed(2)}</div>
              </div>
            </div>
            <div className="rr-pay-badge">
              <span className="rr-pay-label">Payment:</span>
              <span className="rr-pay-method">{paymentMethod}</span>
            </div>
          </div>

          {/* FORM */}
          <div className="rr-form">
            {!refundRec ? (
              <div className="rr-empty">No refund record found.</div>
            ) : (
              <>

                {/* ── PENDING ── */}
                {isPending && (
                  <>
                    <RefundInfoBlock refundRec={refundRec} isPickup={isPickup} existingPickupDate={existingPickupDate} />

                    <div className="rr-action-row">
                      {paypalEmail ? (
                        /* PayPal path: just proceed with refund process */
                        <button className="rr-primary-btn"
                          onClick={() => openConfirm("Proceed with Refund?", "Start the refund process for this request?", handleProceedWithRefund)}>
                          Proceed with Refund Process
                        </button>
                      ) : (
                        /* Non-PayPal path: approve (with optional pickup date) */
                        <>
                          {isPickup && (
                            <div style={{ width: "100%", marginBottom: "12px" }}>
                              <label className="rr-label">
                                Schedule Pickup Date <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                className="rr-input"
                                type="date"
                                value={pickupScheduledDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setPickupScheduledDate(e.target.value)}
                              />
                            </div>
                          )}
                          <button
                            className="rr-primary-btn"
                            disabled={isPickup && !pickupScheduledDate}
                            onClick={() => openConfirm("Approve Request?", "Approve this return/refund request?", handleApproveRequest)}>
                            Approved Request
                          </button>
                        </>
                      )}

                      <button className="rr-danger-btn"
                        onClick={() => { setRejectReason(""); setRejectModalOpen(true); }}>
                        Reject Request
                      </button>
                    </div>
                  </>
                )}

                {/* ── PROCESSING ── */}
                {isProcessing && (
                  <>
                    <RefundInfoBlock refundRec={refundRec} isPickup={isPickup} existingPickupDate={existingPickupDate} />

                    {/*
                      PICKUP flow:
                        - If pickup NOT yet scheduled → show date picker + Approve button
                        - If pickup IS scheduled but proof upload not done → show upload section
                      Non-PICKUP / PayPal flow:
                        - Show upload proof (if PayPal) or just "Successfully Processed" button
                    */}

                    {isPickup && !pickupAlreadyScheduled ? (
                      /* Step 1 of PICKUP: schedule the date */
                      <div className="rr-action-row">
                        <div style={{ width: "100%", marginBottom: "12px" }}>
                          <label className="rr-label">
                            Schedule Pickup Date <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            className="rr-input"
                            type="date"
                            value={pickupScheduledDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setPickupScheduledDate(e.target.value)}
                          />
                        </div>
                        <button
                          className="rr-primary-btn"
                          disabled={!pickupScheduledDate}
                          onClick={() => openConfirm("Confirm Pickup Schedule?", `Schedule pickup for ${pickupScheduledDate}?`, handleApproveRequest)}>
                          Confirm Pickup Schedule
                        </button>
                      </div>
                    ) : (
                      /* Step 2 of PICKUP (or non-PICKUP): upload proof / mark complete */
                      <>
                        {!paypalEmail ? (
                          <div className="rr-action-row">
                            <button className="rr-primary-btn"
                              onClick={() => openConfirm("Mark as Successfully Processed?", "Confirm that this return/refund has been completed.", handleSuccessfullyProcessed)}>
                              Successfully Processed
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="rr-divider" />
                            <p className="rr-title">Upload Refund Proof</p>
                            <label className="rr-label">Total Refund Amount</label>
                            <input className="rr-input" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="Enter refund amount" />
                            <label className="rr-label">Upload Refund Receipt</label>
                            {!receiptPreview
                              ? <label className="rr-upload-img"><span className="rr-upload-text">Upload Proof of Refund Payment</span><input type="file" accept="image/*" onChange={handleReceiptFile} /></label>
                              : <label className="rr-upload-img-active"><span className="rr-upload-text-active">Change Proof of Refund Payment</span><input type="file" accept="image/*" onChange={handleReceiptFile} /></label>}
                            {receiptPreview && <img className="rr-proof-preview" src={receiptPreview} alt="proof" draggable="false" />}
                            <label className="rr-label">PayPal Transaction ID</label>
                            <input className="rr-input" value={paypalTxId} onChange={(e) => setPaypalTxId(e.target.value)} placeholder="Enter PayPal transaction ID" />
                            <div className="rr-action-row">
                              <button
                                className="rr-primary-btn"
                                disabled={!refundAmount || !paypalTxId.trim() || (!receiptPreview && !receiptFile)}
                                onClick={() => openConfirm("Mark as Successfully Processed?", "Confirm that refund was already sent.", handleSuccessfullyProcessed)}>
                                Successfully Processed
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* ── SUCCESSFULLY PROCESSED ── */}
                {isSuccessfullyProcessed && (
                  <>
                    <RefundInfoBlock refundRec={refundRec} isPickup={isPickup} existingPickupDate={existingPickupDate} />

                    {paypalEmail && (
                      <>
                        <div className="rr-divider" />
                        <p className="rr-title">Uploaded Refund Proof</p>
                        <label className="rr-label">Refund Amount</label>
                        <input className="rr-input" value={refundProofRecord?.refundAmount || refundAmount || "—"} readOnly />
                        <label className="rr-label">Proof of Payment</label>
                        {refundProofRecord?.receiptImage
                          ? <img className="rr-proof-preview" src={refundProofRecord.receiptImage} alt="refund proof" draggable="false" />
                          : <div className="rr-empty">No proof uploaded</div>}
                        <label className="rr-label">PayPal Transaction ID</label>
                        <input className="rr-input" value={refundProofRecord?.transactionID || paypalTxId || "—"} readOnly />
                      </>
                    )}

                    <div className="rr-action-row">
                      <button className="rr-danger-btn"
                        onClick={() => openConfirm("Delete Refund Record?", "This cannot be undone.", handleDelete)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}

                {/* ── REJECTED ── */}
                {isRejected && (
                  <>
                    <RefundInfoBlock refundRec={refundRec} isPickup={isPickup} existingPickupDate={existingPickupDate} />
                    <div className="rr-action-row">
                      <button className="rr-danger-btn"
                        onClick={() => openConfirm("Delete Refund Request?", "This cannot be undone.", handleDelete)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ReviewRefund;
