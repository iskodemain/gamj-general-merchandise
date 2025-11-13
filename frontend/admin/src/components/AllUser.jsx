import React, { useState } from "react";
import './AllUser.css'
import { FaTrashCan, FaCircleCheck  } from "react-icons/fa6";
import Navbar from "./Navbar";

function AllUser() {
    const [users] = useState([
        { id: 1, name: 'Medical Hospital Cavite', email: 'hospital@example.com', type: 'Customer', status: 'Verified', date: 'March 10, 2025' },
        { id: 2, name: 'Jojo Binayo', email: 'jojo@example.com', type: 'Staff', status: 'Pending', date: 'March 12, 2025' },
        { id: 3, name: 'Duterte Nigga', email: 'sample@example.com', type: 'Admin', status: 'Rejected', date: 'March 15, 2025' },
    ]);

    return (
        <>
            <Navbar TitleName="All Users"/>
            <div className="allUser">
                <div className="card">
                    <div className="tableHeader">
                        <div className="cell name">Name</div>
                        <div className="cell email">Email</div>
                        <div className="cell type">Type</div>
                        <div className="cell status">Status</div>
                        <div className="cell date">Date Created</div>
                        <div className="cell action">Action</div>
                    </div>

                    <div className="tableBody">
                        {users.map(u => (
                            <div key={u.id} className="row">
                                <div className="cell name"><span className="primaryText">{u.name}</span></div>
                                <div className="cell email"><span className="secondaryText">{u.email}</span></div>
                                <div className="cell type"><span className="primaryText">{u.type}</span></div>
                                <div className="cell status">
                                    {u.status === 'Verified' && <span className="statusTag verified"><FaCircleCheck className="checkIcon" /> {u.status}</span>}
                                    {u.status === 'Pending' && <span className="statusTag pending">{u.status}</span>}
                                    {u.status === 'Rejected' && <span className="statusTag rejected">{u.status}</span>}
                                </div>
                                <div className="cell date"><span className="secondaryText">{u.date}</span></div>
                                <div className="cell action">
                                    {u.status === 'Rejected' && (
                                        <button className="iconBtn trash" aria-label="Delete"><FaTrashCan /></button>
                                    )}
                                    <button className="btn view">View</button>
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
export default AllUser;