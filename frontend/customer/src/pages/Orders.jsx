import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import MainTitle from '../components/MainTitle';
import './Orders.css';
import { NavLink } from 'react-router-dom';
import { MdOutlineRefresh } from "react-icons/md";
import { assets } from '../assets/assets';

function Orders() {
  const { currency, setOrderData, orderData } = useContext(ShopContext);
  const [activeStep, setActiveStep] = React.useState(0); // Show Processing by default
  /* active ste 0: Pending, 1: Processing, 2: Out for Delivery, 3: Delivered */
  const steps = [
    { id: 0, name: 'Pending', icon: assets.pending_icon, status: 'Pending' },
    { id: 1, name: 'Processing', icon: assets.processing_icon, status: 'Packing' },
    { id: 2, name: 'Out for Delivery', icon: assets.outfordelivery_icon, status: 'Out for Delivery' },
    { id: 3, name: 'Delivered', icon: assets.delivered_icon, status: 'Delivered' }
  ];

  // Filter orders based on active step
  const getFilteredOrders = () => {
    const currentStep = steps[activeStep];
    return orderData.filter(item => item.status === currentStep.status);
  };

  const filteredOrders = getFilteredOrders();

  // --- Progress Tracker Component ---
  const ProgressTracker = () => (
    <div className="order-progress-tracker">
      <div className="tracker-flex" data-active={activeStep}>
        {steps.map((step, index) => (
          <div key={step.id} className="tracker-step">
            <div 
              className={`tracker-circle ${index === activeStep ? 'active' : 'inactive'}`}
              onClick={() => setActiveStep(index)}
            >
              <img src={step.icon} alt={step.name} className="tracker-icon" />
            </div>
            <span 
              className={`tracker-label ${index === activeStep ? 'text-green-600' : 'text-gray-400'}`}
              onClick={() => setActiveStep(index)}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const handleCancel = async (productId, orderId, size) => {
    // Update Frontend
    const updatedOrders = orderData.filter(
      (item) => !(item.product_id === productId && item.order_id === orderId && item.size === size)
    );
    setOrderData(updatedOrders);
    // try {
    //   const updatedOrders = orderData.filter(
    //     (item) => !(item.product_id === productId && item.order_id === orderId && item.size === size)
    //   );
    //   setOrderData(updatedOrders);
  
    //   // Update Backend
    //   if (token) {
    //     await axios.post(
    //       `${backendUrl}/api/order/cancel`, 
    //       { productId, orderId, size },  // Correctly send data in the request body
    //       { headers: { token } }
    //     );
    //     toast.success('Order Item Canceled successfully', {...toastSuccess});
    //   }
    // } catch (error) {
    //   console.log(error);
    //   toast.error(error.message);
    // }
  };

  const handleRemove = async (productId, orderId, size) => {
    try {
      // Update Frontend
      const removedOrders = orderData.filter(
        (item) => !(item.product_id === productId && item.order_id === orderId && item.size === size)
      );
      setOrderData(removedOrders);
  
      // Update Backend
      // if (token) {
      //   await axios.post(
      //     `${backendUrl}/api/order/remove`, 
      //     { productId, orderId , size},  // Correctly send data in the request body
      //     { headers: { token } }
      //   );
      //   toast.success('Order Item Removed successfully', {...toastSuccess});
      // }
    } catch (error) {
      console.log(error);
      // toast.error(error.message);
    }
  };

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='pt-16'>
        <div className='text-2xl'>
          <MainTitle mtext1={'MY'} mtext2={'ORDERS'}/>
        </div>
        
        {/* Progress Tracker */}
        <ProgressTracker />
        
        {/* Dynamic Title Based on Active Step */}
        <div className='text-xl mb-4 mt-6'>
          <h2 className='font-semibold'>{steps[activeStep].name} Orders</h2>
        </div>

        {
          /** Empty Order Message */
          filteredOrders.length < 1 ? 
          <p className='empty-order-message'>No {steps[activeStep].name.toLowerCase()} orders found.</p> : 
          <>
            <div onClick={()=> window.location.reload()} className='reload-container'>
              <p className='reload-button'>Refresh</p>
              <MdOutlineRefresh />
            </div>
            
            <div className='orders-container'>
              {
                filteredOrders.map((item, index) => (
                  <div key={item.product_id + '-' + item.order_id + '-' + item.size} className={`order-card ${item.status === 'Cancelled Order' ? 'cancelled-item' : ''}`}>
                    <NavLink className='cursor-pointer' to={`/product/${item.product_id}`}>
                      <img src={item.images[0]} alt={item.product_name} />
                    </NavLink>
                    <div className='order-card-content'>
                      <div className='order-card-title'>{item.product_name}</div>
                      <div className='order-card-details order-card-details-grid'>
                        <div>
                          <span className="order-detail-label">₱{item.price}</span>
                        </div>
                        <div>
                          <span className="order-detail-label">Quantity:</span> {item.quantity}
                        </div>
                        <div>
                          <span className="order-detail-label">Size:</span> {item.size}
                        </div>
                        <div>
                          <span className="order-detail-label">Payment:</span> {item.payment_method}
                        </div>
                        {item.color && (
                          <div>
                            <span className="order-detail-label">Color:</span> {item.color}
                          </div>
                        )}
                        <div className= 'pencancel'>
                          <span className={`order-card-status-dot ${item.status === 'Pending' ? 'pending-circle' : item.status === 'Packing' ? 'packing-circle' : item.status === 'Out for Delivery' ? 'ofd-circle' : item.status === 'Delivered' ? 'delivered-circle' : 'cancelled-circle'}`}></span>
                          <span>{item.status}</span>
                          <button
                            className={`order-card-cancel-btn ${
                              item.status === 'Pending' || item.status === 'Cancelled Order' || item.status === 'Delivered'? '' : 'disabled-button'
                            }`}
                            onClick={() =>
                              item.status === 'Pending'
                                ? handleCancel(item.product_id, item.order_id, item.size)
                                : item.status === 'Cancelled Order' || item.status === 'Delivered'
                                ? handleRemove(item.product_id, item.order_id, item.size)
                                : null
                            }
                          >
                            {item.status === 'Pending'
                              ? 'Cancel'
                              : item.status === 'Cancelled Order' || item.status === 'Delivered'
                              ? 'Remove'
                              : 'Processing'}
                          </button>
                        </div>
                      </div>
                      <div className='order-card-date'>
                        Date you ordered: {new Date(item.order_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        }
      </div>
    </div>
  )
}

export default Orders










































