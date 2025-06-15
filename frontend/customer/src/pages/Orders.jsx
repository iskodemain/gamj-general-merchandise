import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import MainTitle from '../components/MainTitle';
import './Orders.css';
import axios from 'axios';
import { toast } from "react-toastify";
import { NavLink } from 'react-router-dom';
import { MdOutlineRefresh } from "react-icons/md";

function Orders() {
  const {backendUrl, token, currency, toastSuccess, setOrderData, orderData} = useContext(ShopContext);

  // const loadorderData = async () => {
  //   try {
  //     if (!token) {
  //       return null;
  //     }
  //     const response = await axios.post(backendUrl + '/api/order/user-order', {}, {headers: {token}})
  //     if (response.data.success) {
  //       let allOrdersItem = []
  //       response.data.orders.map((order)=>{
  //         order.items.map((item)=> {
  //           item['status'] = order.status
  //           item['payment'] = order.payment
  //           item['payment_method'] = order.payment_method
  //           item['order_date'] = order.order_date
  //           item['order_id'] = order.order_id;
  //           allOrdersItem.push(item)
  //         })
  //       })
  //       setOrderData(allOrdersItem.reverse());
  //     }
  //   } catch (error) {

  //   }
  // }

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

  // const handleRemove = async (productId, orderId, size) => {
  //   try {
  //     // Update Frontend
  //     const removedOrders = orderData.filter(
  //       (item) => !(item.product_id === productId && item.order_id === orderId && item.size === size)
  //     );
  //     setOrderData(removedOrders);
  
  //     // Update Backend
  //     if (token) {
  //       await axios.post(
  //         `${backendUrl}/api/order/remove`, 
  //         { productId, orderId , size},  // Correctly send data in the request body
  //         { headers: { token } }
  //       );
  //       toast.success('Order Item Removed successfully', {...toastSuccess});
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.message);
  //   }
  // };
  

  // useEffect(()=> {
  //   loadorderData()
  // }, [token])


  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
    <div className='pt-16'>
      <div className='text-2xl'>
          <MainTitle mtext1={'MY'} mtext2={'ORDERS'}/>
      </div>
      {
        orderData.length < 1 ? <p className='empty-order-message'>No ordered list.</p> : 
        <>
          <div onClick={()=> window.location.reload()} className='reload-container'>
            <p className='reload-button'>Refresh</p>
            <MdOutlineRefresh />
          </div>
          <div>
            {
              orderData.map((item, index) => (
                <div key={index} className={`p-4 border-t border-b text-gray flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2 ${item.status === 'Cancelled Order' ? 'cancelled-item' : ''}`}>
                  <div className='flex items-center gap-6 text:sm'>
                    <NavLink className='cursor-pointer' to={`/product/${item.product_id}`}>
                      <img className='w-16 sm:w-20' src={item.images[0]} alt="" />
                    </NavLink>
                    <div>
                      <p className='product-name'>{item.product_name}</p>
                      <div className='flex items-start gap-4 text-base qsd-container'>
                        <p className='text-lg'>{currency}{item.price}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Size: {item.size}</p>
                      </div>
                      <p className='date-text-1'>Date you ordered: <span className='date-text-2'>{new Date(item.order_date).toDateString()}</span></p>
                    </div>
                  </div>
                  <div className='md:1/2 flex justify-between '>
                    <div className='flex items-center gap-2'>
                      <p className={`min-w-2 h-2 rounded-full ${item.status === 'Pending' ? 'pending-circle' : item.status === 'Packing' ? 'packing-circle' : item.status === 'Out for Delivery' ? 'ofd-circle' : item.status === 'Delivered' ? 'delivered-circle' : 'cancelled-circle'} `}></p>
                      <p className='pending-text'>{item.status}</p>
                    </div>
                  </div>
                  <button
                  className={`order-button-container ${
                    item.status === 'Pending' || item.status === 'Cancelled Order' || item.status === 'Delivered'? '' : 'disabled-button'
                  }`}
                  onClick={() =>
                    item.status === 'Pending' ? handleCancel(item.product_id, item.order_id, item.size) : item.status === 'Cancelled Order' || item.status === 'Delivered' ? handleRemove(item.product_id, item.order_id, item.size) : null
                  }>
                  {item.status === 'Pending' ? 'Cancel' : item.status === 'Cancelled Order' || item.status === 'Delivered' ? 'Remove' : 'Processing'}
                </button>
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
