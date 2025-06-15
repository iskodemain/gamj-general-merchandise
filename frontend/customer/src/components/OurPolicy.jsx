import React from 'react'
import { assets } from '../assets/assets'
import './OurPolicy.css'
function OurPolicy() {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] mt-40'>
      <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700 main-policy'>
        <div>
            <img src={assets.ph_icon} className='w-10 m-auto mb-5' alt="" />
            <p className='font-semibold p-text'>Country from the Philippines</p>
            <p  className='text-gray-400 p-text'>We offer clothing products based in the Philippines</p>
        </div>
        <div>
            <img src={assets.refund_icon} className='w-10 m-auto mb-5' alt="" />
            <p className='font-semibold p-text'>No Return/Refund Policy</p>
            <p  className='text-gray-400 p-text'>We do not provide a return or refund policy.</p>
        </div>
        <div>
            <img src={assets.delivery_icon} className='w-14 m-auto mb-6' alt="" />
            <p className='font-semibold p-text'>Cash On Delivery Only</p>
            <p  className='text-gray-400 p-text'>We accept only COD and do not offer payment <br /> integration.</p>
        </div>
    </div>
    </div>
  )
}

export default OurPolicy
