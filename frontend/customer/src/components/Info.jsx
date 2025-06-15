import React from 'react'
import {assets} from '../assets/assets'
import './Infos.css'
function Infos() {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] info-main'>
        <div className='infos-container'>
            <div className='logo-container'>
                <img src={assets.logo} alt="" className='img-logo'/>
            </div>
            <p className='infos-text'>Welcome to Angel Online Store, where you can shop the latest trends <br/> and timeless styles from home. We offer affordable, original branded <br/> clothing designed to exceed your expectations and keep you looking<br/> your best. Discover stylish pieces from your favorite brands, perfect for<br/>every occasion. Plus, enjoy daily discounts and vouchers to find your <br/> perfect outfit at a great price!</p>
            <div className='img-socials'>
                <a href="https://www.instagram.com/angleofficial_ph?igsh=MTQ0a2NrdmY4a2xjYw==" target='blank' rel="noopener noreferrer"><img src={assets.instagram_icon} alt="" className='insta-img'/></a>
            </div>
        </div>
    </div>
  )
}

export default Infos
