import {assets} from '../assets/assets'
import { ShopContext } from '../context/ShopContext';
import './Infos.css'
import { useContext } from 'react';
function Infos() {
  const {settingsData} = useContext(ShopContext);
  const businessLogo = settingsData && settingsData.length > 0 ? settingsData[0].businessLogo : assets.logo;
  const businessName = settingsData && settingsData.length > 0 ? settingsData[0].businessName : "Default Business Name";
  return (
    <div className='info-main'>
        <div className='infos-container'>
            <div className='logo-container'>
              <img src={businessLogo} alt="Business Logo" className='infos-logo-img' draggable="false" />
              <p className='infos-logo-name'>{businessName}</p>
            </div>
            <p className='infos-text'>GAMJ General Merchandise – Your trusted supplier of quality hospital <br />supplies since 2006. Based in Villa Alegre Mabuhay, Carmona, Cavite, <br />we serve hospitals with essential medical products, ensuring seamless <br />ordering and reliable delivery. For inquiries, reach us via phone, Gmail, <br />Viber, or Messenger.</p>
            <div className='img-socials'>
                <a href="" target='blank' rel="noopener noreferrer"><img src={assets.gmail_icon} alt="" className='socials-img'/></a>
                <a href="" target='blank' rel="noopener noreferrer"><img src={assets.viber_icon} alt="" className='socials-img'/></a>
                <a href="" target='blank' rel="noopener noreferrer"><img src={assets.call_icon} alt="" className='socials-img'/></a>
                <a href="" target='blank' rel="noopener noreferrer"><img src={assets.messenger_icon} alt="" className='socials-img'/></a>
            </div>
        </div>
    </div>
  )
}

export default Infos
