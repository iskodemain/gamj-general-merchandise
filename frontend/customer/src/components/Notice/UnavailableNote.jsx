
import React, { useContext, useState } from 'react'
import './UnavailableNote.css'
import { RiErrorWarningLine } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { ShopContext } from '../../context/ShopContext';

const UnavailableNote = () => {
    const { showUnavailableNote, setShowUnavailableNote } = useContext(ShopContext);

  return (
    showUnavailableNote && (
        <div className="un-main">
            <div className="un-semi">
                <button type='button' onClick={() => setShowUnavailableNote(false)}>
                    <IoMdClose className="un-close-icon-bg"/>
                </button>
                <div className='un-warning-icon-bg'>
                    <RiErrorWarningLine className="un-warning-icon"/>
                </div>
                
                <p className='un-main-note'>Currently Temporarily Unavailable</p>
                <p className='un-paragraph-note'>
                    Your account is currently under verification. At this time, you are unable to place orders. Your account must be approved before you can proceed with purchasing products.
                </p>
                <button type='button' onClick={() => setShowUnavailableNote(false)} className='un-okay-btn' >OK</button>
            </div>
        </div>
    )
  )
}

export default UnavailableNote

