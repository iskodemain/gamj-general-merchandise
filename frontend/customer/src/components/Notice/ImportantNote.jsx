
import React, { useContext, useState } from 'react'
import './ImportantNote.css'
import { RiErrorWarningLine } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { ShopContext } from '../../context/ShopContext';

const ImportantNote = () => {
    const { showImportantNote, setShowImportantNote, verifiedUser, rejectedCustomer } = useContext(ShopContext);

    const isRejected = verifiedUser === false && rejectedCustomer === true;
    const isUnverified = verifiedUser === false && rejectedCustomer === false;

  return (
    showImportantNote && (
        <div className="in-main">
            <div className="in-semi">
                <button type='button' onClick={() => setShowImportantNote(false)}>
                    <IoMdClose className="close-icon-bg"/>
                </button>
                
                <div className={`warning-icon-bg ${isRejected ? "reject" : "unverified"}`}>
                    <RiErrorWarningLine className="warning-icon" />
                </div>

                {/* Title */}
                <p className={`main-note ${isRejected ? "reject-text" : "unverified-text"}`}>
                    IMPORTANT NOTE
                </p>

                {isRejected && (
                    <p className="paragraph-note">
                        Your account application has been reviewed and unfortunately cannot be approved at this time. 
                        Because of this, access to purchasing products is currently unavailable.  
                        If you believe this decision was made in error or need further clarification,  
                        you may contact our support team at: <i>gamjmerchandisehelp@gmail.com</i>.
                        Thank you for your understanding.
                    </p>
                )}
                {isUnverified && (
                    <p className="paragraph-note">
                        Your account is currently under verification. Please wait for approval—we will notify you once your 
                        account has been successfully verified. In the meantime, purchasing products is temporarily unavailable 
                        as we review your information. Thank you for your patience and understanding.
                    </p>
                )}
                <button type='button' onClick={() => setShowImportantNote(false)} className='in-okay-btn' >OK</button>
            </div>
        </div>
    )
  )
}

export default ImportantNote

