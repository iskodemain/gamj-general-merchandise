import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import MainTitle from './MainTitle.jsx';
import './OrderSummary.css'

function OrderSummary() {
    const {currency, shippingFee, subtotal, totalPrice, getTotalPrice} = useContext(ShopContext);


    
    useEffect(() => {
      const finalTotal = subtotal + shippingFee
      getTotalPrice(finalTotal.toFixed(2));
    }, [subtotal, getTotalPrice, shippingFee])
  return (
    <div className='ordersum-head'>
      <div className='text-2xl'>
        <MainTitle mtext1={'ORDER'} mtext2={'SUMMARY'}/>
      </div>
      <div className='ordersum-content'>
        <div className='ordersum-list'>
            <p>Subtotal</p>
            <p className='ordersum-price'>{currency}{subtotal.toFixed(2)}</p>
        </div>
        <hr />
        <div className='ordersum-list sf'>
            <p>Shipping Fee</p>
            <p className='ordersum-price'>{currency}{shippingFee.toFixed(2)}</p>
        </div>  
        <div className='ordersum-list'>
            <b>Total</b>
            <p className='ordersum-price'>{currency}{subtotal === 0 ? 0 : totalPrice}</p>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
