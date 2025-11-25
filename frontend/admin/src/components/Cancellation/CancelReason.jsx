import React, { useContext, useEffect, useMemo, useState } from "react";
import "./CancelReason.css";
import { AdminContext } from "../../context/AdminContextProvider";

function CancelReason({ item = null, onClose = () => {} }) {
  const { fetchOrders, fetchOrderItems, fetchCancelledOrders, customerList } = useContext(AdminContext);

  const [orderData, setOrderData] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [localCancelRecord, setLocalCancelRecord] = useState(null);

  const [paypalEmailInput, setPaypalEmailInput] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState("");
  const [paypalTxId, setPaypalTxId] = useState("");

  const [refundStarted, setRefundStarted] = useState(false);

  const [localCancellationStatus, setLocalCancellationStatus] = useState(
    item?.cancellationStatus || item?.status || ""
  );

  useEffect(() => {
    if (!item) return;

    const orderItem = fetchOrderItems.find((oi) => oi.ID === item.id) || null;
    const orderRec = orderItem
      ? fetchOrders.find((o) => o.ID === orderItem.orderId) || null
      : null;

    const cust = orderRec
      ? customerList.find((c) => c.ID === orderRec.customerId) || null
      : null;

    const cancelRec =
      fetchCancelledOrders.find(
        (c) =>
          Number(c.orderItemId) === Number(item.id) &&
          (orderRec ? Number(c.customerId) === Number(orderRec.customerId) : true)
      ) || null;

    setOrderData(orderRec);
    setCustomer(cust);
    setLocalCancelRecord(cancelRec);

    setPaypalEmailInput(cancelRec?.cancelPaypalEmail || "");
    setRefundAmount(cancelRec?.refundAmount || "");
    setPaypalTxId(cancelRec?.paypalTransactionId || "");
    setProofPreviewUrl(cancelRec?.proofUrl || "");

    setLocalCancellationStatus(
      cancelRec?.cancellationStatus || item.cancellationStatus || item.status || ""
    );

    if (
      cancelRec?.cancellationStatus === "Refunded" ||
      cancelRec?.cancellationStatus === "Completed"
    ) {
      setRefundStarted(true);
    }
  }, [
    item,
    fetchOrders,
    fetchOrderItems,
    fetchCancelledOrders,
    customerList,
  ]);

  const paymentMethod = useMemo(
    () => orderData?.paymentMethod || "—",
    [orderData]
  );

  const handleProofFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Please upload an image only.");
      return;
    }
    setProofFile(f);
    setProofPreviewUrl(URL.createObjectURL(f));
  };

  const handleProceedRefund = () => {
    if (!paypalEmailInput.trim()) {
      alert("Enter PayPal Email.");
      return;
    }

    setLocalCancelRecord((prev) =>
      prev
        ? { ...prev, cancelPaypalEmail: paypalEmailInput }
        : prev
    );

    setRefundStarted(true);
  };

  const handleSubmitAsRefunded = () => {
    if (!refundAmount || Number.isNaN(Number(refundAmount))) {
      alert("Enter refund amount.");
      return;
    }
    if (!proofFile && !proofPreviewUrl) {
      alert("Upload proof.");
      return;
    }
    if (!paypalTxId.trim()) {
      alert("Enter PayPal Transaction ID.");
      return;
    }

    setLocalCancelRecord((prev) =>
      prev
        ? {
            ...prev,
            cancellationStatus: "Refunded",
            refundAmount,
            proofUrl: proofPreviewUrl,
            paypalTransactionId: paypalTxId,
          }
        : prev
    );

    setLocalCancellationStatus("Refunded");
  };

  const handleSubmitAsCompleted = () => {
    setLocalCancelRecord((prev) =>
      prev ? { ...prev, cancellationStatus: "Completed" } : prev
    );
    setLocalCancellationStatus("Completed");
  };

  const handleDeleteCancel = () => {
    if (!window.confirm("Delete this cancellation record?")) return;
    setLocalCancelRecord(null);
    setLocalCancellationStatus("");
    onClose();
  };

  const cancelExists = Boolean(localCancelRecord);

  return (
    <div className="cr-page">
      <div className="cr-root">

        {/* TOP */}
        <div className="cr-top">
          <div className="cr-top-left">
            <div className="cr-avatar">
              {customer?.profileImage ? (
                <img src={customer.profileImage} alt="Customer" />
              ) : (
                <div className="cr-avatar-fallback">
                  {(customer?.medicalInstitutionName || "C").charAt(0)}
                </div>
              )}
            </div>

            <div className="cr-user-text">
              <div className="cr-user-org">
                {customer?.medicalInstitutionName || "Unknown Customer"}
              </div>
              <div className="cr-user-muted">Customer</div>
            </div>
          </div>

          <div className="cr-top-right">
            <div
              className={
                localCancellationStatus === "Completed"
                  ? "cr-status-pill cr-completed"
                  : "cr-status-pill"
              }
            >
              {localCancellationStatus || "Processing"}
            </div>
          </div>
        </div>

        {/* ITEM CARD */}
        <div className="cr-item-card">
          <div className="cr-item-left">
            <div className="cr-thumb">
              <img className="cr-thumb-img" src={item?.image} alt={item?.name} />
            </div>

            <div className="cr-product-meta">
              <div className="cr-product-name">{item?.name}</div>
              <div className="cr-product-sub">
                Qty: {item?.qty}
                {item?.value ? ` • ${item.value}` : ""}
              </div>
              <div className="cr-product-price">
                ₱{Number(item?.price || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="cr-pay-badge">
            <span className="cr-pay-label">Payment:</span>
            <span className="cr-pay-method">{paymentMethod}</span>
          </div>
        </div>

        {/* FORM */}
        <div className="cr-form">
          {!cancelExists ? (
            <div className="cr-empty">No cancellation record found.</div>
          ) : (
            <>

              {/* PROCESSING – ENTER PAYPAL EMAIL */}
              {localCancellationStatus === "Processing" &&
                !refundStarted &&
                /pay/i.test(paymentMethod) && (
                  <>
                    <label className="cr-label">1. Reason for Cancellation</label>
                    <input
                      className="cr-input"
                      value={localCancelRecord?.reasonForCancellation || ""}
                      readOnly
                    />

                    <label className="cr-label">2. Comments</label>
                    <textarea
                      className="cr-textarea"
                      value={localCancelRecord?.cancelComments || ""}
                      readOnly
                    />

                    <label className="cr-label">3. PayPal Email Address</label>
                    <input
                      className="cr-input"
                      placeholder="customer-paypal@example.com"
                      value={paypalEmailInput}
                      onChange={(e) => setPaypalEmailInput(e.target.value)}
                    />

                    <div className="cr-action-row">
                      <button
                        className="cr-primary-btn"
                        onClick={handleProceedRefund}
                        disabled={!paypalEmailInput.trim()}
                      >
                        Proceed with Refund Process
                      </button>
                    </div>
                  </>
                )}

              {/* REFUND FORM WHILE STILL PROCESSING OR REFUNDED */}
              {(localCancellationStatus === "Processing" && refundStarted && /pay/i.test(paymentMethod)) ||
              (localCancellationStatus === "Refunded" && /pay/i.test(paymentMethod)) ? (
                <>
                  <label className="cr-label">1. Total Refund Amount</label>
                  <input
                    className="cr-input"
                    placeholder="Enter the total refund amount"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                  />

                  <label className="cr-label">2. Upload an image or screenshot of your refund payment receipt</label>

                  {!proofPreviewUrl ? (
                    <label className="cr-upload-img">
                      <span className="cr-upload-text">
                        Upload Proof of Refund Payment
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofFile}
                      />
                    </label>
                  ) : (
                    <label className="cr-upload-img-active">
                      <span className="cr-upload-text-active">
                        Change Proof of Refund Payment
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofFile}
                      />
                    </label>
                  )}

                  {proofPreviewUrl && (
                    <img className="cr-proof-preview" src={proofPreviewUrl} alt="proof" />
                  )}

                  <label className="cr-label">3. PayPal Transaction ID</label>
                  <input
                    className="cr-input"
                    placeholder="Enter your PayPal transaction ID"
                    value={paypalTxId}
                    onChange={(e) => setPaypalTxId(e.target.value)}
                  />

                  <div className="cr-action-row">

                    {localCancellationStatus === "Processing" && (
                      <button
                        className="cr-primary-btn"
                        onClick={handleSubmitAsRefunded}
                        disabled={
                          !refundAmount ||
                          !paypalTxId.trim() ||
                          (!proofFile && !proofPreviewUrl)
                        }
                      >
                        Submit as Refunded
                      </button>
                    )}

                    {localCancellationStatus === "Refunded" && (
                      <button
                        className="cr-primary-btn"
                        onClick={handleSubmitAsCompleted}
                        disabled={
                          !refundAmount ||
                          !paypalTxId.trim() ||
                          (!proofFile && !proofPreviewUrl)
                        }
                      >
                        Submit as Completed
                      </button>
                    )}
                  </div>
                </>
              ) : null}

              {/* COMPLETED + CASH */}
              {localCancellationStatus === "Completed" &&
                /cash/i.test(paymentMethod) && (
                  <>
                    <label className="cr-label">1. Reason for Cancellation</label>
                    <input
                      className="cr-input"
                      value={localCancelRecord?.reasonForCancellation || ""}
                      readOnly
                    />

                    <label className="cr-label">2. Comments</label>
                    <textarea
                      className="cr-textarea"
                      value={localCancelRecord?.cancelComments || ""}
                      readOnly
                    />

                    <div className="cr-action-row">
                      <button className="cr-danger-btn" onClick={handleDeleteCancel}>
                        Delete
                      </button>
                    </div>
                  </>
                )}

              {/* COMPLETED + PAYPAL VIEW ONLY */}
              {localCancellationStatus === "Completed" &&
                /pay/i.test(paymentMethod) && (
                  <>
                    <label className="cr-label">1. Total Refund Amount</label>
                    <input
                      className="cr-input"
                      value={localCancelRecord?.refundAmount || ""}
                      readOnly
                    />

                    <label className="cr-label">2. Proof of Payment</label>
                    {localCancelRecord?.proofUrl ? (
                      <a
                        className="cr-proof-link"
                        href={localCancelRecord.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Proof
                      </a>
                    ) : (
                      <div>No proof uploaded</div>
                    )}

                    <label className="cr-label">3. PayPal Transaction ID</label>
                    <input
                      className="cr-input"
                      value={localCancelRecord?.paypalTransactionId || ""}
                      readOnly
                    />

                    <div className="cr-action-row">
                      <button className="cr-danger-btn" onClick={handleDeleteCancel}>
                        Delete
                      </button>
                    </div>
                  </>
                )}

            </>
          )}
        </div>

        <div className="cr-footer">
          <button className="cr-secondary-btn" onClick={onClose}>
            Back
          </button>
        </div>

      </div>
    </div>
  );
}

export default CancelReason;
