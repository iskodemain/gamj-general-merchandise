import React, { useContext, useEffect, useState } from 'react'
import './RefundOrderModal.css'
import { ShopContext } from '../../context/ShopContext';
import { IoCloseOutline } from "react-icons/io5";
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import Loading from '../Loading';

const RefundOrderModal = () => {
    const { orderItemId, setRefundOrder, reasonForRefund, setReasonForRefund, refundComments, setRefundComments,imageProof1, setImageProof1, imageProof2, setImageProof2, refundResolution, setRefundResolution, refundMethod, setRefundMethod, refundPaypalEmail, setRefundPaypalEmail, refundStatus, setRefundStatus, otherReason, setOtherReason, addOrderRefund, fetchOrderRefund, cancelOrderRefundRequest, returnQuantity, setReturnQuantity, returnMethod, setReturnMethod, pickupScheduledDate, setPickupScheduledDate, fetchOrderItems } = useContext(ShopContext);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const [refundInfoComplete, setRefundInfoComplete] = useState(false);
    const [existingRefund, setExistingRefund] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const matchedOrderItem = fetchOrderItems?.find(item => item.ID === orderItemId);
    const maxReturnQuantity = matchedOrderItem ? Number(matchedOrderItem.quantity) : 1;

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
            setReturnQuantity(found.returnQuantity || 1);
            setReturnMethod(found.returnMethod || '');
            setPickupScheduledDate(found.pickupScheduledDate ? found.pickupScheduledDate.split('T')[0] : '');

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
            setReturnQuantity(1);
            setReturnMethod('');
            setPickupScheduledDate('');
            setImageProof1(null);
            setImageProof2(null);
        }
        
    }, [orderItemId, fetchOrderRefund]);

    // FORM COMPLETION 
    useEffect(() => {
        let complete = false;

        const needsReturnMethod = [
            'Return and Refund',
            'Return Only',
            'Replace with a New Item',
            'Other (please specify)'
        ].includes(refundResolution);

        if (reasonForRefund && imageProof1 && imageProof2 && refundResolution && Number(returnQuantity) >= 1) {

            // returnMethod required for applicable resolutions
            if (needsReturnMethod && !returnMethod) {
                complete = false;
            }
            // CASE 1: Return and Refund
            else if (refundResolution === 'Return and Refund' && returnMethod && refundMethod) {
                if (refundMethod === 'PayPal Refund — Refund will be processed to your PayPal account.' && refundPaypalEmail) {
                    complete = true;
                } else if (refundMethod === 'Cash Refund — Receive your refund in cash.') {
                    complete = true;
                }
            }
            // CASE 2: Other (please specify)
            else if (refundResolution === 'Other (please specify)' && otherReason && returnMethod && refundMethod) {
                if (refundMethod === 'PayPal Refund — Refund will be processed to your PayPal account.' && refundPaypalEmail) {
                    complete = true;
                } else if (refundMethod === 'Cash Refund — Receive your refund in cash.' || refundMethod === "No Refund Needed — I don't need a refund") {
                    complete = true;
                }
            }
            // CASE 3: Resend Missing Items — no return needed
            else if (refundResolution === 'Resend Missing Items') {
                complete = true;
            }
            // CASE 4: Replace or Return Only — needs returnMethod, no refundMethod
            else if ((refundResolution === 'Replace with a New Item' || refundResolution === 'Return Only') && returnMethod) {
                complete = true;
            }
        }
        setRefundInfoComplete(complete);
    }, [reasonForRefund, imageProof1, imageProof2, refundResolution, refundMethod, otherReason, refundPaypalEmail, returnQuantity, returnMethod]);


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
        setReturnQuantity(1);
        setReturnMethod('');
        setPickupScheduledDate('');
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

        if (!returnQuantity || Number(returnQuantity) < 1) {
            return toast.error("Please enter a valid return quantity.");
        }
        if (Number(returnQuantity) > maxReturnQuantity) {
            return toast.error(`Return quantity cannot exceed the ordered quantity of ${maxReturnQuantity}.`);
        }

        const needsReturnMethod = [
            'Return and Refund',
            'Return Only',
            'Replace with a New Item',
            'Other (please specify)'
        ].includes(refundResolution);

        if (needsReturnMethod && !returnMethod) {
            return toast.error("Please select a return method (Pickup or Drop-off).");
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
        await addOrderRefund(orderItemId, reasonForRefund, refundComments, imageProof1, imageProof2, refundResolution, otherReason, refundMethod, refundPaypalEmail, refundStatus, Number(returnQuantity), returnMethod);
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
                Waiting for Processing...
            </button>
            );
        } 
    };

    let step = 1;
    const nextStep = () => step++;



  return (
    <div className='refund-order-bg'>
        {(isSubmitting || isCancelling || modalLoading) && <Loading />}
        <form onSubmit={handleSubmitRefundOrder}  className='refund-modal-card'>
            <IoCloseOutline className="close-refund-btn" onClick={handleCloseButton}/>
            <div className="refund-content-ctn">
                <p className='refund-title'>Return/Refund Request</p>
                {/* FIRST CONTENT */}
                <div className={`refund-form ${isDisabled ? 'disabled-refund-section' : ''}`}>
                    <label>{nextStep()}. Select the reason for your return</label>
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
                    <label>{nextStep()}. Select at least two images as proof.</label>

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
                    <label>{nextStep()}. Select a return request solutions</label>
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
                                <label>{nextStep()}. Select your preferred refund method</label>
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

                {/* RETURN QUANTITY */}
                <div className={`refund-form ${isDisabled ? 'disabled-refund-section' : ''}`}>
                    <label>
                        {nextStep()}. How many pieces are you returning?
                        {maxReturnQuantity > 0 && (
                            <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#888', marginLeft: '8px' }}>
                                (Max: {maxReturnQuantity} {maxReturnQuantity === 1 ? 'piece' : 'pieces'})
                            </span>
                        )}
                    </label>
                    <input
                        type="number"
                        className="cancel-input"
                        min="1"
                        max={maxReturnQuantity}
                        value={returnQuantity ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;

                            // Allow empty input while typing
                            if (value === "") {
                                setReturnQuantity("");
                                return;
                            }

                            const val = Number(value);

                            if (isNaN(val)) return;

                            if (val > maxReturnQuantity) {
                                setReturnQuantity(maxReturnQuantity);
                            } else if (val < 1) {
                                setReturnQuantity(1);
                            } else {
                                setReturnQuantity(val);
                            }
                        }}
                        placeholder={`Enter quantity (1 - ${maxReturnQuantity})`}
                        disabled={isDisabled}
                    />
                </div>

                {/* RETURN METHOD — only shown for resolutions that require physical return */}
                {['Return and Refund', 'Return Only', 'Replace with a New Item', 'Other (please specify)'].includes(refundResolution) && (
                    <div className={`refund-form ${isDisabled ? 'disabled-refund-section' : ''}`}>
                        <label>{nextStep()}. How will you return the item?</label>
                        <select
                            value={returnMethod}
                            onChange={(e) => setReturnMethod(e.target.value)}
                            className="cancel-input"
                            disabled={isDisabled}
                        >
                            <option value="" disabled hidden>Select Return Method</option>
                            <option value="PICKUP">Pickup — We will arrange a rider to collect the item</option>
                            <option value="DROP_OFF">Drop-off — I will bring the item to the store</option>
                        </select>

                        {/* Show scheduled pickup date only if Processing + PICKUP + date exists */}
                        {existingRefund?.refundStatus === 'Processing' && returnMethod === 'PICKUP' && pickupScheduledDate && (
                            <div className="pickup-schedule-info">
                                <p>Scheduled Pickup Date: <strong>{new Date(pickupScheduledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
                            </div>
                        )}
                    </div>
                )}
               

                {/* FIFTH CONTENT */}
                <div className={`refund-form ${isDisabled ? 'disabled-refund-section' : ''}`}>
                    {
                        refundMethod === 'PayPal Refund — Refund will be processed to your PayPal account.' && (refundResolution === 'Return and Refund' || refundResolution === 'Other (please specify)') && (
                            <>
                                <label>{nextStep()}. Give your PayPal email address.</label>
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
