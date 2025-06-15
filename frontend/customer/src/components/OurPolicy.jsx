import React from 'react'
import { assets } from '../assets/assets'
import './OurPolicy.css'
function OurPolicy() {
  return (
    <div className='OP-container'>
      <div className='main-policy'>
        <div>
            <img src={assets.ph_icon} className='policy3' alt="" />
            <p className='font-semibold p-text'>Country from the Philippines</p>
            <p  className='text-gray-400 p-text'>We offer clothing products based in the Philippines</p>
        </div>
        <div>
            <img src={assets.refund_icon} className='policy3' alt="" />
            <p className='font-semibold p-text'>7 Days Return Policy</p>
            <p  className='text-gray-400 p-text'>We provide 7 days free return policy </p>
        </div>
        <div>
            <img src={assets.delivery_icon} className='policy3 car' alt="" />
            <p className='font-semibold p-text'>We Provide Fast Deliver</p>
            <p  className='text-gray-400 p-text'>Providing fast deliver for customer satisfaction.</p>
        </div>
    </div>
    </div>
  )
}

export default OurPolicy
