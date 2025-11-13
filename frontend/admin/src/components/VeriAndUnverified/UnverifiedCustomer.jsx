import React, { useState } from 'react';
import './UnverifiedCustomer.css';
import { FaTrashCan } from "react-icons/fa6";
import UnverifiedCustomerReview from './UnverifiedCustomerReview';
import Navbar from '../Navbar';

function UnverifiedCustomer() {
  const [showReview, setShowReview] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const handleReviewClick = (customer) => {
    setSelectedCustomer(customer);
    setShowReview(true);
  };

  const handleCloseReview = () => {
    setShowReview(false);
    setSelectedCustomer(null);
  };

  // Example customer data
  const customers = [
    {
      id: 1,
      name: "Medical Hospital Cavite",
      email: "sample@example.com",
      status: "Pending for approval",
      dateCreated: "March 10, 2025"
    },
    {
      id: 2,
      name: "Medical Hospital Laguna",
      email: "sample@example.com",
      status: "Rejected",
      dateCreated: "March 11, 2025"
    }
  ];

  if (showReview) {
    return <UnverifiedCustomerReview 
      customer={selectedCustomer} 
      onClose={handleCloseReview} 
    />;
  }

  return (
    <>
    <Navbar TitleName="Unverified Customers"/>
    
      <div className="unverified-customer">
        <div className="card">
          <table className="request-table" role="table" aria-label="Unverified customers">
            <thead>
              <tr>
                <th className="col-name">Name</th>
                <th className="col-email">Email</th>
                <th className="col-status">Status</th>
                <th className="col-date">Date Created</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td className="name">{customer.name}</td>
                  <td className="email"><span className="email-text">{customer.email}</span></td>
                  <td className="status">
                    <span className={`status-text ${customer.status === "Rejected" ? "rejected" : "pending"}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="date">{customer.dateCreated}</td>
                  <td className="action-cell">
                    {customer.status === "Rejected" && (
                      <button className="btn btn-trash" aria-label="Delete request" title="Delete">
                        <FaTrashCan size={14} color="#E53935" aria-hidden="true" />
                      </button>
                    )}
                    <button 
                      className="btn btn-review" 
                      type="button"
                      onClick={() => handleReviewClick(customer)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default UnverifiedCustomer;