import React, { useContext, useState, useEffect, useMemo } from 'react';
import './OrderProofPayment.css';
import { ShopContext } from '../../context/ShopContext';
import { IoCloseOutline } from "react-icons/io5";
import { MdOutlineUploadFile, MdImage, MdCheckCircle } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from 'react-toastify';

const OrderProofPayment = () => {
  const { 
    orderId, 
    customerId,
    setShowOrderProofPayment, 
    addOrderProofPayment,
    deleteOrderProofPayment,
    currency, 
    toastError, 
    fetchOrderProofPayment 
  } = useContext(ShopContext);

  const [referenceId, setReferenceId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Find existing payment proof for this order
  const existingProof = useMemo(() => {
    return fetchOrderProofPayment.find(
      proof => proof.orderId === orderId && proof.customerId === customerId
    );
  }, [fetchOrderProofPayment, orderId, customerId]);

  const isViewMode = !!existingProof;

  // Populate fields if viewing existing proof
  useEffect(() => {
    if (existingProof) {
      setReferenceId(existingProof.referenceId);
      setAmountPaid(existingProof.amountPaid);
      setImagePreview(existingProof.receiptImage);
    }
  }, [existingProof]);

  const handleClose = () => {
    setShowOrderProofPayment(false);
    setReferenceId('');
    setAmountPaid('');
    setReceiptImage(null);
    setImagePreview(null);
    setIsSubmitting(false);
    setIsDeleting(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Image must be less than 20MB", { ...toastError });
        return;
      }
      setReceiptImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReceiptImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!referenceId || !amountPaid || !receiptImage) {
      return toast.error("All fields are required.", { ...toastError });
    }

    setIsSubmitting(true);

    const result = await addOrderProofPayment(orderId, referenceId, amountPaid, receiptImage);

    setIsSubmitting(false);

    if (result) {
      handleClose();
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  const handleDelete = async () => {
    if (!existingProof) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this payment proof? This action cannot be undone."
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    const result = await deleteOrderProofPayment(existingProof.paymentProofId);

    setIsDeleting(false);

    if (result) {
      handleClose();
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  return (
    <div className="proof-payment-bg">
      <div className="proof-payment-card">
        <IoCloseOutline className="close-proof-btn" onClick={handleClose} />

        <div className="proof-header">
          {isViewMode ? (
            <>
              <MdCheckCircle className="proof-header-icon proof-header-icon-success" />
              <h2 className="proof-title">Payment Proof Submitted</h2>
              <p className="proof-subtitle">Uploaded PayPal payment receipt</p>
            </>
          ) : (
            <>
              <MdOutlineUploadFile className="proof-header-icon" />
              <h2 className="proof-title">Payment Proof Submission</h2>
              <p className="proof-subtitle">Upload your PayPal payment receipt</p>
            </>
          )}
        </div>

        <div className="proof-form-group">
          <label className="proof-label">
            PayPal Reference ID {!isViewMode && <span className="required-asterisk">*</span>}
          </label>
          <input
            type="text"
            className="proof-input"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="e.g., PAYPAL-TXN-ABC123456"
            disabled={isViewMode}
            required={!isViewMode}
          />
        </div>

        <div className="proof-form-group">
          <label className="proof-label">
            Amount Paid {!isViewMode && <span className="required-asterisk">*</span>}
          </label>
          <div className="proof-amount-wrapper">
            <span className="proof-currency">{currency}</span>
            <input
              type="number"
              className="proof-input proof-amount-input"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={isViewMode}
              required={!isViewMode}
            />
          </div>
        </div>

        <div className="proof-form-group">
          <label className="proof-label">
            Receipt Image {!isViewMode && <span className="required-asterisk">*</span>}
          </label>
          
          {!imagePreview && !isViewMode ? (
            <label className="proof-upload-area">
              <input
                type="file"
                className="proof-file-input"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              <div className="proof-upload-content">
                <MdImage className="proof-upload-icon" />
                <p className="proof-upload-text">Click to upload receipt</p>
                <p className="proof-upload-hint">PNG, JPG, JPEG (Max 20MB)</p>
              </div>
            </label>
          ) : (
            <div className="proof-image-preview-container">
              <div className="proof-image-preview">
                <img src={imagePreview} alt="Receipt Preview" />
              </div>
              {!isViewMode && (
                <div className="proof-image-actions">
                  <p className="proof-image-name">{receiptImage?.name || 'Uploaded Receipt'}</p>
                  <div className="proof-image-buttons">
                    <label className="proof-change-btn">
                      Change
                      <input
                        type="file"
                        className="proof-file-input"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <button type="button" className="proof-remove-btn" onClick={handleRemoveImage}>
                      Remove
                    </button>
                  </div>
                </div>
              )}
              {isViewMode && (
                <div className="proof-image-info">
                  <p className="proof-upload-date">
                    Uploaded on: {new Date(existingProof.paymentProofDate).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {isViewMode ? (
          <button
            type="button"
            className="proof-delete-btn"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="proof-spinner"></span>
                Deleting...
              </>
            ) : (
              <>
                <RiDeleteBin6Line />
                Delete Proof of Payment
              </>
            )}
          </button>
        ) : (
          <button
            type="submit"
            className="proof-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || !referenceId || !amountPaid || !receiptImage}
          >
            {isSubmitting ? (
              <>
                <span className="proof-spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Proof of Payment'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderProofPayment;