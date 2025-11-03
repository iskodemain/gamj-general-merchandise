import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../../context/ShopContext';
import { IoCloseOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import './CancelOrderModal.css'

const CancelOrderModal = () => {
    const { orderItemId, products, fetchOrderItems, paymentUsed, setCancelOrder, currency, reasonForCancellation, setReasonForCancellation, cancelComments, setCancelComments, cancelPaypalEmail, setCancelPaypalEmail, cancellationStatus, setCancellationStatus, cancelledBy, addCancelOrder, fetchCancelledOrders, cancelOrderRequest, markRefundReceived} = useContext(ShopContext);

    const [existingCancel, setExistingCancel] = useState(null);

    // ✅ Find the selected item
    const cancelItem = fetchOrderItems.find(item => item.ID === orderItemId);
    const relatedProduct = cancelItem ? products.find(p => p.ID === cancelItem.productId) : null;

    const handleCloseButton = () => {
        setCancelOrder(false);
        setReasonForCancellation('');
        setCancelComments('');
        setCancelPaypalEmail('');
    }

    // ✅ On modal open, check if this order item already has a cancel record
    useEffect(() => {
        if (!orderItemId || !fetchCancelledOrders?.length) return;
        const found = fetchCancelledOrders.find(c => c.orderItemId === orderItemId);
        if (found) {
            setExistingCancel(found);
            setReasonForCancellation(found.reasonForCancellation || '');
            setCancelComments(found.cancelComments || '');
            setCancelPaypalEmail(found.cancelPaypalEmail || '');
            setCancellationStatus(found.cancellationStatus || '');
        } else {
            setExistingCancel(null);
        }
    }, [orderItemId, fetchCancelledOrders]);

    if (!cancelItem || !relatedProduct) return null;

    const handleSubmitCancelOrder = async (e) => {
        e.preventDefault();

        let statusToUse = cancellationStatus;

        if (!reasonForCancellation) {
            toast.error("Reason for cancellation is required", {...toastError});
            return;
        }

        if (paymentUsed === 'Paypal' && !cancelPaypalEmail) {
            toast.error("PayPal email address is required", {...toastError});
            return;
        }

        if (paymentUsed === 'Cash On Delivery' && cancelledBy === 'Customer') {
            statusToUse = 'Completed';
        }

        if (paymentUsed === 'Paypal' && cancelledBy === 'Customer') {
            statusToUse = 'Processing';
        }
        setCancellationStatus(statusToUse);
        addCancelOrder(orderItemId, reasonForCancellation, cancelComments, cancelPaypalEmail, statusToUse, cancelledBy);
    }

    // 🔹 Cancel Request (remove existing cancel)
    const handleCancelRequest = async () => {
        if (!existingCancel) return;
        const { ID, orderItemId } = existingCancel;
        cancelOrderRequest(orderItemId, ID);
        setExistingCancel(null);
        setCancelOrder(false);
        setReasonForCancellation('');
        setCancelComments('');
        setCancelPaypalEmail('');
    };

    // 🔹 Mark refund as received
    const handleReceivedRefund = async () => {
        if (!existingCancel) return;
        const { ID } = existingCancel;
        markRefundReceived(ID);
        setExistingCancel(null);
        setCancelOrder(false);
        setReasonForCancellation('');
        setCancelComments('');
        setCancelPaypalEmail('');
    };

    return (
        <div className='cancel-order-bg'>
            <form onSubmit={handleSubmitCancelOrder}  className='cancel-modal-card'>
                <IoCloseOutline className="close-cancel-btn" onClick={handleCloseButton}/>
                <div className='cancel-content-ctn'>
                <p className='cancel-title'>Order Cancellation Request</p>
                {/* FIRST CONTENT */}
                <div className='cancel-order-item'>
                    <div className='cancel-item-details'>
                    <img src={relatedProduct.image1} alt={relatedProduct.productName} className='w-20 sm:w-25'/>
                    <div className='cancel-item-info'>
                        <p className='cancel-product-name'>{relatedProduct.productName}</p>

                        <div className='vq-cancel-info'>

                        {cancelItem.value && (
                            <div className='cancel-variant'>
                            <p>Variant: <span>{cancelItem.value}</span></p>
                            </div>
                        )}
                        <div className='cancel-quantity'>
                            <p>Quantity: <span>{cancelItem.quantity}</span></p>
                        </div>
                        </div>

                        <p className='cancel-price'>
                        Price: {currency}{Number(cancelItem.subTotal).toFixed(2)}
                        </p>
                    </div>
                    </div>
                    <div className='cancel-payment'>
                        <p>Payment: <span className='pm-small'>{paymentUsed}</span></p>
                    </div>
                </div>
                {/* SECOND CONTENT */}
                <div className='cancel-form'>
                    <label>1. Select a Reason for Cancellation</label>
                    <select value={reasonForCancellation} onChange={(e) => setReasonForCancellation(e.target.value)} className='cancel-input'>
                    <option value="" disabled hidden>Select Reason</option>
                    <option value="Change of mind">Change of mind</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Found a better price">Found a better price</option>
                    <option value="Other">Other</option>
                    </select>
                    <textarea value={cancelComments} onChange={(e) => setCancelComments(e.target.value)} className='cancel-textarea' placeholder="Additional Comments (optional)"/>

                    <div className='paypal-form'>
                    {paymentUsed === "Paypal" && (
                        <>
                        <label>2. Give your PayPal email address for a refund</label>
                        <input type="text" value={cancelPaypalEmail} onChange={(e) => setCancelPaypalEmail(e.target.value)} className='cancel-input' placeholder="Enter your PayPal account email address."/>
                        </>
                    )}
                    </div>
                </div>

                {/* BUTTON */}
                {!existingCancel ? (
                    <button
                    className='cancel-submit-btn'
                    type='submit'
                    disabled={!reasonForCancellation || (paymentUsed === 'Paypal' && !cancelPaypalEmail)}
                    >
                    Submit
                    </button>
                ) : (
                    <div className="existing-cancel-btns">
                    <button type="button" className="cancel-request-btn" onClick={handleCancelRequest}>
                        Cancel Request
                    </button>
                    <button type="button" className="refund-received-btn" onClick={handleReceivedRefund}>
                        I’ve already received my refund
                    </button>
                    </div>
                )}
                </div>
            </form>
        </div>
    );
}

export default CancelOrderModal