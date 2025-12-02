import React, { useContext, useEffect, useState } from 'react'
import './RefundOrderModal.css'
import { ShopContext } from '../../context/ShopContext';
import { IoCloseOutline } from "react-icons/io5";
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import Loading from '../Loading';

const RefundOrderModal = () => {
    const { orderItemId, setRefundOrder, reasonForRefund, setReasonForRefund, refundComments, setRefundComments,imageProof1, setImageProof1, imageProof2, setImageProof2, refundResolution, setRefundResolution, refundMethod, setRefundMethod, refundPaypalEmail, setRefundPaypalEmail, refundStatus, setRefundStatus, otherReason, setOtherReason, addOrderRefund, fetchOrderRefund, cancelOrderRefundRequest } = useContext(ShopContext);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const [refundInfoComplete, setRefundInfoComplete] = useState(false);
    const [existingRefund, setExistingRefund] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const isDisabled = existingRefund && (existingRefund.refundStatus === 'Pending' || existingRefund.refundStatus === 'Processing');

    /* ✅ On modal open: find if there's already a refund for this orderItemId */
    useEffect(() => {
        if (!orderItemId || !fetchOrderRefund?.length) return;

        const found = fetchOrderRefund.find(
        (r) => r.orderItemId === orderItemId && ['Pending', 'Processing', 'Successfully Processed', 'Rejected'].includes(r.refundStatus)
        );

        if (found) {
            // Only show loading when existing refund found
            setModalLoading(true);
            setExistingRefund(found);

            // Populate fields
            setReasonForRefund(found.reasonForRefund || '');
            setRefundComments(found.refundComments || '');
            setRefundResolution(found.refundResolution || '');
            setRefundMethod(found.refundMethod || '');
            setRefundPaypalEmail(found.refundPaypalEmail || '');
            setRefundStatus(found.refundStatus || 'Pending');
            setOtherReason(found.otherReason || '');
            // proofs: backend urls (keep as null for now since files can't be refetched easily)
            setImageProof1(found.imageProof1 || null);
            setImageProof2(found.imageProof2 || null);
            
            // Simulate small load time then hide loader
            const timeout = setTimeout(() => setModalLoading(false), 300);
            return () => clearTimeout(timeout);
        } else {
            setExistingRefund(null);
            setReasonForRefund('');
            setRefundComments('');
            setRefundResolution('');
            setRefundMethod('');
            setRefundPaypalEmail('');
            setRefundStatus('Pending');
            setOtherReason('');
            setImageProof1(null);
            setImageProof2(null);
        }
        
    }, [orderItemId, fetchOrderRefund]);




    // FORM COMPLETION 
    useEffect(() => {
        let complete = false;
        if (reasonForRefund && imageProof1 && imageProof2 && refundResolution) {
            // CASE 1: Return and Refund
            if (refundResolution === 'Return and Refund' && refundMethod) {
                if (refundMethod === 'PayPal Refund — Refund will be processed to your PayPal account.' && refundPaypalEmail) {
                    complete = true;
                } else if (refundMethod === 'Cash Refund — Receive your refund in cash.') {
                    complete = true;
                }
            }

            // CASE 2: Other (please specify)
            else if (refundResolution === 'Other (please specify)' && otherReason && refundMethod) {
                if (refundMethod === 'PayPal Refund — Refund will be processed to your PayPal account.' && refundPaypalEmail) {
                    complete = true;
                } else if (refundMethod === 'Cash Refund — Receive your refund in cash.' || refundMethod === "No Refund Needed — I don't need a refund") {
                    complete = true;
                }
            }

            // CASE 3: No refund method required (auto-complete)
            else if (refundResolution === 'Resend Missing Items' || refundResolution === 'Replace with a New Item' || refundResolution === 'Return Only') {
                complete = true;
            }
        }
        setRefundInfoComplete(complete);
    }, [reasonForRefund, imageProof1, imageProof2, refundResolution, refundMethod, otherReason, refundPaypalEmail]);


    const handleCloseButton = () => {
        setRefundOrder(false);
        setReasonForRefund('');
        setRefundComments('');
        setImageProof1(null);
        setImageProof2(null);
        setRefundResolution('');
        setRefundMethod('');
        setRefundPaypalEmail('');
        setOtherReason('');
        setIsSubmitting(false);
        setIsCancelling(false);
    }

    const handleSubmitRefundOrder = async (e) => {
        e.preventDefault();
        // FRONTEND VALIDATIONS
        if (!orderItemId) {
            return toast.error("Order item not found.");
        }
        if (!reasonForRefund) {
            return toast.error("Please select a reason for your return.");
        }
        if (!imageProof1 || !imageProof2) {
            return toast.error("Please upload 2 images as proof.");
        }
        if (!refundResolution) {
            return toast.error("Please select a return request solution.");
        }

        if (refundResolution === 'Return and Refund' || refundResolution === 'Other (please specify)') {
            if (!refundMethod) {
                return toast.error("Please select your refund method.");
            }
            if (refundMethod === 'PayPal Refund — Refund will be processed to your PayPal account.' && !refundPaypalEmail) {
                return toast.error("Please provide your PayPal email address.");
            }
            
        }
        setIsSubmitting(true); 
        await addOrderRefund(orderItemId, reasonForRefund, refundComments, imageProof1, imageProof2, refundResolution, otherReason, refundMethod, refundPaypalEmail, refundStatus);
        setIsSubmitting(false); 
        handleCloseButton();
    }

    /* Cancel Order Refund Request */
    const handleCancelRefundRequest = async (orderRefundId, orderItemId) => {
        if (!orderRefundId || !orderItemId) {
            toast.error("No refund request found to cancel.");
            return;
        }

        setIsCancelling(true); 
        await cancelOrderRefundRequest(orderRefundId, orderItemId);
        setIsCancelling(false);
        setRefundOrder(false);
    };

    const renderButton = () => {
        if (!existingRefund) {
            return (
            <button type="submit" className="refund-request-btn" disabled={!refundInfoComplete}>
                {isSubmitting  ? "Submitting..." : "Submit Return Request"}
            </button>
            );
        }

        if (existingRefund.refundStatus === 'Pending') {
            return (
            <button type="button" className="refund-request-btn cancel-btn" onClick={() => handleCancelRefundRequest(existingRefund.ID, existingRefund.orderItemId)}>
                {isCancelling ? "Cancelling..." : "Cancel Request"}
            </button>
            );
        } 
        else if (existingRefund.refundStatus === 'Processing') {
            return (
            <button type="button" className="refund-request-btn waiting-btn" disabled>
                Waiting for Approval...
            </button>
            );
        } 
    };




  return (
    <div className='refund-order-bg'>
        {(isSubmitting || isCancelling || modalLoading) && <Loading />}
        <form onSubmit={handleSubmitRefundOrder}  className='refund-modal-card'>
            <IoCloseOutline className="close-refund-btn" onClick={handleCloseButton}/>
            <div className="refund-content-ctn">
                <p className='refund-title'>Return/Refund Request</p>
                {/* FIRST CONTENT */}
                <div className={`refund-form ${isDisabled ? 'disabled-refund-section' : ''}`}>
                    <label>1. Select the reason for your return</label>
                    <select value={reasonForRefund} onChange={(e) => setReasonForRefund(e.target.value)} className='cancel-input' disabled={isDisabled}>
                    <option value="" disabled hidden>Select Reason</option>
                    <option value="Order not received">Order not received</option>
                    <option value="Incomplete product received">Incomplete product received</option>
                    <option value="Incorrect product received">Incorrect product received</option>
                    <option value="Physically damaged product">Physically damaged product</option>
                    <option value="Defective product received">Defective product received</option>
                    <option value="Other">Other</option>
                    </select>
                    <textarea value={refundComments} onChange={(e) => setRefundComments(e.target.value)} className='refund-textarea' placeholder="Additional Comments (optional)" disabled={isDisabled}/>
                </div>

                {/* SECOND CONTENT */}
                <div className={`refund-form ${isDisabled ? 'disabled-refund-section' : ''}`}>
                    <label>2. Select at least two images as proof.</label>

                    <div className='refund-image-upload-ctn'>
                        <label htmlFor='imageProof1' className={`${imageProof1 ? 'has-image' : ''}`}>
                            <img src={imageProof1 instanceof File ? URL.createObjectURL(imageProof1): imageProof1 || assets.refund_img_uploader} alt="" />
                            <input id="imageProof1" type="file" accept="image/*" onChange={(e) => setImageProof1(e.target.files[0])} hidden disabled={isDisabled}/>
                        </label>

                        <label htmlFor='imageProof2' className={`${imageProof2 ? 'has-image' : ''}`}>
                            <img src={ imageProof2 instanceof File ? URL.createObjectURL(imageProof2) : imageProof2 || assets.refund_img_uploader} alt="" />
                            <input id="imageProof2" type="file" accept="image/*" onChange={(e) => setImageProof2(e.target.files[0])} hidden disabled={isDisabled}/>
                        </label>
                    </div>
                </div>


                {/* THIRD CONTENT */}
                <div className={`refund-form ${isDisabled ? 'disabled-refund-section' : ''}`}>
                    <label>3. Select a return request solutions</label>
                    <select 
                        value={refundResolution} 
                        onChange={(e) => {
                            const newResolution = e.target.value;
                            setRefundResolution(newResolution);
                            setRefundMethod('');
                            setRefundPaypalEmail('');
                        }}
                        className='cancel-input'
                        disabled={isDisabled}
                    >
                    <option value="" disabled hidden>Select Return Request</option>
                    <option value="Return and Refund">Return and Refund</option>
                    <option value="Resend Missing Items">Resend Missing Items</option>
                    <option value="Replace with a New Item">Replace with a New Item</option>
                    <option value="Return Only">Return Only</option>
                    <option value="Other (please specify)">Other (please specify)</option>
                    </select>
                    { 
                        refundResolution === 'Other (please specify)' && 
                        <input type="text" placeholder='Please specify' value={otherReason} onChange={(e) => setOtherReason(e.target.value)} disabled={isDisabled}/>
                    }
                </div>


                {/* FOURTH CONTENT */}
                    {
                        (refundResolution === 'Other (please specify)' || refundResolution === 'Return and Refund') && (
                            <div className={`refund-form ${isDisabled ? 'disabled-refund-section' : ''}`}>
                                <label>4. Select your preferred refund method</label>
                                <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)} className='cancel-input' disabled={isDisabled}>
                                    <option value="" disabled hidden>Select Refund Method</option>
                                    <option value="PayPal Refund — Refund will be processed to your PayPal account.">PayPal Refund — Refund will be processed to your PayPal account.</option>
                                    <option value="Cash Refund — Receive your refund in cash.">Cash Refund — Receive your refund in cash.</option>
                                    {   
                                        refundResolution === 'Other (please specify)' &&
                                        <option value="No Refund Needed — I don't need a refund">No Refund Needed — I don't need a refund</option> 
                                    }
                                </select>
                            </div>
                        )
                    }
               

                {/* FIFTH CONTENT */}
                <div className={`refund-form ${isDisabled ? 'disabled-refund-section' : ''}`}>
                    {
                        refundMethod === 'PayPal Refund — Refund will be processed to your PayPal account.' && (refundResolution === 'Return and Refund' || refundResolution === 'Other (please specify)') && (
                            <>
                                <label>5. Give your PayPal email address.</label>
                                <input type="email" placeholder='Enter your PayPal account email address.' value={refundPaypalEmail} onChange={(e) => setRefundPaypalEmail(e.target.value)} required disabled={isDisabled}/>
                            </>
                        )
                    }
                </div>

                {renderButton()}
            </div>
        </form>
    </div>
  )
}

export default RefundOrderModal
