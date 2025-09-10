import React, { useState } from 'react';
import './verifiedCustomer.css';
import { IoMdCheckmarkCircle } from "react-icons/io";
import VerifiedCustomerView from './VerifiedCustomerView';
function VerifiedCustomer() {
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
  if (showReview) {
    return <VerifiedCustomerView
      customer={selectedCustomer} 
      onClose={handleCloseReview} 
    />;
  }
  const customers = [
    {
      id: 1,
      name: "Medical Hospital Cavite",
      email: "sample@example.com",
      status: "Verified",
      dateCreated: "March 10, 2025"
    },
    {
      id: 2,
      name: "Medical Hospital Laguna",
      email: "sample@example.com",
      status: "Verified", 
      dateCreated: "March 11, 2025"
    }
  ];

  return (
    <div className="verified-customer-container">
      <div className="card">
        <table className="request-table" role="table" aria-label="Verified customers">
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
                  <div className="status-verified">
                    <span className="status-text">Verified</span>
                    <IoMdCheckmarkCircle className="check-icon" />
                  </div>
                </td>
                <td className="date">{customer.dateCreated}</td>
                <td className="action-cell">
                  
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
  );
}

export default VerifiedCustomer;