import React from 'react'
import './Cover.css'
import {assets} from '../assets/assets'
import { NavLink } from 'react-router-dom'

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
            <NavLink to="login" className="auth-btn">Create an Account</NavLink>
            <NavLink to="login" className="auth-btn">Login</NavLink>
          </div>
        </div>
        <div className='cover-container'>
          <div className='cover-image'>
            <img src={assets.cover} alt="Cover Photo" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Cover
