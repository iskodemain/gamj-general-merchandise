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
import UnavailableNote from '../components/Notice/UnavailableNote'

function PlaceOrder() {
  const {navigate, backendUrl, token, cartItems, overallPrice, products, toastError, toastSuccess, setCartItems, provinces, filteredCities, filteredBarangays, selectedProvince, setSelectedProvince, selectedCity, setSelectedCity, selectedBarangay, setSelectedBarangay, hasDeliveryInfo, medicalInstitutionName, emailAddress, detailedAddress, zipCode, contactNumber, setActiveStep, paymentMethod, setPaymentMethod, verifiedUser, setShowUnavailableNote, subtotal} = useContext(ShopContext);

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
    }

    if (subtotal <= 0) {
      toast.error("No products found.", {...toastError});
    }
    
  }

  

  return (
    <div className='pl-main'>
      {!verifiedUser && <UnavailableNote/>}
      <form onSubmit={onSubmitHandler} className='pl-form'>
        {/* DELIVERY INFORMATION */}
        <div className='di-main'>
            <div className='text-xl sm:text-2xl my-3'>
              <MainTitle mtext1={'DELIVERY'} mtext2={'INFORMATION'}></MainTitle>
            </div>
            {/* MEDICAL INSTITUTION NAME */}
            <div className='input-container'>
              <input value={medicalInstitutionName} placeholder='Medical Institution Name' className='input-delivery-info ' type="text" disabled/>
            </div>
            {/* EMAIL ADDRESS */}
            <div className='input-container'>
              <input value={emailAddress}  className='input-delivery-info ' type="email" placeholder='Email Address' disabled/>
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
              <input value={detailedAddress}  className='input-delivery-info ' type="text" placeholder='Detailed Address' disabled/>
            </div>
            {/* ZIP CODE AND BARANGAY */}
            <div className='PO-dropdown-container'>
              <input className='input-delivery-info ' type="text" value={zipCode} placeholder='Zip code' disabled/>
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
              <input value={contactNumber} className='input-delivery-info ' type="tel" placeholder="+63 | Contact Number" disabled/>
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
                <div onClick={() => setPaymentMethod('paypal')} className={`paypal-main ${paymentMethod === 'paypal' ? 'ppline-active' : 'ppline-inactive'}`}>
                  <p className={`paypal-circle ${paymentMethod === 'paypal' ? 'ppcircle-active' : 'ppcircle-inactive'}`}></p>
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
