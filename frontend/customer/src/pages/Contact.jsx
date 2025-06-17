import { SlLocationPin } from "react-icons/sl";
import { FiPhoneCall } from "react-icons/fi";
import { GoMail } from "react-icons/go";
import { FaViber } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa";
import React from 'react'
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import './Contact.css'
import { assets } from '../assets/assets.js'

const About = () => {
  return (
    <>
        <div className='ctc-container'>
            <p className='contact-us'>Contact Us</p>
            <div className='cover-ctimg'>
                <img src={assets.contact_cover} alt="" />
            </div>
        </div>
        <div className='contact-main'>
            <div className='contact-container'>
                <div className='ct-cont'>
                <h1 className='contact-text'>Feel free to talk contact us</h1>
                <p className='contact-description'>Questions, comments, or suggestions? Just reach out through the provided links, and we’ll get back to you shortly!</p>
                <div className='list-info'>
                    <div className='location ctc-container'>
                        <SlLocationPin className="ctc-icon"/>
                        <p className="ctc-text">Villa Alegre Mabuhay,<br />Carmona, Cavite, Philippines</p>
                    </div>
                    <div className='call ctc-container'>
                        <FiPhoneCall className="ctc-icon"/>
                        <p className="ctc-text">+63 987654321</p>
                    </div>
                    <div className='gmail ctc-container'>
                        <GoMail className="ctc-icon"/>
                        <p className="ctc-text">gamjshop@gmail.com</p>
                    </div>
                    <div className='viber ctc-container'>
                        <FaViber className="ctc-icon"/>
                        <a href="https://vb.me/letsChatOnViber" target="blank" className="ctc-text vbr">https://vb.me/letsChatOnViber</a>
                    </div>
                    <div className='messeger ctc-container'>
                        <FaFacebookMessenger className="ctc-icon"/>
                        <a href="https://m.me/gamj.general.merchandise.2006" target="blank" className="ctc-text msgr">https://m.me/gamj.general.<br/>merchandise.2006</a>
                        
                    </div>
                </div>
                </div>
                <div className='img-contact'>
                <img className='main-logo-ct' src={assets.contactus_pic} alt="" />
                </div>
        </div>

            <div className='text-4xl'>

            </div>
                <OurPolicy/>
                <Infos/>
                <Footer/>
            </div>
    </>
  )
}

export default About
