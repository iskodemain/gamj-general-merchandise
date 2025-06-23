import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import MainTitle from './MainTitle.jsx';
import './OrderSummary.css'

function OrderSummary() {
    const {currency, delivery_fee, totalProductPrice, overallPrice, getOverAllPrice} = useContext(ShopContext);
    console.log(totalProductPrice);
    console.log(overallPrice);

    
    useEffect(() => {
      const finalTotal = totalProductPrice + delivery_fee
      getOverAllPrice(finalTotal.toFixed(2));
    }, [totalProductPrice, overallPrice])
  return (
    <div className='ordersum-head'>
      <div className='text-2xl'>
        <MainTitle mtext1={'ORDER'} mtext2={'SUMMARY'}/>
      </div>
      <div className='ordersum-content'>
        <div className='ordersum-list'>
            <p>Subtotal</p>
            <p className='ordersum-price'>{currency}{totalProductPrice.toFixed(2)}</p>
        </div>
        <hr />
        <div className='ordersum-list'>
            <p>Shipping Fee</p>
            <p className='ordersum-price'>{currency}{delivery_fee.toFixed(2)}</p>
        </div>
        <hr />
        <div className='ordersum-list'>
            <b>Total</b>
            <p className='ordersum-price'>{currency}{totalProductPrice === 0 ? 0 : overallPrice}</p>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
