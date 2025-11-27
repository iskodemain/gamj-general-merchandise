import React, { useContext } from 'react';
import './UnavailableNote.css';
import { RiErrorWarningLine } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { ShopContext } from '../../context/ShopContext';

const UnavailableNote = () => {
    const { showUnavailableNote, setShowUnavailableNote, verifiedUser, rejectedCustomer } = useContext(ShopContext);

    const isRejected = verifiedUser === false && rejectedCustomer === true;
    const isUnverified = verifiedUser === false && rejectedCustomer === false;

    return (
        showUnavailableNote && (
            <div className="un-main">
                <div className="un-semi">

                    {/* Close Button */}
                    <button type="button" onClick={() => setShowUnavailableNote(false)}>
                        <IoMdClose className="un-close-icon-bg" />
                    </button>

                    {/* Warning Icon */}
                    <div className={`un-warning-icon-bg ${isRejected ? "reject" : "unverified"}`}>
                        <RiErrorWarningLine className="un-warning-icon" />
                    </div>

                    {/* Title */}
                    <p className={`un-title-text ${isRejected ? "reject-text" : "unverified-text"}`}>
                        IMPORTANT NOTE
                    </p>

                    <p className={`un-main-note ${isRejected ? "reject-text" : "unverified-text"}`}>
                        Currently Temporarily Unavailable
                    </p>

                    {/* Dynamic Message */}
                    {isUnverified && (
                        <p className="un-paragraph-note">
                            Your account is currently under verification. At this time, you are unable to
                            place orders. Your account must be approved before you can proceed with purchasing
                            products.
                        </p>
                    )}

                    {isRejected && (
                        <p className="un-paragraph-note">
                            Your account has been rejected, and as a result, you are unable to place orders or purchase products on our platform.
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowUnavailableNote(false)}
                        className="un-okay-btn"
                    >
                        OK
                    </button>
                </div>
            </div>
        )
    );
};

export default UnavailableNote;
