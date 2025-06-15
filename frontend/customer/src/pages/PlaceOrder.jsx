import React, {useContext, useState, useEffect} from 'react'
import MainTitle from '../components/MainTitle'
import './PlaceOrder.css'
import OrderSummary from '../components/OrderSummary'
import OurPolicy from '../components/OurPolicy'
import Infos from '../components/Infos'
import Footer from '../components/Footer'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from "react-toastify";

function PlaceOrder() {
  const [zipCode, setZipCode] = useState('')
  const [phoneNum, setPhoneNum] = useState('')
  const [paymentMethod] = useState('COD')
  const {navigate, backendUrl, token, cartItems, overallPrice, products, toastError, toastSuccess, setCartItems} = useContext(ShopContext);

  // const loadOrderData = async () => {
  //   try {
  //     if (!token) {
  //       return null;
  //     }
  //     const response = await axios.post(backendUrl + '/api/order/order-info', {}, {headers: {token}})
  //     if (response.data.success && response.data.orders && response.data.email) {
  //       const email = response.data.email;
  //       const order = response.data.orders;

  //       if (order.address) {
  //         setFormData({
  //           firstName: order.address.firstName,
  //           lastName: order.address.lastName,
  //           email: email,
  //           street: order.address.street,
  //           barangay: order.address.barangay,
  //           city: order.address.city,
  //           province: order.address.province,
  //           country: 'Philippines',
  //         });
  //         setPhoneNum(order.address.phone);
  //         setZipCode(order.address.zip_code)
  //       }
  //     } 
  //     else if (response.data.success && response.data.email) {
  //       const email = response.data.email;
  //       setFormData({
  //         email: email,
  //       });
  //     }
  //     // It's either no existing orders or not success response
  //   } catch (error) {
  //     console.log(error)
  //     toast.error("Error fetching order data.", {...toastError});
  //   }
  // }

  // useEffect(() => {
  //   loadOrderData(); 
  // }, [token]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: phoneNum,
    street: '',
    barangay: '',
    city: '',
    province: '',
    zip_code: zipCode,
    country: 'Philippines'
  })

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      phone: phoneNum,
      zip_code: zipCode,
    }));
  }, [phoneNum, zipCode]);

  const handleZipCodeChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value.length <= 4) {
      setZipCode(value);
    }
  };
  
  const handlePhoneNumber = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value.length <= 11) {
      setPhoneNum(value);
    }
  };

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({...data, [name]: value}))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let orderItems = []
      for(const items in cartItems) {
        for(const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product.product_id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo)
              
            }
          }
        } 
      }
      
      let orderData = {
        items: orderItems,
        total_amount: overallPrice,
        address: formData
      }

      if (paymentMethod === 'COD' && !token) {
        // const response = await axios.post(backendUrl + '/api/order/place-order', orderData, {headers: {token}});
        // if (response.data.success) {
        //   setCartItems({});
        //   toast.success('Order Placed Successfully', {...toastSuccess});
        //   navigate('/orders')
        // }
        // else {
        //   toast.error(response.data.message, {...toastError});
        // }
        setCartItems({});
        toast.success('Order Placed Successfully', {...toastSuccess});
        setCartItems({});
        navigate('/orders')
      }
      else {
        toast.error("Please log in to place an order.", {...toastError});
        navigate('/login')
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-9 sm:pt-10 min-h-[80vh]'>
        {/* DELIVERY INFORMATION */}
        <div className='flex flex-col gap-4 w-full sm:max-w-[500px]'>
            <div className='text-xl sm:text-2xl my-3'>
              <MainTitle mtext1={'DELIVERY'} mtext2={'INFORMATION'}></MainTitle>
            </div>
            {/* FIRST AND LAST NAME */}
            <div className='flex gap-3'>
              <input onChange={onChangeHandler} name='firstName' value={formData.firstName} className='input-delivery-info rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' required/>
              <input onChange={onChangeHandler} name='lastName' value={formData.lastName} className='input-delivery-info rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name ' required/>
            </div>
            {/* EMAIL ADDRESS */}
            <div className='flex gap-3'>
              <input onChange={onChangeHandler} name='email' value={formData.email}  className='input-delivery-info rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' required/>
            </div>
            {/* COUNTRY PHILIPPINES */}
            <div className='flex gap-3'>
              <input className='input-delivery-info rounded py-1.5 px-3.5 w-full' type="text" value="Country: Philippines" readOnly/>
            </div>
            {/* PROVINCE AND CITY */}
            <div className='flex gap-3'>
              <input onChange={onChangeHandler} name='province' value={formData.province} className='input-delivery-info rounded py-1.5 px-3.5 w-full' type="text" placeholder='Province' required/>
              <input onChange={onChangeHandler} name='city' value={formData.city} className='input-delivery-info rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' required/>
            </div>
            {/* STREET ADDRESS */}
            <div className='flex gap-3'>
              <input onChange={onChangeHandler} name='street' value={formData.street}  className='input-delivery-info rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' required/>
            </div>
            {/* ZIP CODE AND BARANGAY */}
            <div className='flex gap-3'>
              <input onChange={handleZipCodeChange} className='input-delivery-info rounded py-1.5 px-3.5 w-full' type="text" value={zipCode} placeholder='Zip code' required/>
              <input onChange={onChangeHandler} name='barangay' value={formData.barangay} className='input-delivery-info rounded py-1.5 px-3.5 w-full' placeholder='Barangay' required/>
            </div>
            {/* PHONE NUMBER */}
            <div className='flex gap-3'>
              <p className='required-num'>+63</p>
              <input onChange={handlePhoneNumber} value={phoneNum} className='input-delivery-info rounded py-1.5 px-3.5 w-full' type="tel" placeholder='Phone number' required/>
            </div>
        </div>
        {/* ORDER SUMMARY */}
         <div className='mt-8'>
            <div className='mt-8 order-container'>
                <OrderSummary/>
            </div>
            <div className='mt-12'>
              <div className='inline-flex gap-3 items-center mb-3'> 
                <p className='firstPaymentText'>PAYMENT <span className='secondPaymentText'>METHOD</span></p>
                <p className='w-8 sm:w-10 h-[1px] sm:h-[2px] line-payment'></p>
                </div>
              {/* PAYMENT METHOD */}
              <div className='flex gap-3 flex-col lg:flex-col'>
                <div className='cashOnDelivery-main flex items-center p-2 px-3 cursor-pointer'>
                  <p className='min-w-3.5 h-3.5 rounded-full cashOnDelivery-circle'></p>
                  <p className='cashOnDelivery-text text-sm font-medium mx-3'>CASH ON DELIVERY</p>
                </div>
              </div>
              <button type='submit' className='w-full text-center mt-8 submit-button'>PLACE ORDER</button>
            </div> 
         </div>
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default PlaceOrder
