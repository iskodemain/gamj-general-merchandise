import React, { useContext } from 'react';
import { AdminContext } from '../../context/AdminContextProvider';
import { IoCloseOutline } from "react-icons/io5";
import { MdCheckCircle, MdReceipt } from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import './OrderPaymentProof.css';

const OrderPaymentProof = () => {
  const {  selectedPaymentProof, setShowOrderPaymentProof, currency} = useContext(AdminContext);

  if (!selectedPaymentProof) return null;

  const handleClose = () => {
    setShowOrderPaymentProof(false);
  };

  const handleDownloadReceipt = async () => {
    try {
        // Fetch the image
        const response = await fetch(selectedPaymentProof.receiptImage);
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename: receipt-REFID-DATE.extension
        const fileExtension = selectedPaymentProof.receiptImage.split('.').pop().split('?')[0];
        const fileName = `receipt-${selectedPaymentProof.referenceId}-${new Date().getTime()}.${fileExtension}`;
        link.download = fileName;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
        // Fallback: open in new tab if download fails
        window.open(selectedPaymentProof.receiptImage, '_blank');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="opp-overlay">
      <div className="opp-modal">
        <IoCloseOutline className="opp-close-btn" onClick={handleClose} />

        {/* HEADER */}
        <div className="opp-header">
          <MdCheckCircle className="opp-header-icon" />
          <h2 className="opp-title">Payment Proof Details</h2>
          <p className="opp-subtitle">Customer's PayPal payment receipt</p>
        </div>

        {/* CONTENT */}
        <div className="opp-content">
          {/* REFERENCE ID */}
          <div className="opp-field">
            <label className="opp-label">PayPal Reference ID</label>
            <div className="opp-value opp-reference">
              {selectedPaymentProof.referenceId}
            </div>
          </div>

          {/* AMOUNT PAID */}
          <div className="opp-field">
            <label className="opp-label">Amount Paid</label>
            <div className="opp-value opp-amount">
              {currency}{parseFloat(selectedPaymentProof.amountPaid).toFixed(2)}
            </div>
          </div>

          {/* UPLOAD DATE */}
          <div className="opp-field">
            <label className="opp-label">Uploaded On</label>
            <div className="opp-value opp-date">
              {formatDate(selectedPaymentProof.paymentProofDate)}
            </div>
          </div>

          {/* RECEIPT IMAGE */}
          <div className="opp-field">
            <label className="opp-label">Receipt Image</label>
            <div className="opp-image-container">
              <img 
                src={selectedPaymentProof.receiptImage} 
                alt="Payment Receipt" 
                className="opp-image"
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="opp-footer">
          <button 
            type="button"
            className="opp-download-btn"
            onClick={handleDownloadReceipt}
          >
            <FiDownload />
            Download Receipt
          </button>
          
          <button 
            type="button"
            className="opp-close-footer-btn"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentProof;