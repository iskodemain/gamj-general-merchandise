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
import { assets } from '../assets/assets'

function PlaceOrder() {
  const [zipCode, setZipCode] = useState('')
  const [phoneNum, setPhoneNum] = useState('')
  const [paymentMethod] = useState('COD')
  const [method, setMethod] = useState('cod')
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
    <div className='pl-main'>
      <form onSubmit={onSubmitHandler} className='pl-form'>
        {/* DELIVERY INFORMATION */}
        <div className='di-main'>
            <div className='text-xl sm:text-2xl my-3'>
              <MainTitle mtext1={'DELIVERY'} mtext2={'INFORMATION'}></MainTitle>
            </div>
            {/* FIRST AND LAST NAME */}
            <div className='input-container'>
              <input onChange={onChangeHandler} name='firstName' value={formData.firstName} className='input-delivery-info ' type="text" placeholder='First name' required/>
              <input onChange={onChangeHandler} name='lastName' value={formData.lastName} className='input-delivery-info ' type="text" placeholder='Last name ' required/>
            </div>
            {/* EMAIL ADDRESS */}
            <div className='input-container'>
              <input onChange={onChangeHandler} name='email' value={formData.email}  className='input-delivery-info ' type="email" placeholder='Email address' required/>
            </div>
            {/* COUNTRY PHILIPPINES */}
            <div className='input-container'>
              <input className='input-delivery-info ' type="text" value="Country: Philippines" readOnly/>
            </div>
            {/* PROVINCE AND CITY */}
            <div className='input-container'>
              <input onChange={onChangeHandler} name='province' value={formData.province} className='input-delivery-info ' type="text" placeholder='Province' required/>
              <input onChange={onChangeHandler} name='city' value={formData.city} className='input-delivery-info ' type="text" placeholder='City' required/>
            </div>
            {/* STREET ADDRESS */}
            <div className='input-container'>
              <input onChange={onChangeHandler} name='street' value={formData.street}  className='input-delivery-info ' type="text" placeholder='Street' required/>
            </div>
            {/* ZIP CODE AND BARANGAY */}
            <div className='input-container'>
              <input onChange={handleZipCodeChange} className='input-delivery-info ' type="text" value={zipCode} placeholder='Zip code' required/>
              <input onChange={onChangeHandler} name='barangay' value={formData.barangay} className='input-delivery-info ' placeholder='Barangay' required/>
            </div>
            {/* PHONE NUMBER */}
            <div className='input-container'>
              <p className='required-num'>+63</p>
              <input onChange={handlePhoneNumber} value={phoneNum} className='input-delivery-info ' type="tel" placeholder='Phone number' required/>
            </div>
        </div>
        {/* ORDER SUMMARY */}
         <div className='ordersum-main'>
            <div className='ordersum-container'>
                <OrderSummary/>
            </div>
            <div className='pm-main'>
              <div className='pm-textainer'> 
                <p className='firstMainText'>PAYMENT <span className='secondMainText'>METHOD</span></p>
                <p className='w-8 sm:w-10 h-[1px] sm:h-[2px] line-payment'></p>
                </div>
              {/* PAYMENT METHOD */}
              <div className='pm-info'>
                <div onClick={() => setMethod('cod')} className={`cashOnDelivery-main ${method === 'cod' ? 'codline-active' : 'codline-inactive'}`}>
                  <p className={`cashOnDelivery-circle ${method === 'cod' ? 'codcircle-active' : 'codcircle-inactive'}`}></p>
                  <div className='cod-imgtainer'>
                    <img src={assets.cod_icon} alt="" className='cod-imgs'/>
                  </div>
                  <p className='cashOnDelivery-text'>Cash On Delivery</p>
                </div>
                <div onClick={() => setMethod('paypal')} className={`paypal-main ${method === 'paypal' ? 'ppline-active' : 'ppline-inactive'}`}>
                  <p className={`paypal-circle ${method === 'paypal' ? 'ppcircle-active' : 'ppcircle-inactive'}`}></p>
                  <div className='paypal-imgtainer'>
                    <img src={assets.paypal_icon} alt="" className='paypal-imgs'/>
                  </div>
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
