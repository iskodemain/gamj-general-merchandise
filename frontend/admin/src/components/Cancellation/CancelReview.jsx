import React, { useContext, useEffect, useMemo, useState } from "react";
import "./CancelReview.css";
import { AdminContext } from "../../context/AdminContextProvider";
import { FaArrowLeft } from "react-icons/fa6";
import Loading from "../../../../customer/src/components/Loading";
import { toast } from "react-toastify";

function CancelReview({ item = null, onClose = () => {} }) {
  const { fetchOrders, fetchOrderItems, fetchCancelledOrders, customerList, cancelSubmitAsRefund, toastError, fetchRefundProof, cancelSubmitAsCompleted, adminDeleteOrderItem, adminRemoveCancellation } = useContext(AdminContext);

  const [loading, setLoading] = useState(false);
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

    // 1. Find ORDER ITEM
    const orderItem = fetchOrderItems?.find(
      (oi) => Number(oi.ID) === Number(item.id)
    ) || null;

    // 2. Find ORDER RECORD
    const orderRec = orderItem
      ? fetchOrders?.find((o) => Number(o.ID) === Number(orderItem.orderId)) || null
      : null;

    // 3. Find CUSTOMER
    const cust = orderRec
      ? customerList?.find((c) => Number(c.ID) === Number(orderRec.customerId)) || null
      : null;

    // 4. Find CANCEL RECORD
    const cancelRec =
      fetchCancelledOrders?.find(
        (c) =>
          Number(c.orderItemId) === Number(item.id) &&
          (orderRec
            ? Number(c.customerId) === Number(orderRec.customerId)
            : true)
      ) || null;

    setOrderData(orderRec);
    setCustomer(cust);
    setLocalCancelRecord(cancelRec);

    // Reset fields
    setPaypalEmailInput(cancelRec?.cancelPaypalEmail || "");
    setRefundAmount("");
    setPaypalTxId("");
    setProofFile(null);
    setProofPreviewUrl("");

    // 5. Find REFUND PROOF for CANCELLATION
    if (cancelRec && fetchRefundProof?.length > 0) {
      const foundProof = fetchRefundProof.find(
        (p) => Number(p.cancelId) === Number(cancelRec.ID)
      );

      if (foundProof) {
        setRefundAmount(foundProof.refundAmount || "");
        setProofPreviewUrl(foundProof.receiptImage || "");
        setPaypalTxId(foundProof.transactionID || "");
      }
    }

    // 6. Local Status Handling
    const status =
      cancelRec?.cancellationStatus || item?.cancellationStatus || item?.status || "";

    setLocalCancellationStatus(status);
    setRefundStarted(status === "Refunded" || status === "Completed");

  }, [
    item,
    fetchOrders,
    fetchOrderItems,
    fetchCancelledOrders,
    fetchRefundProof,
    customerList
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
    setRefundStarted(true)
  };

  const handleSubmitAsRefunded = async () => {
    if (!localCancelRecord || !orderData) return;

    if (!refundAmount || isNaN(Number(refundAmount))) {
      return toast.error("Invalid amount.", toastError);
    }

    if (!proofPreviewUrl) {
      return toast.error("Upload proof.", toastError);
    }

    if (!paypalTxId.trim()) {
      return toast.error("Enter PayPal TxID.", toastError);
    }

    const formData = new FormData();
    formData.append("newStatus", "Refunded");
    formData.append("customerID", localCancelRecord.customerId);
    formData.append("cancelID", localCancelRecord.ID);
    formData.append("refundAmount", refundAmount);
    formData.append("transactionID", paypalTxId.trim());

    if (proofFile) {
      formData.append("receiptImage", proofFile);
    }

    else if (proofPreviewUrl) {
      formData.append("receiptImage", proofPreviewUrl);
    }

    setLoading(true);
    const success = await cancelSubmitAsRefund(formData);
    setLoading(false);

    if (success) {
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handleSubmitAsCompleted = async() => {
    if (!localCancelRecord) return;

    setLoading(true);

    const success = await cancelSubmitAsCompleted(localCancelRecord.ID, "Completed");
    setLoading(false);

    if (success) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleRemoveCancellation = async () => {
    if (!localCancelRecord) return;

    setLoading(true);

    const success = await adminRemoveCancellation(localCancelRecord.ID, localCancelRecord.customerId, localCancelRecord.orderItemId);
    setLoading(false);

    if (success) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleDeleteCancel = async () => {
    if (!localCancelRecord) return;

    setLoading(true);

    const success = await adminDeleteOrderItem(localCancelRecord.orderItemId);
    setLoading(false);

    if (success) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const cancelExists = Boolean(localCancelRecord);

  return (
    <>
    {loading && <Loading />}
    <div className="return-viewall-topbar">
        <button className="return-viewall-back-btn" onClick={onClose}>
          <FaArrowLeft />
        </button>
        <div className="return-viewall-order-title">Back</div>
      </div>
    <div className="crw-page">
      <div className="crw-root">

        {/* TOP */}
        <div className="crw-top">
          <div className="crw-top-left">
            <div className="crw-avatar">
              {customer?.profileImage ? (
                <img src={customer.profileImage} alt="Customer" />
              ) : (
                <div className="crw-avatar-fallback">
                  {(customer?.medicalInstitutionName || "C").charAt(0)}
                </div>
              )}
            </div>

            <div className="crw-user-text">
              <div className="crw-user-org">
                {customer?.medicalInstitutionName || "Unknown Customer"}
              </div>
              <div className="crw-user-muted">Customer</div>
            </div>
          </div>

          <div className="crw-top-right">
            <div
              className={
                localCancellationStatus === "Completed"
                  ? "crw-status-pill crw-completed"
                  : "crw-status-pill"
              }
            >
              {localCancellationStatus || "Processing"}
            </div>
          </div>
        </div>

        {/* ITEM CARD */}
        <div className="crw-item-card">
          <div className="crw-item-left">
            <div className="crw-thumb">
              <img className="crw-thumb-img" src={item?.image} alt={item?.name} />
            </div>

            <div className="crw-product-meta">
              <div className="crw-product-name">{item?.name}</div>
              <div className="crw-product-sub">
                Qty: {item?.qty}
                {item?.value ? ` • ${item.value}` : ""}
              </div>
              <div className="crw-product-price">
                ₱{Number(item?.price || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="crw-pay-badge">
            <span className="crw-pay-label">Payment:</span>
            <span className="crw-pay-method">{paymentMethod}</span>
          </div>
        </div>

        {/* FORM */}
        <div className="crw-form">
          {!cancelExists ? (
            <div className="crw-empty">No cancellation record found.</div>
          ) : (
            <>

            {/* PROCESSING – ENTER PAYPAL EMAIL */}
            {localCancellationStatus === "Processing" &&
              !refundStarted &&
              /pay/i.test(paymentMethod) && (
                <>
                  <label className="crw-label">1. Admin Reason for Cancellation</label>
                  <textarea
                    className="crw-textarea"
                    value={localCancelRecord?.cancelComments || ""}
                    readOnly
                  />

                  <label className="crw-label">2. PayPal Email Address</label>
                  <input
                    className="crw-input"
                    placeholder="customer-paypal@example.com"
                    value={paypalEmailInput}
                    readOnly
                  />
                  {!paypalEmailInput && (
                    <p className="crw-paypal-note">
                      ⚠️ Customer has not yet provided their PayPal email address. Please wait for the customer to submit it before proceeding.
                    </p>
                  )}

                  <div className="crw-action-column">
                    <button
                      className="crw-primary-btn"
                      onClick={handleProceedRefund}
                      disabled={!paypalEmailInput}
                    >
                      Proceed with Refund Process
                    </button>
                    <button
                      className="crw-danger-btn"
                      onClick={handleRemoveCancellation}
                    >
                      Remove Cancellation
                    </button>
                  </div>
                </>
              )}

              {/* REFUND FORM WHILE STILL PROCESSING OR REFUNDED */}
              {(localCancellationStatus === "Processing" && refundStarted && /pay/i.test(paymentMethod)) ||
              (localCancellationStatus === "Refunded" && /pay/i.test(paymentMethod)) ? (
                <>
                  <label className="crw-label">1. Total Refund Amount</label>
                  <input
                    className="crw-input"
                    placeholder="Enter the total refund amount"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                  />

                  <label className="crw-label">2. Upload an image or screenshot of your refund payment receipt</label>

                  {!proofPreviewUrl && (
                    <label className="crw-upload-img">
                      <span className="crw-upload-text">
                        Upload Proof of Refund Payment
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofFile}
                      />
                    </label>
                  )}

                  {proofPreviewUrl && localCancellationStatus === "Processing" &&
                    <label className="crw-upload-img-active">
                      <span className="crw-upload-text-active">
                        Change Proof of Refund Payment
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofFile}
                      />
                    </label>
                  }

                  {proofPreviewUrl && (
                    <img className="crw-proof-preview" src={proofPreviewUrl} alt="proof" />
                  )}

                  <label className="crw-label">3. PayPal Transaction ID</label>
                  <input
                    className="crw-input"
                    placeholder="Enter your PayPal transaction ID"
                    value={paypalTxId}
                    onChange={(e) => setPaypalTxId(e.target.value)}
                  />

                  <div className="crw-action-column">

                    {localCancellationStatus === "Processing" && (
                      <button
                        className="crw-primary-btn"
                        onClick={handleSubmitAsRefunded}
                        disabled={ !refundAmount || !paypalTxId.trim() || (!proofFile && !proofPreviewUrl)
                        }
                      >
                        Submit as Refunded
                      </button>
                    )}
                  </div>
                </>
              ) : null}

              {/* COMPLETED + CASH */}
              {localCancellationStatus === "Completed" &&
                /cash/i.test(paymentMethod) && (
                  <>
                    <label className="crw-label">1. Reason for Cancellation</label>
                    <input
                      className="crw-input"
                      value={localCancelRecord?.reasonForCancellation || ""}
                      readOnly
                    />

                    <label className="crw-label">2. Comments</label>
                    <textarea
                      className="crw-textarea"
                      value={localCancelRecord?.cancelComments || ""}
                      readOnly
                    />

                    <div className="crw-action-column">
                      <button className="crw-danger-btn" onClick={handleDeleteCancel}>
                        Delete
                      </button>
                    </div>
                  </>
                )}

              {/* COMPLETED + PAYPAL VIEW ONLY */}
              {localCancellationStatus === "Completed" &&
                /pay/i.test(paymentMethod) && (
                  <>
                    <label className="crw-label">1. Total Refund Amount</label>
                    <input
                      className="crw-input"
                      value={refundAmount}
                      readOnly
                    />

                    <label className="crw-label">2. Proof of Payment</label>
                    {proofPreviewUrl && (
                      <img className="crw-proof-preview" src={proofPreviewUrl} alt="proof" />
                    )}

                    <label className="crw-label">3. PayPal Transaction ID</label>
                    <input
                      className="crw-input"
                      value={paypalTxId}
                      readOnly
                    />

                    <div className="crw-action-column">
                      <button className="crw-danger-btn" onClick={handleDeleteCancel}>
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

export default CancelReview;