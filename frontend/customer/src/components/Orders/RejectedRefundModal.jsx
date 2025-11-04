import {React, useState, useContext } from 'react'
import './RejectedRefundModal.css'
import { ShopContext } from '../../context/ShopContext';
import { IoCloseOutline } from "react-icons/io5";
import Loading from '../Loading';
import { assets } from '../../assets/assets';

const RejectedRefundModal = () => {
    const { setShowRejectedRefund, orderItemId } = useContext(ShopContext);

    const [loading, setLoading] = useState(false);

    const handleCloseButton = () => {
        setShowRejectedRefund(false);
    }

    // Fetch the rejected refund message from the admin later

  return (
    <div className='rejectfund-order-bg'>
            {loading && <Loading />}
            <div className='rejectfund-modal-card'>
                <IoCloseOutline className="close-refund-btn" onClick={handleCloseButton}/>
                <div className='rejectfund-content-ctn'>
                    <p className='rejectfund-title'>Return/Refund Request Rejected</p>
                    <div className='refund-reason'>
                        <label>1. Reason for rejecting your refund request</label>
                        <textarea value={'After reviewing your request, we found that the item was delivered in good condition and matched the order details. Since there were no reported issues or damages at the time of delivery, this order does not qualify for a refund under our policy.'} disabled/>
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
