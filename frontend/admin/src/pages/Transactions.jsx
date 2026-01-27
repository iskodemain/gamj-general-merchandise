import React, { useContext, useState, useEffect } from 'react';
import "./Transactions.css";
import { AdminContext } from '../context/AdminContextProvider';
import Navbar from '../components/Navbar';

const Transactions = () => {
  const { fetchOrderTransaction, fetchOrders, fetchOrderItems, customerList } = useContext(AdminContext);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');

  // Apply filters whenever any dependency changes
  useEffect(() => {
    const transactions = Array.isArray(fetchOrderTransaction) ? fetchOrderTransaction : [];
    
    let filtered = [...transactions];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (t) =>
          t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.transactionType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by transaction type
    if (filterType !== 'All') {
      filtered = filtered.filter((t) => t.transactionType === filterType);
    }

    // Filter by payment method
    if (filterPayment !== 'All') {
      filtered = filtered.filter((t) => t.paymentMethod === filterPayment);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, filterType, filterPayment, fetchOrderTransaction]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    return `₱${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getTypeColor = (type) => {
    const typeColors = {
      'Order Placed': '#43A047',
      'Order Processing': '#1976D2',
      'Out for Delivery': '#FF9800',
      'Order Delivered': '#4CAF50',
      'Order Cancelled': '#F44336',
      'Order Refund Requested': '#9C27B0',
      'Order Refund Approved': '#00BCD4',
      'Order Refund Completed': '#009688',
      'Order Refund Rejected': '#E91E63',
      'Order Cancellation Request': '#FF5722',
      'Order Cancellation Processed': '#795548',
      'Order Cancellation Request Cancelled': '#607D8B',
    };
    return typeColors[type] || '#43A047';
  };

  // Helper functions to get related data
  const getCustomerName = (customerId) => {
    const customer = customerList?.find(c => c.ID === customerId);
    return customer?.medicalInstitutionName || 'Unknown Customer';
  };

  const getOrderId = (orderIdNum) => {
    const order = fetchOrders?.find(o => o.ID === orderIdNum);
    return order?.orderId || 'N/A';
  };

  const getOrderItemId = (orderItemIdNum) => {
    if (!orderItemIdNum) return null;
    const orderItem = fetchOrderItems?.find(oi => oi.ID === orderItemIdNum);
    return orderItem?.orderItemId || 'N/A';
  };

  const transactions = Array.isArray(fetchOrderTransaction) ? fetchOrderTransaction : [];
  const uniqueTypes = ['All', ...new Set(transactions.map((t) => t.transactionType))];
  const uniquePayments = ['All', ...new Set(transactions.map((t) => t.paymentMethod))];

  return (
    <>
      <Navbar TitleName="Order Transaction" />
      <div className="transactions-container">
        
        {/* Header Section */}
        <div className="transactions-header">
          <h1 className="transactions-title">Transaction History</h1>
          <p className="transactions-subtitle">
            View all order transactions and their current status
          </p>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Transaction ID or Type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type}
                </option>
              ))}
            </select>

            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="filter-select"
            >
              {uniquePayments.map((payment) => (
                <option key={payment} value={payment}>
                  {payment === 'All' ? 'All Payments' : payment}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-number">{transactions.length}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {formatAmount(
                transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount || 0), 0)
              )}
            </div>
            <div className="stat-label">Total Amount</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{filteredTransactions.length}</div>
            <div className="stat-label">Filtered Results</div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="transactions-list">
          {filteredTransactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.ID} className="transaction-card">
                <div className="transaction-header-row">
                  <div className="transaction-id">
                    <span className="id-label">ID:</span> {transaction.transactionId}
                  </div>
                  <div className="transaction-date">{formatDate(transaction.transactionDate)}</div>
                </div>

                <div className="transaction-body">
                  <div className="transaction-info">
                    <div
                      className="transaction-type-badge"
                      style={{ backgroundColor: getTypeColor(transaction.transactionType) }}
                    >
                      {transaction.transactionType}
                    </div>
                    <div className="transaction-payment">{transaction.paymentMethod}</div>
                  </div>

                  <div className="transaction-amount">{formatAmount(transaction.totalAmount)}</div>
                </div>

                <div className="transaction-footer">
                  <div className="transaction-detail">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">{getOrderId(transaction.orderId)}</span>
                  </div>
                  {transaction.orderItemId && (
                    <div className="transaction-detail">
                      <span className="detail-label">Order Item ID:</span>
                      <span className="detail-value">{getOrderItemId(transaction.orderItemId)}</span>
                    </div>
                  )}
                  <div className="transaction-detail">
                    <span className="detail-label">Customer:</span>
                    <span className="detail-value">{getCustomerName(transaction.customerId)}</span>
                  </div>
                </div>
              </div>
            )).reverse()
          )}
        </div>
      </div>
    </>
  );
};

export default Transactions;