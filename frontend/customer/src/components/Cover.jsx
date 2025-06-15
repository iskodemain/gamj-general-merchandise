import React from 'react'
import './Cover.css'
import {assets} from '../assets/assets'

function Cover() {
  return (
    <section className='cover-section'>
      <div className='cover-content'>
        <div className='cover-text'>
          <h1>
            <span>GAMJ General Merchandise</span>
            <span>Medical Supplies & Delivery</span>
            <span>Solutions for Hospitals</span>
          </h1>
          <p>GAMJ provides essential hospital supplies, 
            including face masks, syringes, underpads, and more, 
            continually expanding to meet evolving healthcare needs.</p>
          <div className="auth-buttons">
            <button className="auth-btn">Create an Account</button>
            <button className="auth-btn">Login</button>
          </div>
        </div>
        <div className='cover-container'>
          <div className='cover-image'>
            <img src={assets.cover} alt="Medical supplies showcase" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Cover
