import React, {useContext, useState, useEffect} from 'react'
import MainTitle from '../components/MainTitle'
import './PlaceOrder.css'
import OrderSummary from '../components/OrderSummary'
import Infos from '../components/Infos'
import Footer from '../components/Footer'
import { ShopContext } from '../context/ShopContext'
import { toast } from "react-toastify";
import { assets } from '../assets/assets'
import UnavailableNote from '../components/Notice/UnavailableNote'
import { useLocation } from 'react-router-dom'
import Loading from '../components/Loading'
import PaypalModal from '../components/PaypalModal'

function PlaceOrder() {
  const location = useLocation();
  const {navigate, backendUrl, token, cartItems, totalPrice, products, toastError, toastSuccess, setCartItems, provinces, filteredCities, filteredBarangays, selectedProvince, setSelectedProvince, selectedCity, setSelectedCity, selectedBarangay, setSelectedBarangay, hasDeliveryInfo, poMedicalInstitutionName, poEmailAddress, poDetailedAddress, poZipCode, poContactNumber, setActiveStep, paymentMethod, setPaymentMethod, verifiedUser, setShowUnavailableNote, handleFetchDeliveryInfo, orderItems, addOrder, cartItemsToDelete, paypalClientId, showPaypalModal, setShowPaypalModal} = useContext(ShopContext);

  const [loading, setLoading] = useState(false);
  


  useEffect(() => {
    if (token) {
      handleFetchDeliveryInfo();
    }
  }, [location, token]);


  const handleDeliveryInfoButton = () => {
    setActiveStep(2);
    navigate('/profile');
  };

  
  // ORDER DATA
  const onSubmitHandler = async(e) => {
    e.preventDefault();

    if (verifiedUser === false) {
      setShowUnavailableNote(true);
      return;
    }

    if (!hasDeliveryInfo) {
      setActiveStep(2);
      navigate('/profile');
      toast.error("Add delivery information to proceed with checkout.", {...toastError});
      return;
    }

    if (!orderItems || orderItems.length === 0) {
      toast.error("No items found in your order.", {...toastError});
      return;
    }

    if (paymentMethod === "Cash On Delivery") {
      setLoading(true); 
      const success = await addOrder(paymentMethod, orderItems, cartItemsToDelete);
      setLoading(false); 
      if (success) navigate('/orders');
    }

    if (paymentMethod === "Paypal") {
      setShowPaypalModal(true);
      return;
    }

    
  }

  return (
    <div className='pl-main'>
      {loading && <Loading />}
      {!verifiedUser && <UnavailableNote/>}
      {showPaypalModal && <PaypalModal />}

      <form onSubmit={onSubmitHandler} className='pl-form'>
        {/* DELIVERY INFORMATION */}
        <div className='di-main'>
            <div className='text-xl sm:text-2xl my-3'>
              <MainTitle mtext1={'DELIVERY'} mtext2={'INFORMATION'}></MainTitle>
            </div>
            {/* MEDICAL INSTITUTION NAME */}
            <div className='input-container'>
              <input value={poMedicalInstitutionName} placeholder='Medical Institution Name' className='input-delivery-info ' type="text" disabled/>
            </div>
            {/* EMAIL ADDRESS */}
            <div className='input-container'>
              <input value={poEmailAddress}  className='input-delivery-info ' type="email" placeholder='Email Address' disabled/>
            </div>
            {/* COUNTRY PHILIPPINES */}
            <div className='input-container'>
              <input className='input-delivery-info ' type="text" value="Country: Philippines" disabled/>
            </div>
            {/* PROVINCE AND CITY */}
            <div className='PO-dropdown-container'>
              <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} disabled>
                <option value="" disabled hidden>Select Province</option>
                {
                  provinces.map((prov) =>(
                    <option key={prov.ID} value={prov.ID}>
                      {prov.provinceName}
                    </option>
                  ))
                }
              </select>
              
              <select value={selectedCity}  onChange={(e) => setSelectedCity(e.target.value)} disabled>
                <option value="" disabled hidden>Select City</option>
                {
                  filteredCities.map((city) =>(
                    <option key={city.ID} value={city.ID}>
                      {city.cityName}
                    </option>
                  ))
                }
              </select>
            </div>
            {/* STREET ADDRESS */}
            <div className='input-container'>
              <input value={poDetailedAddress}  className='input-delivery-info ' type="text" placeholder='Detailed Address' disabled/>
            </div>
            {/* ZIP CODE AND BARANGAY */}
            <div className='PO-dropdown-container'>
              <input className='input-delivery-info ' type="text" value={poZipCode} placeholder='Zip code' disabled/>
              <select value={selectedBarangay} onChange={(e) => setSelectedBarangay(e.target.value)} disabled> 
                <option value="" disabled hidden>Select Barangay</option>
                {
                  filteredBarangays.map((brgy) =>(
                    <option key={brgy.ID} value={brgy.ID}>
                      {brgy.barangayName}
                    </option>
                  ))
                }
              </select>
            </div>
            {/* PHONE NUMBER */}
            <div className='input-container'>
              <input value={poContactNumber} className='input-delivery-info ' type="tel" placeholder="+63 | Contact Number" disabled/>
            </div>
            <button type="button" className="DI-button" onClick={handleDeliveryInfoButton}>
              {hasDeliveryInfo ? "Edit Delivery Info" : "Add Delivery Info"}
            </button>

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
                <div onClick={() => setPaymentMethod('Cash On Delivery')} className={`cashOnDelivery-main ${paymentMethod === 'Cash On Delivery' ? 'codline-active' : 'codline-inactive'}`}>
                  <p className={`cashOnDelivery-circle ${paymentMethod === 'Cash On Delivery' ? 'codcircle-active' : 'codcircle-inactive'}`}></p>
                  <div className='cod-imgtainer'>
                    <img src={assets.cod_icon} alt="" className='cod-imgs'/>
                  </div>
                  <p className='cashOnDelivery-text'>Cash On Delivery</p>
                </div>
                <div onClick={() => setPaymentMethod('Paypal')} className={`paypal-main ${paymentMethod === 'Paypal' ? 'ppline-active' : 'ppline-inactive'}`}>
                  <p className={`paypal-circle ${paymentMethod === 'Paypal' ? 'ppcircle-active' : 'ppcircle-inactive'}`}></p>
                  <div className='paypal-imgtainer'>
                    <img src={assets.paypal_icon} alt="" className='paypal-imgs'/>
                  </div>
                </div>
              </div>
              <button type='submit' className='w-full text-center mt-8 submit-button'>PLACE ORDER</button>
            </div> 
         </div>
      </form>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default PlaceOrder
