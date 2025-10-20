import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import MainTitle from '../components/MainTitle';
import './Orders.css';
import { NavLink } from 'react-router-dom';
import { MdOutlineRefresh } from "react-icons/md";
import { assets } from '../assets/assets';

function Orders() {
  const { currency } = useContext(ShopContext);
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

  const handleCancel = async () => {
    
  };

  const handleRemove = async () => {
    
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

        
      </div>
    </div>
  )
}

export default Orders










































