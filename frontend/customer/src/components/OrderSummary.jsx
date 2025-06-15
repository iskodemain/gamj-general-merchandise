import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import MainTitle from './MainTitle.jsx';

function OrderSummary() {
    const {currency, delivery_fee, totalProductPrice, overallPrice, getOverAllPrice} = useContext(ShopContext);
    console.log(totalProductPrice);
    console.log(overallPrice);

    
    useEffect(() => {
      const finalTotal = totalProductPrice + delivery_fee
      getOverAllPrice(finalTotal.toFixed(2));
    }, [totalProductPrice, overallPrice])
  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <MainTitle mtext1={'ORDER'} mtext2={'SUMMARY'}/>
      </div>
      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
            <p>Subtotal</p>
            <p>{currency}{totalProductPrice.toFixed(2)}</p>
        </div>
        <hr />
        <div className='flex justify-between'>
            <p>Shipping Fee</p>
            <p>{currency}{delivery_fee.toFixed(2)}</p>
        </div>
        <hr />
        <div className='flex justify-between'>
            <b>Total</b>
            <p>{currency}{totalProductPrice === 0 ? 0 : overallPrice}</p>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
