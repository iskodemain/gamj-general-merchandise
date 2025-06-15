import React from 'react'
import './Cover.css'
import {assets} from '../assets/assets'

function Cover() {
  return (
    <div className='cover-container'>
      <a href="#best-seller" className='button-large'>Explore</a>
        <div className='cover-image'>
            <img src={assets.cover} alt="" />
            <a href="#best-seller" className='button-small'>Explore</a>
        </div>
    </div>
  )
}

export default Cover
