import React, { useContext, useEffect, useMemo, useState } from "react";
import "./ReviewRefund.css";
import { AdminContext } from "../../context/AdminContextProvider.jsx";
import { FaArrowLeft } from "react-icons/fa6";
import Loading from "../../../../customer/src/components/Loading.jsx";
import { toast } from "react-toastify";

function RejectReasonModal({ open, reason, setReason, onNext, onCancel }) {
  if (!open) return null;

  return (
    <div className="rr-modal-overlay">
      <div className="rr-modal rr-wide-modal">
        <h3 className="rr-modal-title">Return/Refund Rejected Reason</h3>

        <textarea
          className="rr-reject-textarea"
          placeholder="State the reason for rejecting this request..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="rr-modal-actions">
          <button className="rr-modal-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="rr-modal-confirm"
            onClick={onNext}
            disabled={!reason.trim()}
          >
            Continue
          </button>
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
          <button className="rr-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="rr-modal-confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewRefund({ item = null, onClose = () => {} }) {
  const { toastError, fetchOrders, fetchOrderItems, fetchReturnRefundOrders, customerList, processRefundRequest, fetchRefundProof, approveRefundRequest, rejectRefundRequest, submitRefundProof, deleteRefundRequest, successfullyProcessedRefund} = useContext(AdminContext);

  // Reject Reason Modal
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
  const [processingStarted, setProcessingStarted] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({
    title: "",
    message: "",
    action: null,
  });

  const openConfirm = (title, message, action) => {
    setConfirmData({ title, message, action });
    setConfirmOpen(true);
  };

  useEffect(() => {
    if (!item) return;

    const orderItem = fetchOrderItems?.find((oi) => oi.ID === item.id) || null;
    const orderRec = orderItem
      ? fetchOrders?.find((o) => o.ID === orderItem.orderId) || null
      : null;

    const cust = orderRec
      ? customerList?.find((c) => c.ID === orderRec.customerId) || null
      : null;

    const refundRecord =
      fetchReturnRefundOrders?.find(
        (r) =>
          Number(r.orderItemId) === Number(item.id) &&
          (orderRec ? Number(r.customerId) === Number(orderRec.customerId) : true)
      ) || null;

    setOrderData(orderRec);
    setCustomer(cust);
    setRefundRec(refundRecord);

    const status = refundRecord?.refundStatus || "";
    setLocalStatus(status);
    setProcessingStarted(status === "Processing");

    setRefundAmount("");
    setReceiptFile(null);
    setReceiptPreview("");
    setPaypalTxId("");

    if (refundRecord && fetchRefundProof?.length > 0) {
      const foundProof = fetchRefundProof.find(
        (p) => Number(p.refundId) === Number(refundRecord.ID)
      );

      setRefundProofRecord(foundProof || null);

      if (foundProof) {
        setRefundAmount(foundProof.refundAmount || "");
        setReceiptPreview(foundProof.receiptImage || "");
        setPaypalTxId(foundProof.transactionID || "");
      }
    }
  }, [
    item,
    fetchOrders,
    fetchOrderItems,
    fetchReturnRefundOrders,
    fetchRefundProof,
    customerList,
  ]);

  const paymentMethod = useMemo(() => orderData?.paymentMethod || "—", [orderData]);

  const handleReceiptFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Please upload an image only.");
      return;
    }
    setReceiptFile(f);
    setReceiptPreview(URL.createObjectURL(f));
  };

  // --------------------------------------------------
  // DO NOT TOUCH THESE FUNCTIONS (Your logic preserved)
  // --------------------------------------------------
  const handleProceedWithRefund = async () => {
    if (!refundRec) return;
    setLoading(true);
    const success = await processRefundRequest(refundRec.ID, "Processing");
    setLocalStatus("Processing");
    setProcessingStarted(true);
    setLoading(false);

    if (success) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleApproveRequest = async () => {
    if (!refundRec) return;
    const success = await approveRefundRequest(refundRec.ID, "Processing");
    setLocalStatus("Processing");
    setProcessingStarted(true);
    setLoading(false);

    if (success) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleRejectRequest = async () => {
    if (!refundRec) return;

    setLoading(true);

    const success = await rejectRefundRequest(refundRec.ID, "Rejected", rejectReason);
    setLocalStatus("Rejected");
    setProcessingStarted(true);
    setLoading(false);

    if (success) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleSuccessfullyProcessed = async () => {
    if (!refundRec || !orderData) return;

    if (!paypalEmail) {
      setLoading(true);

      const success = await successfullyProcessedRefund(refundRec.ID, "Successfully Processed");
      setLocalStatus("Successfully Processed");
      setProcessingStarted(false);
      setLoading(false);

      if (success) {
        setTimeout(() => window.location.reload(), 500);
      }
      return;
    }

    if (!refundAmount || isNaN(Number(refundAmount))) {
      return toast.error("Invalid amount.", toastError);
    }

    if (!receiptFile && !receiptPreview) {
      return toast.error("Upload proof.", toastError);
    }

    if (!paypalTxId.trim()) {
      return toast.error("Enter PayPal TxID.", toastError);
    }

    const formData = new FormData();
    formData.append("newStatus", "Successfully Processed");
    formData.append("customerID", refundRec.customerId);
    formData.append("refundID", refundRec.ID);
    formData.append("refundAmount", refundAmount);
    formData.append("transactionID", paypalTxId.trim());

    if (receiptFile) {
      formData.append("receiptImage", receiptFile);
    }

    else if (receiptPreview) {
      formData.append("receiptImage", receiptPreview);
    }

    setLoading(true);

    const success = await submitRefundProof(formData);

    setLocalStatus("Successfully Processed");
    setProcessingStarted(false);
    setLoading(false);

    if (success) {
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handleDelete = async () => {
    if (!refundRec) return;
    if (deleteRefundRequest) await deleteRefundRequest(refundRec.ID);
    onClose();
  };

  // --------------------------------------------------
  // VIEW LOGIC
  // --------------------------------------------------
  const rs = refundRec?.refundStatus || localStatus || "Pending";
  const isPending = rs === "Pending";
  const isProcessing = rs === "Processing";
  const isSuccessfullyProcessed = rs === "Successfully Processed";
  const isRejected = rs === "Rejected";

  const resolution = refundRec?.refundResolution || "";
  const refundMethod = refundRec?.refundMethod || "";
  const paypalEmail = refundRec?.refundPaypalEmail || "";

  return (
    <>
      {loading && <Loading />}
      <ConfirmModal
        open={confirmOpen}
        title={confirmData.title}
        message={confirmData.message}
        onConfirm={() => {
          confirmData.action();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      <RejectReasonModal
        open={rejectModalOpen}
        reason={rejectReason}
        setReason={setRejectReason}
        onNext={() => {
          setRejectModalOpen(false);
          openConfirm(
            "Reject Refund Request?",
            "Are you sure you want to reject this request?",
            handleRejectRequest
          );
        }}
        onCancel={() => setRejectModalOpen(false)}
      />


      <div className="return-viewall-topbar">
        <button className="return-viewall-back-btn" onClick={onClose}>
          <FaArrowLeft />
        </button>
        <div className="return-viewall-order-title">Back</div>
      </div>

      <div className="rr-page">
        <div className="rr-root">
          {/* CUSTOMER INFO */}
          <div className="rr-top">
            <div className="rr-top-left">
              <div className="rr-avatar">
                {customer?.profileImage ? (
                  <img src={customer.profileImage} alt="Customer" draggable="false" />
                ) : (
                  <div className="rr-avatar-fallback">
                    {(customer?.medicalInstitutionName || "C").charAt(0)}
                  </div>
                )}
              </div>
              <div className="rr-user-text">
                <div className="rr-user-org">{customer?.medicalInstitutionName || "Unknown Customer"}</div>
                <div className="rr-user-muted">Customer</div>
              </div>
            </div>

            <div className="rr-top-right">
              <div
                className={
                  isSuccessfullyProcessed
                    ? "rr-status-pill rr-completed"
                    : isRejected
                    ? "rr-status-pill rr-rejected"
                    : isProcessing
                    ? "rr-status-pill rr-processing"
                    : "rr-status-pill"
                }
              >
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
                <div className="rr-product-sub">
                  Qty: {item?.qty}
                  {item?.value ? ` • ${item.value}` : ""}
                </div>
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
                {/* =============================
                    PENDING VIEW
                ============================== */}
                {isPending && (
                  <>
                    <label className="rr-label">1. Reason for Return Request</label>
                    <input className="rr-input" value={refundRec.reasonForRefund} readOnly />

                    <label className="rr-label">2. Comment</label>
                    <textarea className="rr-textarea" value={refundRec.refundComments || ""} readOnly />

                    <label className="rr-label">3. Submitted Image Proof</label>
                    <div className="rr-proof-row">
                      <img src={refundRec.imageProof1} className="rr-proof-img" draggable="false" />
                      <img src={refundRec.imageProof2} className="rr-proof-img" draggable="false" />
                    </div>

                    <label className="rr-label">4. Return Request Solution</label>
                    <input className="rr-input" value={refundRec.refundResolution} readOnly />

                    {resolution === "Return and Refund" && (
                      <>
                        <label className="rr-label">5. Refund Method</label>
                        <input className="rr-input" value={refundMethod || "—"} readOnly />

                        {refundMethod.includes("PayPal") && (
                          <>
                            <label className="rr-label">6. PayPal Email Address</label>
                            <input className="rr-input" value={paypalEmail || "—"} readOnly />
                          </>
                        )}
                      </>
                    )}

                    {resolution === "Other (please specify)" && (
                      <>
                        <label className="rr-label">5. Other Reason</label>
                        <input className="rr-input" value={refundRec.otherReason || ""} readOnly />

                        <label className="rr-label">6. Refund Method</label>
                        <input className="rr-input" value={refundMethod || "—"} readOnly />

                        {refundMethod.includes("PayPal") && (
                          <>
                            <label className="rr-label">7. PayPal Email Address</label>
                            <input className="rr-input" value={paypalEmail || "—"} readOnly />
                          </>
                        )}
                      </>
                    )}

                    <div className="rr-action-row">
                      {paypalEmail ? (
                        <button
                          className="rr-primary-btn"
                          onClick={() =>
                            openConfirm(
                              "Proceed with Refund?",
                              "Are you sure you want to start the refund process?",
                              handleProceedWithRefund
                            )
                          }
                        >
                          Proceed with Refund Process
                        </button>
                      ) : (
                        <button
                          className="rr-primary-btn"
                          onClick={() =>
                            openConfirm(
                              "Approve Request?",
                              "Are you sure you want to approve this refund request?",
                              handleApproveRequest
                            )
                          }
                        >
                          Approved Request
                        </button>
                      )}

                      <button
                        className="rr-danger-btn"
                        onClick={() => {
                          setRejectReason("");
                          setRejectModalOpen(true);
                        }}
                      >
                        Reject Request
                      </button>
                    </div>
                  </>
                )}

                {/* =============================
                    PROCESSING VIEW
                ============================== */}
                {isProcessing && (
                  <>
                    {/* CASE 1: refundStatus === "Processing" BUT NO PayPal email → 
                        Show PENDING layout + "Successfully Processed" button */}
                    {!paypalEmail ? (
                      <>
                        <label className="rr-label">1. Reason for Return Request</label>
                        <input className="rr-input" value={refundRec.reasonForRefund} readOnly />

                        <label className="rr-label">2. Comment</label>
                        <textarea className="rr-textarea" value={refundRec.refundComments || ""} readOnly />

                        <label className="rr-label">3. Submitted Image Proof</label>
                        <div className="rr-proof-row">
                          <img src={refundRec.imageProof1} className="rr-proof-img" draggable="false" />
                          <img src={refundRec.imageProof2} className="rr-proof-img" draggable="false" />
                        </div>

                        <label className="rr-label">4. Return Request Solution</label>
                        <input className="rr-input" value={refundRec.refundResolution} readOnly />

                        <div className="rr-action-row">
                          <button
                            className="rr-primary-btn"
                            onClick={() =>
                              openConfirm(
                                "Mark as Successfully Processed?",
                                "Confirm that this refund has been completed.",
                                handleSuccessfullyProcessed
                              )
                            }
                          >
                            Successfully Processed
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* CASE 2: refundStatus === "Processing" WITH PayPal email → 
                            Admin must fill refundAmount, proof & TxID */}
                        <label className="rr-label">1. Total Refund Amount</label>
                        <input
                          className="rr-input"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          placeholder="Enter refund amount"
                        />

                        <label className="rr-label">2. Upload Refund Receipt</label>

                        {!receiptPreview ? (
                          <label className="rr-upload-img">
                            <span className="rr-upload-text">Upload Proof of Refund Payment</span>
                            <input type="file" accept="image/*" onChange={handleReceiptFile} />
                          </label>
                        ) : (
                          <label className="rr-upload-img-active">
                            <span className="rr-upload-text-active">Change Proof of Refund Payment</span>
                            <input type="file" accept="image/*" onChange={handleReceiptFile} />
                          </label>
                        )}

                        {receiptPreview && (
                          <img className="rr-proof-preview" src={receiptPreview} alt="proof" draggable="false" />
                        )}

                        <label className="rr-label">3. PayPal Transaction ID</label>
                        <input
                          className="rr-input"
                          value={paypalTxId}
                          onChange={(e) => setPaypalTxId(e.target.value)}
                          placeholder="Enter PayPal transaction ID"
                        />

                        <div className="rr-action-row">
                          <button
                            className="rr-primary-btn"
                            onClick={() =>
                              openConfirm(
                                "Mark as Successfully Processed?",
                                "Confirm that refund was already sent.",
                                handleSuccessfullyProcessed
                              )
                            }
                            disabled={!refundAmount || !paypalTxId.trim() || (!receiptPreview && !receiptFile)}
                          >
                            Successfully Processed
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* =============================
                    SUCCESSFULLY PROCESSED
                ============================== */}
                {isSuccessfullyProcessed && (
                  <>
                    {!paypalEmail ? (
                      <>
                        <label className="rr-label">1. Reason for Return Request</label>
                        <input className="rr-input" value={refundRec.reasonForRefund} readOnly />

                        <label className="rr-label">2. Comment</label>
                        <textarea className="rr-textarea" value={refundRec.refundComments || ""} readOnly />

                        <label className="rr-label">3. Submitted Image Proof</label>
                        <div className="rr-proof-row">
                          <img src={refundRec.imageProof1} className="rr-proof-img" draggable="false" />
                          <img src={refundRec.imageProof2} className="rr-proof-img" draggable="false" />
                        </div>

                        <label className="rr-label">4. Return Request Solution</label>
                        <input className="rr-input" value={refundRec.refundResolution} readOnly />

                        <div className="rr-action-row">
                          <button
                            className="rr-danger-btn"
                            onClick={() =>
                              openConfirm(
                                "Delete Refund Record?",
                                "This cannot be undone.",
                                handleDelete
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="rr-label">1. Refund Amount</label>
                        <input
                          className="rr-input"
                          value={refundProofRecord?.refundAmount || refundAmount || "—"}
                          readOnly
                        />

                        <label className="rr-label">2. Proof of Payment</label>
                        {refundProofRecord?.receiptImage ? (
                          <img
                            className="rr-proof-preview"
                            src={refundProofRecord.receiptImage}
                            alt="refund proof"
                            draggable="false"
                          />
                        ) : (
                          <div>No proof uploaded</div>
                        )}

                        <label className="rr-label">3. PayPal Transaction ID</label>
                        <input
                          className="rr-input"
                          value={refundProofRecord?.transactionID || paypalTxId || "—"}
                          readOnly
                        />

                        <div className="rr-action-row">
                          <button
                            className="rr-danger-btn"
                            onClick={() =>
                              openConfirm(
                                "Delete Refund Record?",
                                "This cannot be undone.",
                                handleDelete
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* =============================
                    REJECTED VIEW
                ============================== */}
                {isRejected && (
                  <>
                    <label className="rr-label">1. Reason for Return Request</label>
                    <input className="rr-input" value={refundRec.reasonForRefund} readOnly />

                    <label className="rr-label">2. Comment</label>
                    <textarea className="rr-textarea" value={refundRec.refundComments || ""} readOnly />

                    <label className="rr-label">3. Submitted Image Proof</label>
                    <div className="rr-proof-row">
                      <img src={refundRec.imageProof1} className="rr-proof-img" draggable="false" />
                      <img src={refundRec.imageProof2} className="rr-proof-img" draggable="false" />
                    </div>

                    <div className="rr-action-row">
                      <button
                        className="rr-danger-btn"
                        onClick={() =>
                          openConfirm(
                            "Delete Refund Request?",
                            "This cannot be undone.",
                            handleDelete
                          )
                        }
                      >
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
