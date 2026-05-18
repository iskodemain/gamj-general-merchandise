import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import MainTitle from './MainTitle.jsx';
import './OrderSummary.css'

function OrderSummary() {
    const {currency, shippingFee, orderSubTotal, totalPrice, getTotalPrice, paymentMethod, paypalFee, setPaypalFee} = useContext(ShopContext);

    // PayPal fee constants (must match backend .env)
    const PAYPAL_PERCENT_FEE = 0.039;
    const PAYPAL_FIXED_FEE = 15;

    // Calculate grossed-up PayPal fee whenever payment method or subtotal changes
    useEffect(() => {
        if (paymentMethod === 'Paypal' && orderSubTotal > 0) {
            const base = orderSubTotal + shippingFee;
            const grossed = (base + PAYPAL_FIXED_FEE) / (1 - PAYPAL_PERCENT_FEE);
            const grossedRounded = Math.ceil(grossed * 100) / 100;
            const fee = parseFloat((grossedRounded - base).toFixed(2));
            setPaypalFee(fee);
            getTotalPrice(grossedRounded.toFixed(2));
        } else {
            setPaypalFee(0);
            const finalTotal = orderSubTotal + shippingFee;
            getTotalPrice(finalTotal.toFixed(2));
        }
    }, [orderSubTotal, shippingFee, paymentMethod]);

    return (
        <div className='ordersum-head'>
            <div className='text-2xl'>
                <MainTitle mtext1={'ORDER'} mtext2={'SUMMARY'}/>
            </div>
            <div className='ordersum-content'>
                <div className='ordersum-list'>
                    <p>Subtotal</p>
                    <p className='ordersum-price'>{currency}{orderSubTotal.toFixed(2)}</p>
                </div>
                <hr />
                <div className='ordersum-list sf'>
                    <p>Shipping Fee</p>
                    <p className='ordersum-price'>{currency}{shippingFee.toFixed(2)}</p>
                </div>
                {paymentMethod === 'Paypal' && paypalFee > 0 && (
                    <div className='ordersum-list sf'>
                        <p>PayPal Fee</p>
                        <p className='ordersum-price'>{currency}{paypalFee.toFixed(2)}</p>
                    </div>
                )}
                <div className='ordersum-list'>
                    <b>Total</b>
                    <p className='ordersum-price'>{currency}{orderSubTotal === 0 ? 0 : totalPrice}</p>
                </div>
            </div>
        </div>
    )
}

export default OrderSummary
