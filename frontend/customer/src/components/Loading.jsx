import React from 'react'
import './Loading.css'

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner"></div>
        <p className="loading-title">GAMJ Shop</p>
        <p className="loading-message">
          Initial load may take a moment — we're on a free deployment plan.<br/>
          Thank you for your patience.
        </p>
      </div>
    </div>
  )
}

export default Loading
