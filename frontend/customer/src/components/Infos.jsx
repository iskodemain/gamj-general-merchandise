import React from 'react'
import {assets} from '../assets/assets'
import './Infos.css'
function Infos() {
  return (
    <div className='info-main'>
        <div className='infos-container'>
            <div className='logo-container'>
                <img src={assets.logo} alt="" className='img-logo'/>
            </div>
            <p className='infos-text'>GAMJ General Merchandise – Your trusted supplier of quality hospital <br />supplies since 2006. Based in Villa Alegre Mabuhay, Carmona, Cavite, <br />we serve hospitals with essential medical products, ensuring seamless <br />ordering and reliable delivery. For inquiries, reach us via phone, Gmail, <br />Viber, or Messenger.</p>
            <div className='img-socials'>
                <a href="" target='blank' rel="noopener noreferrer"><img src={assets.gmail_icon} alt="" className='insta-img'/></a>
                <a href="" target='blank' rel="noopener noreferrer"><img src={assets.viber_icon} alt="" className='insta-img'/></a>
                <a href="" target='blank' rel="noopener noreferrer"><img src={assets.call_icon} alt="" className='insta-img'/></a>
                <a href="" target='blank' rel="noopener noreferrer"><img src={assets.messenger_icon} alt="" className='insta-img'/></a>
            </div>
        </div>
    </div>
  )
}

export default Infos
