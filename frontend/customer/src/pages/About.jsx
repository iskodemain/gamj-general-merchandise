import React from 'react'
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import './About.css'
import MainTitle from '../components/MainTitle.jsx'
import { assets } from '../assets/assets.js'

const About = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='text-2xl text-center pt-8 border-t'>
        <MainTitle mtext1={'ABOUT'} mtext2={'US'}/>
      </div>
      <div className='about-container'>
        <div className='img-about'>
          <img className='main-log' src={assets.mainlogo} alt="" />
        </div>
        <div className='text-gray-600 text-cont'>
          <p>Welcome to Angel Online Store, where you can shop the latest trends and timeless styles from home. We offer affordable, original branded clothing designed to exceed your expectations and keep you looking
          your best. </p>
          <p>Discover stylish pieces from your favorite brands, perfect for every occasion. Plus, enjoy daily discounts and vouchers to find your perfect outfit at a great price!n</p>
          <div className='contacts-abt'>
            <b className='contacts-text'>Contacts</b>
            <p className='email-text'>Email: <a href='https://mail.google.com/mail/u/0/#inbox?compose=new' className='link-about'>anglephilippines090721@gmail.com</a></p>
            <p className='insta-text'>Instagram:  <a className='link-about' href='https://www.instagram.com/angleofficial_ph?igsh=MTQ0a2NrdmY4a2xjYw==' target='blank'>https://www.instagram.com/angleofficial_ph?igsh=MTQ0a2NrdmY4a2xjYw==</a></p>
          </div>
          
        </div>
      </div>

      <div className='text-4xl'>

      </div>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default About
