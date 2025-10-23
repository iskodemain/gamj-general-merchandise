import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import './Orders.css';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

import CancelOrderModal from '../components/Orders/CancelOrderModal';

function Orders() {
  const { currency, fetchOrders, fetchOrderItems, products, setOrderItemId, setPaymentUsed, cancelOrder, setCancelOrder } = useContext(ShopContext);
  const [activeStep, setActiveStep] = useState(0);
  
  


  const steps = [
    { id: 0, name: 'Pending', icon: assets.pending_icon, aicon: assets.wpending_icon, status: 'Pending' },
    { id: 1, name: 'Processing', icon: assets.processing_icon, aicon: assets.wprocessing_icon, status: 'Packing' },
    { id: 2, name: 'Out for Delivery', icon: assets.outfordelivery_icon, aicon: assets.woutfordelivery_icon, status: 'Out for Delivery' },
    { id: 3, name: 'Delivered', icon: assets.delivered_icon, aicon: assets.wdelivered_icon, status: 'Delivered' }
  ];

  // 🔹 Combine order + its orderItems
  const combinedOrders = fetchOrders.map(order => ({
    ...order,
    items: fetchOrderItems.filter(item => item.orderId === order.ID).map(item => {
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
    } else if (['Cancelled Order', 'Delivered'].includes(item.orderStatus)) {
      handleRemove(item.ID);
    }
  };


  const handleRemove = async (orderItemId) => {
    console.log("Remove order item:", orderItemId);
    // your remove API logic
  };


  return (
    <div className="main-ctn-orders">
      { cancelOrder && (<CancelOrderModal/>) }
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
                    className={`list-order-items ${
                      item.orderStatus === 'Cancelled' ? 'cancelled-item' : ''
                    }`}
                  >
                    <div className="ls-ctn-order">
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

                    <div className="md:1/2 flex justify-between">
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
                        <p className="pending-text">{item.orderStatus}</p>
                      </div>
                    </div>

                    <button className={`order-button-container ${item.orderStatus === 'Pending' ? '' : 'disabled-button'}`} onClick={() => handleButtonClick(item, order)}>
                      {item.orderStatus === 'Pending' ? 'Cancel' : ['Cancelled', 'Delivered'].includes(item.orderStatus) ? 'Remove' : 'Processing'}
                    </button>
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