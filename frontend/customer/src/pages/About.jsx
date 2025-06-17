import React from 'react'
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import './About.css'
import MainTitle from '../components/MainTitle.jsx'
import { assets } from '../assets/assets.js'

const About = () => {
  return (
    <>
      <div className='abt-container'>
        <p className='about-us'>About Us</p>
        <div className='cover-abtimg'>
            <img src={assets.about_cover} alt="" />
        </div>
      </div>
      <div className='about-main'>
        <div className='about-container'>
          <div className='text-cont'>
            <h1 className='os-text'>Our Story</h1>
            <p>Launched in 2006, GAMJ General Merchandise is a local hospital product supplier and ordering business based in Villa Alegre Mabuhay, Carmona, Cavite, Philippines. Supported by a dedicated team of four employees handling orders, inventory, and customer service, GAMJ serves 3 to 10 hospitals per week through cash-on-delivery and online payments.</p>
            <p>GAMJ offers a wide range of hospital supplies, including face masks, underpads, diapers, and syringes. The business continues to grow steadily, expanding its product selection to meet the increasing demand in the healthcare industry.</p>
          </div>
          <div className='img-about'>
            <img className='main-log' src={assets.aboutus_pic} alt="" />
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
