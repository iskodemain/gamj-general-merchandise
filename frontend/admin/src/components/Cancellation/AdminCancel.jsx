import React, { useState } from 'react';
import './AdminCancel.css';

function AdminCancel(){
    const [reason, setReason] = useState(
`Marami pong kaming nakitang defect sa mask namin late na po namin na i-check.
Wag niyo rin pong kalimutan ibigay sa amin ang PayPal email addres niyo para po maibalik namin ang pera sainyo. Yun lamang po salamat.`,
`Nagdagdag ng admin note: produkto ay na-substitute, kaya nag-request ng full refund. Sundin ang refund policy at i-log ang action.`
    );

    return(
        <div className='adminCancel'>
            <div className="headerRow">
                <div className="avatar" aria-hidden="true">
                    {/* simple illustration SVG */}
                    <svg viewBox="0 0 64 64" width="68" height="68" xmlns="http://www.w3.org/2000/svg" role="img">
                        <circle cx="32" cy="32" r="32" fill="#e6f7ee"/>
                        <g fill="#2a8f57">
                            <rect x="18" y="20" width="28" height="4" rx="2"></rect>
                            <rect x="18" y="30" width="28" height="6" rx="3"></rect>
                            <rect x="18" y="40" width="18" height="4" rx="2"></rect>
                        </g>
                    </svg>
                </div>

                <div className="headerText">
                    <div className="title">Medical Hospital Cavite</div>
                    <div className="sub muted">Customer</div>
                    <div className="sub muted">Payment: Paid</div>
                </div>
            </div>

            <div className="productBox">
                <img className="thumb" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><rect width='72' height='72' fill='%23f3f7f2'/><g fill='%238bbb6b'><rect x='12' y='18' width='48' height='36' rx='4'/></g></svg>" alt="product thumbnail" />
                <div className="productInfo">
                    <div className="productName">Disposable Gloves (Unimex) – 100 pcs</div>
                    <div className="meta">Quantity: 2 &nbsp; Size: 1ml</div>

                    <div className="priceRow">
                        <div className="price"><span className="label">Price: </span>₱1,145.25</div>
                        <div className="payment"><span className="label">Payment: </span><span className="paymentVal">Cash On Delivery</span></div>
                    </div>
                </div>
            </div>

            <div className="adminReasonSection">
                <div className="sectionLabel">1. Admin Reason for Cancellation</div>
                <textarea
                    className="adminTextarea"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={6}
                />
            </div>

            <div className="actionWrap">
                <button className="deleteBtn" onClick={() => window.alert('Delete action (simulate refund/delete)')}>Delete</button>
            </div>
        </div>
    )
}
export default AdminCancel;