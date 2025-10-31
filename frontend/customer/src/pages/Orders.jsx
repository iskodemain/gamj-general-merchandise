import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import './Orders.css';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { RiDeleteBinFill } from "react-icons/ri";
import CancelOrderModal from '../components/Orders/CancelOrderModal';
import RefundReceiptModal from '../components/Orders/RefundReceiptModal';

function Orders() {
  const { currency, fetchOrders, fetchOrderItems, products, setOrderItemId, setPaymentUsed, cancelOrder, setCancelOrder, fetchCancelledOrders, removeOrder, viewRefundReceipt, setViewRefundReceipt, setRefundOrder } = useContext(ShopContext);

  const [activeStep, setActiveStep] = useState(0);

  const getCancelStatusForItem = (orderItemId) => {
    return fetchCancelledOrders.find(cancel => cancel.orderItemId === orderItemId);
  };

  const handleViewReceipt = (orderItemId) => {
    setOrderItemId(orderItemId);
    setViewRefundReceipt(true);
  };

  const handleReview = (orderItemId, paymentMethod) => {
    setOrderItemId(orderItemId);
    setPaymentUsed(paymentMethod);
    setCancelOrder(true);
  };

  // NEXT STEP: HANDLE ORDER REFUND
  const handleOrderRefund = (orderItemId) => {
    setOrderItemId(orderItemId);
    setRefundOrder(true);
  };



  const steps = [
    { id: 0, name: 'Pending', icon: assets.pending_icon, aicon: assets.wpending_icon, status: 'Pending' },
    { id: 1, name: 'Processing', icon: assets.processing_icon, aicon: assets.wprocessing_icon, status: 'Processing' },
    { id: 2, name: 'Out for Delivery', icon: assets.outfordelivery_icon, aicon: assets.woutfordelivery_icon, status: 'Out for Delivery' },
    { id: 3, name: 'Delivered', icon: assets.delivered_icon, aicon: assets.wdelivered_icon, status: 'Delivered' }
  ];

  // 🔹 Combine order + its orderItems
  const combinedOrders = fetchOrders.map(order => ({
    ...order,
    items: fetchOrderItems.filter(item => item.orderId === order.ID && item.isDeletedByCustomer === false).map(item => {
        const product = products.find(p => p.ID === item.productId);
        return {
          ...item,
          productName: product ? product.productName : "Unknown Product",
          image: product ? product.image1 : assets.placeholder,
          productId: product ? product.productId : null
        };
      })
  }));

  // OLD LOGIC (CANCELLED ORDER NOT INCLUDE)
  // const getFilteredOrders = () => {
  //   const currentStatus = steps[activeStep].status;
  //   return combinedOrders
  //     .map(order => ({
  //       ...order,
  //       items: order.items.filter(item => item.orderStatus === currentStatus)
  //     }))
  //     .filter(order => order.items.length > 0);
  // };

  const getFilteredOrders = () => {
    const currentStatus = steps[activeStep].status;

    return combinedOrders
      .map(order => {
        let filteredItems = [];

        if (currentStatus === 'Pending') {
          // 🟢 Include both Pending and Cancelled
          filteredItems = order.items.filter(
            item => item.orderStatus === 'Pending' || item.orderStatus === 'Cancelled'
          );
        } else {
          // 🟡 Default: only show current status
          filteredItems = order.items.filter(item => item.orderStatus === currentStatus);
        }

        return { ...order, items: filteredItems };
      })
      .filter(order => order.items.length > 0);
  };

  const filteredOrders = getFilteredOrders();

  // --- Progress Tracker Component ---
  const ProgressTracker = () => (
    <div className="order-progress-tracker">
      <div className="tracker-flex" data-active={activeStep}>
        {steps.map((step, index) => (
          <div key={step.id} className="tracker-step">
            <div className={`tracker-circle ${index === activeStep ? 'active' : 'inactive'}`} onClick={() => setActiveStep(index)}>
              <div className='tracker-img-ctn'>
                  <img src={index === activeStep ? step.aicon : step.icon} alt={step.name} className="tracker-icon" />
              </div>
              
            </div>
            <span className={`tracker-label`} onClick={() => setActiveStep(index)}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // 🔹 Cancel Button
  const handleButtonClick = (item, order) => {
    if (item.orderStatus === 'Pending') {
      setOrderItemId(item.ID);
      setPaymentUsed(order.paymentMethod);
      setCancelOrder(true);
    }
  };


  const handleRemove = async (orderItemId) => {
    console.log("Removing order item:", orderItemId);
    removeOrder(orderItemId);
  };

  const isReturnValid = (deliveredDate) => {
    if (!deliveredDate) return false; // prevent NaN days
    const deliveryDate = new Date(deliveredDate);
    const today = new Date();
    const diffTime = today - deliveryDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };


  return (
    <div className="main-ctn-orders">
      { cancelOrder && (<CancelOrderModal/>) }
      { viewRefundReceipt && (<RefundReceiptModal/>) }
      <div className="spc-above">
        <div className="orders-title-ctn">
          <p className='mytext'>MY <span className='ordertext'>ORDERS</span></p>
          <p className='order-line'></p>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker />

        <div className="order-status-header">
          <h2 className="order-type-status">{steps[activeStep].name} Orders</h2>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="empty-order-message">No ordered list.</p>
        ) : (
          <>
            {filteredOrders.map(order => (
              <div key={order.ID}>
                {order.items.map(item => (
                  <div
                    key={item.ID}
                    className={`list-order-items`}
                  >
                    <div className={`ls-ctn-order ${item.orderStatus === 'Cancelled' ? 'cancelled-item' : ''}`}>
                      <NavLink to={`/product/${item.productId}`} className="cursor-pointer">
                        <img
                          className="w-16 sm:w-20" src={item.image} alt=""
                        />
                      </NavLink>
                      <div>
                        <p className="product-name">{item.productName || "Product Name"}</p>
                        <div className="qsd-container">
                          <p className="order-price-ctn">
                            {currency} {Number(item.subTotal).toFixed(2)}
                          </p>
                          <div className='qvp-ctn'>
                            <p className='order-qty'>Quantity: {item.quantity}</p>
                            {
                              item.value && 
                              <p className='order-value'>{item.value}</p>
                            }
                            <p className="order-payment"> Payment: <span>{order.paymentMethod || "N/A"}</span></p>
                          </div>
                        </div>
                        <p className="date-text-1">Date Ordered: <span className="date-text-2">{new Date(order.dateOrdered).toDateString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className={`md:1/2 flex justify-between ${item.orderStatus === 'Cancelled' ? 'cancelled-item' : ''}`}>
                      <div className="flex items-center gap-2">
                        <p
                          className={`min-w-2 h-2 rounded-full ${
                            item.orderStatus === 'Pending'
                              ? 'pending-circle'
                              : item.orderStatus === 'Processing'
                              ? 'processing-circle'
                              : item.orderStatus === 'Out for Delivery'
                              ? 'ofd-circle'
                              : item.orderStatus === 'Delivered'
                              ? 'delivered-circle'
                              : item.orderStatus === 'Cancelled' 
                              ? 'cancelled-circle' 
                              : ''
                          }`}
                        ></p>
                        <p className="pending-text">
                          {item.orderStatus === 'Cancelled' ? (
                            (() => {
                              const cancelInfo = getCancelStatusForItem(item.ID);
                              if (!cancelInfo) return 'Cancelled'; // fallback

                              return (
                                <>
                                  Cancelled by {cancelInfo.cancelledBy === 'Customer' ? 'You' : cancelInfo.cancelledBy} {' '} (<strong>{cancelInfo.cancellationStatus}</strong>)
                                </>
                              );
                            })()
                          ) : (
                            item.orderStatus
                          )}

                        </p>
                      </div>
                    </div>
                
                    {(() => {
                      const validForReturn = isReturnValid(item.dateDelivered);
                      console.log("Item ID:", item.ID, "Delivered Date:", item.dateDelivered, "Valid for Return:", validForReturn);
                      if (item.orderStatus === 'Delivered') {
                        // 🔹 Show Return/Refund if within 7 days
                        if (validForReturn) {
                          return (
                            <div className="delivered-btn-group">
                              <div className='delivered-btn-duo'>
                                <RiDeleteBinFill className="delete-btn" onClick={() => handleRemove(item.ID)} />
                                <button className="order-button-container return-btn" onClick={() => handleOrderRefund(item.ID, )}>Return / Refund</button>
                              </div>
                              <p className="valid-date-text">Date valid: 7 days</p>
                            </div>
                          );
                        } else {
                          // 🔹 Expired: show only delete icon
                          return (
                            <button className="delete-btn-ctn">
                              <RiDeleteBinFill className="delete-btn" onClick={() => handleRemove(item.ID)} />
                            </button>
                          );
                        }
                      }

                    // Check if this item exists in the cancelled list
                    const cancelInfo = getCancelStatusForItem(item.ID);

                    // CASE 1: If cancelled order is found in the table
                    if (cancelInfo) {
                      if (cancelInfo.cancellationStatus === "Completed") {
                        return (
                          <button className="delete-btn-ctn">
                            <RiDeleteBinFill className="delete-btn" onClick={() => handleRemove(item.ID)}/>
                          </button>
                        );
                      }

                      if (cancelInfo.cancellationStatus === "Processing") {
                        return (
                          <button
                            className="order-button-container review-btn"
                            onClick={() => handleReview(item.ID, order.paymentMethod)}
                          >
                            Review
                          </button>
                        );
                      }

                      if (cancelInfo.cancellationStatus === "Refunded") {
                        return (
                          <button
                            className="order-button-container receipt-btn"
                            onClick={() => handleViewReceipt(item.ID)}
                          >
                            View Receipt
                          </button>
                        );
                      }
                    }

                    // CASE 2: Default logic if not found in cancelled list
                    return (
                      <button
                        className={`order-button-container ${item.orderStatus === 'Pending' ? '' : 'disabled-button'}`}
                        onClick={() => handleButtonClick(item, order)}
                        disabled={item.orderStatus !== 'Pending'}
                      >
                        {item.orderStatus === 'Pending'
                          ? 'Cancel'
                          : item.orderStatus === 'Processing'
                          ? 'Processing...'
                          : item.orderStatus === 'Out for Delivery'
                          ? 'On the way...'
                          : item.orderStatus === 'Cancelled'
                          ? 'Remove'
                          : ''
                          }
                      </button>
                    );
                  })()}

                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default Orders