import React, { useContext, useEffect, useMemo, useState } from "react";
import "./CancelReason.css";
import { AdminContext } from "../../context/AdminContextProvider";
import { FaArrowLeft } from "react-icons/fa6";
import Loading from "../../../../customer/src/components/Loading";
import { toast } from "react-toastify";

function CancelReason({ item = null, onClose = () => {} }) {
  const { fetchOrders, fetchOrderItems, fetchCancelledOrders, customerList, cancelSubmitAsRefund, toastError, fetchRefundProof, cancelSubmitAsCompleted, adminDeleteOrderItem } = useContext(AdminContext);

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
                      readOnly
                    />

                    <div className="cr-action-row">
                      <button
                        className="cr-primary-btn"
                        onClick={handleProceedRefund}
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

                  {!proofPreviewUrl && (
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
                  )}

                  {proofPreviewUrl && localCancellationStatus === "Processing" &&
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
                  }

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
                        disabled={ !refundAmount || !paypalTxId.trim() || (!proofFile && !proofPreviewUrl)
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
                      value={refundAmount}
                      readOnly
                    />

                    <label className="cr-label">2. Proof of Payment</label>
                    {proofPreviewUrl && (
                      <img className="cr-proof-preview" src={proofPreviewUrl} alt="proof" />
                    )}

                    <label className="cr-label">3. PayPal Transaction ID</label>
                    <input
                      className="cr-input"
                      value={paypalTxId}
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
      </div>
    </div>
    </>
  );
}

export default CancelReason;
