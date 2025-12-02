import {React, useState, useContext, useEffect } from 'react'
import './RejectedRefundModal.css'
import { ShopContext } from '../../context/ShopContext';
import { IoCloseOutline } from "react-icons/io5";
import Loading from '../Loading';
import { assets } from '../../assets/assets';

const RejectedRefundModal = () => {
    const { setShowRejectedRefund, orderItemId, fetchOrderRefund } = useContext(ShopContext);

    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState(null);

    const handleCloseButton = () => {
        setShowRejectedRefund(false);
    }

    useEffect(() => {
        if (!orderItemId) return;

        // Try find in refundOrders (for Return/Refund)
        const refundFound = fetchOrderRefund?.find(r => Number(r.orderItemId) === Number(orderItemId));
        if (refundFound) {
            setRecord(refundFound);
            return;
        }

        setRecord(null);
    }, [orderItemId, fetchOrderRefund]);


  return (
    <div className='rejectfund-order-bg'>
            {loading && <Loading />}
            <div className='rejectfund-modal-card'>
                <IoCloseOutline className="close-refund-btn" onClick={handleCloseButton}/>
                <div className='rejectfund-content-ctn'>
                    <p className='rejectfund-title'>Return/Refund Request Rejected</p>
                    <div className='refund-reason'>
                        <label>1. Reason for rejecting your refund request</label>
                        <textarea value={record?.rejectedReason || ""} disabled />
                    </div>

                    <button className='refund-submit-btn' type='button' onClick={handleCloseButton}>Okay, got it</button>

                    <footer className='refund-reject-footer'>
                    <p className='rr-footer-contact-info'>For Further Concerns, Here Is Our Contact Information.</p>
                    <div className='rr-contact-info'>
                        <a href="" target='blank' rel="noopener noreferrer"><img src={assets.gmail_icon} alt="" className='rr-img'/></a>
                        <a href="" target='blank' rel="noopener noreferrer"><img src={assets.viber_icon} alt="" className='rr-img'/></a>
                        <a href="" target='blank' rel="noopener noreferrer"><img src={assets.call_icon} alt="" className='rr-img'/></a>
                        <a href="" target='blank' rel="noopener noreferrer"><img src={assets.messenger_icon} alt="" className='rr-img'/></a>
                    </div>
                </footer>
                </div>
            </div>
        </div>
  )
}

export default RejectedRefundModal
