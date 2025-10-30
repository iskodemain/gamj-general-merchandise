import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets';
import './RefundReceiptModal.css'
import { ShopContext } from '../../context/ShopContext';
import { IoCloseOutline } from "react-icons/io5";
import Loading from '../Loading'

const RefundReceiptModal = () => {
    const { currency, setViewRefundReceipt, markRefundReceived, fetchCancelledOrders, orderItemId, fetchRefundProof } = useContext(ShopContext);

    const [viewReceiptImage, setViewReceiptImage] = useState(false);
    const [cancelRecord, setCancelRecord] = useState(null);
    const [refundProofData, setRefundProofData] = useState(null);

    // 🧩 Find the cancel record for this order item
    useEffect(() => {
        if (!orderItemId || !fetchCancelledOrders?.length) return;
        const found = fetchCancelledOrders.find(c => c.orderItemId === orderItemId);
        setCancelRecord(found || null);
    }, [orderItemId, fetchCancelledOrders]);


     /* 🔹 Step 2: Once cancelRecord is known, find matching refund proof */
    useEffect(() => {
        if (!cancelRecord || !fetchRefundProof?.length) {
            setRefundProofData(null);
            return;
        }
        const proof = fetchRefundProof.find(p => p.cancelId === cancelRecord.ID);
        setRefundProofData(proof || null);
    }, [cancelRecord, fetchRefundProof]);


    const handleMarkAsReceived = () => {
        if (!cancelRecord) {
            console.warn("No matching cancel record found for this order item.");
            return;
        }

        markRefundReceived(cancelRecord.ID);
        setViewRefundReceipt(false);
    };

    /* 🔹 Step 4: View full receipt image overlay */
    const ViewReceiptImage = () => {
        if (!refundProofData?.receiptImage) return null;
        return (
            <div className="receipt-image-bg">
                <IoCloseOutline className="receipt-image-btn" onClick={() => setViewReceiptImage(false)}/>
                <div className="receipt-image-card">
                    
                    <img 
                        src={refundProofData.receiptImage} 
                        alt="Refund Receipt" 
                        className="receipt-image-preview" 
                    />
                </div>
            </div>
        );
    };


    if (!cancelRecord || !refundProofData) {
        return <Loading />;
    }
  return (
    <div className="refund-receipt-bg">
        {viewReceiptImage && <ViewReceiptImage />}
        <div className="refund-receipt-card">
            <IoCloseOutline className="close-receipt-btn" onClick={() => setViewRefundReceipt(false)}/>
            <h2 className='refund-receipt-title'>Review Your Receipt</h2>
            <p className='refund-receipt-amount'>{currency}{Number(refundProofData.refundAmount).toFixed(2)}</p>
            <p className='refund-receipt-amount-details'>Total Returned</p>

            <button className='view-receipt-image-ctn' type='button' onClick={() => setViewReceiptImage(true)}>
                <div className='vr-image-sctn'>
                    <img src={assets.view_receipt_icon} alt="" />
                </div>
                <p className='vr-image-title'>View Refund Receipt</p>
            </button>

            <div className='transaction-id-ctn'>
                <div className='ti-image-sctn'>
                    <img src={assets.transaction_id_icon} alt="" />
                </div>
                <div className='ti-details-ctn'>
                    <p className='ti-title'>{refundProofData.transactionID}</p>
                    <p className='ti-details'>Transaction ID</p>
                </div>
            </div>

            <button className='mar-btn' type='button' onClick={handleMarkAsReceived}>Successfully Mark as Received</button>

            <footer className='rrm-footer'>
                <p className='footer-contact-info'>For Further Concerns, Here Is Our Contact Information.</p>
                <div className='rrm-contact-info'>
                    <a href="" target='blank' rel="noopener noreferrer"><img src={assets.gmail_icon} alt="" className='rrm-img'/></a>
                    <a href="" target='blank' rel="noopener noreferrer"><img src={assets.viber_icon} alt="" className='rrm-img'/></a>
                    <a href="" target='blank' rel="noopener noreferrer"><img src={assets.call_icon} alt="" className='rrm-img'/></a>
                    <a href="" target='blank' rel="noopener noreferrer"><img src={assets.messenger_icon} alt="" className='rrm-img'/></a>
                </div>
            </footer>
        </div>
    </div>
  )
}

export default RefundReceiptModal
