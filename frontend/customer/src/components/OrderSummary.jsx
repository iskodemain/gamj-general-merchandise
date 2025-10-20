import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import MainTitle from './MainTitle.jsx';
import './OrderSummary.css'

function OrderSummary() {
    const {currency, shippingFee, orderSubTotal, totalPrice, getTotalPrice} = useContext(ShopContext);


    
    useEffect(() => {
      const finalTotal = orderSubTotal + shippingFee
      getTotalPrice(finalTotal.toFixed(2));
    }, [orderSubTotal, getTotalPrice, shippingFee])
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
        <div className='ordersum-list'>
            <b>Total</b>
            <p className='ordersum-price'>{currency}{orderSubTotal === 0 ? 0 : totalPrice}</p>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
