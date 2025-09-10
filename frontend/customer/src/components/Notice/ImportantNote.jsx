
import React, { useContext, useState } from 'react'
import './ImportantNote.css'
import { RiErrorWarningLine } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { ShopContext } from '../../context/ShopContext';

const ImportantNote = () => {
    const { showImportantNote, setShowImportantNote } = useContext(ShopContext);

  return (
    showImportantNote && (
        <div className="in-main">
            <div className="in-semi">
                <button type='button' onClick={() => setShowImportantNote(false)}>
                    <IoMdClose className="close-icon-bg"/>
                </button>
                <div className='warning-icon-bg'>
                    <RiErrorWarningLine className="warning-icon"/>
                </div>
                
                <p className='main-note'>IMPORTANT NOTE</p>
                <p className='paragraph-note'>
                    Your account is currently under verification. Please wait for approval—we will notify you once your account has been successfully verified. In the meantime, purchasing products is temporarily unavailable as we review your information. Thank you for your patience and understanding.
                </p>
                <button type='button' onClick={() => setShowImportantNote(false)} className='in-okay-btn' >OK</button>
            </div>
        </div>
    )
  )
}

export default ImportantNote

