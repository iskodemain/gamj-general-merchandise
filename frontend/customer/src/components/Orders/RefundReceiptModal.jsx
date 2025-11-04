import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets';
import './RefundReceiptModal.css'
import { ShopContext } from '../../context/ShopContext';
import { IoCloseOutline } from "react-icons/io5";
import Loading from '../Loading'

const RefundReceiptModal = () => {
    const { currency, setViewRefundReceipt, markRefundReceived, fetchCancelledOrders, fetchOrderRefund, orderItemId, fetchRefundProof } = useContext(ShopContext);

    const [viewReceiptImage, setViewReceiptImage] = useState(false);
    const [record, setRecord] = useState(null); // can be cancel or refund record
    const [refundProofData, setRefundProofData] = useState(null);
    const [isCancel, setIsCancel] = useState(false);

    // 🔹 Step 1: Identify whether the selected orderItem belongs to cancel or refund
    useEffect(() => {
        if (!orderItemId) return;

        // Try find in cancelledOrders
        const cancelFound = fetchCancelledOrders?.find(c => c.orderItemId === orderItemId);
        if (cancelFound) {
            setRecord(cancelFound);
            setIsCancel(true);
            return;
        }

        // Try find in refundOrders (for Return/Refund)
        const refundFound = fetchOrderRefund?.find(r => r.orderItemId === orderItemId);
        if (refundFound) {
            setRecord(refundFound);
            setIsCancel(false);
            return;
        }

        setRecord(null);
    }, [orderItemId, fetchCancelledOrders, fetchOrderRefund]);


     // 🔹 Step 2: Find matching refund proof (either by cancelId or refundId)
    useEffect(() => {
        if (!record || !fetchRefundProof?.length) {
            setRefundProofData(null);
            return;
        }

        let proof = null;

        if (isCancel) {
            proof = fetchRefundProof.find(p => p.cancelId === record.ID && p.refundId === null);
        } else {
            proof = fetchRefundProof.find(p => p.refundId === record.ID && p.cancelId === null);
        }

        setRefundProofData(proof || null);
    }, [record, fetchRefundProof, isCancel]);


    const handleMarkAsReceived = () => {
        if (!record) return;
        
        const cancelId = isCancel ? record.ID : null;
        const refundId = !isCancel ? record.ID : null;

        markRefundReceived(cancelId, refundId);
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


    // If not ready yet
    if (!record || !refundProofData) {
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
