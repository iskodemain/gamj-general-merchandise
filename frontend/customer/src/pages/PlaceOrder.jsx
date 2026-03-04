import React, {useContext, useState, useEffect, useRef} from 'react'
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
  
  // ✅ NEW: Editable delivery info states
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [editDIEmailAddress, setEditDIEmailAddress] = useState('');
  const [editDetailedAddress, setEditDetailedAddress] = useState('');
  const [editZipCode, setEditZipCode] = useState('');
  const [editDIContactNumber, setEditDIContactNumber] = useState('');
  const [editProvince, setEditProvince] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editBarangay, setEditBarangay] = useState('');
  const isEnteringEditMode = useRef(false);

  const prevProvinceRef = useRef('');
  const prevCityRef = useRef('');

  useEffect(() => {
    if (token) {
      handleFetchDeliveryInfo();
    }
  }, [location, token]);

  // ✅ Reset city and barangay when province changes in edit mode
  useEffect(() => {
    if (isEditingDelivery && editProvince) {
      // Only reset if province actually changed (not just entering edit mode)
      if (prevProvinceRef.current !== '' && prevProvinceRef.current !== editProvince) {
        setEditCity('');
        setEditBarangay('');
        setSelectedCity('');
        setSelectedBarangay('');
      }
      prevProvinceRef.current = editProvince;
    }
  }, [editProvince, isEditingDelivery]);

  // ✅ Reset barangay when city changes in edit mode
  useEffect(() => {
    if (isEditingDelivery && editCity) {
      // Only reset if city actually changed (not just entering edit mode)
      if (prevCityRef.current !== '' && prevCityRef.current !== editCity) {
        setEditBarangay('');
        setSelectedBarangay('');
      }
      prevCityRef.current = editCity;
    }
  }, [editCity, isEditingDelivery]);


  const handleDeliveryInfoButton = () => {
    setActiveStep(2);
    navigate('/profile');
  };

  const handleZipCode = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    setEditZipCode(value);
  };

  const handleContactNumber = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    if (value && value[0] !== '9') {
      return;
    }
    setEditDIContactNumber(value);
  };

  const handleEditToggle = () => {
    if (!isEditingDelivery) {
      // Entering edit mode - populate fields
      setEditDIEmailAddress(poEmailAddress || '');
      setEditDetailedAddress(poDetailedAddress || '');
      setEditZipCode(poZipCode || '');
      setEditDIContactNumber(poContactNumber || '');
      setEditProvince(selectedProvince || '');
      setEditCity(selectedCity || '');
      setEditBarangay(selectedBarangay || '');
      
      // ✅ Reset previous value refs when entering edit mode
      prevProvinceRef.current = selectedProvince || '';
      prevCityRef.current = selectedCity || '';
    } else {
      // Exiting edit mode - restore original values
      setEditDIEmailAddress(poEmailAddress || '');
      setEditDetailedAddress(poDetailedAddress || '');
      setEditZipCode(poZipCode || '');
      setEditDIContactNumber(poContactNumber || '');
      setEditProvince(selectedProvince || '');
      setEditCity(selectedCity || '');
      setEditBarangay(selectedBarangay || '');
      
      // ✅ Reset refs when exiting
      prevProvinceRef.current = '';
      prevCityRef.current = '';
    }
    setIsEditingDelivery(!isEditingDelivery);
  };


  const handleSaveDeliveryChanges = async (e) => {
    e.preventDefault();

    if (!editDIEmailAddress) {
      toast.error("Please enter your email address.", { ...toastError });
      return;
    }

    if (!editProvince) {
      toast.error("Please select your province.", { ...toastError });
      return;
    }

    if (!editCity) {
      toast.error("Please select your city.", { ...toastError });
      return;
    }

    if (!editDetailedAddress) {
      toast.error("Please enter your detailed address.", { ...toastError });
      return;
    }

    if (!editZipCode) {
      toast.error("Please enter your zip code.", { ...toastError });
      return;
    }

    if (!editBarangay) {
      toast.error("Please select your barangay.", { ...toastError });
      return;
    }

    if (!editDIContactNumber) {
      toast.error("Please enter your contact number.", { ...toastError });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        medicalInstitutionName: poMedicalInstitutionName,
        emailAddress: editDIEmailAddress,
        provinceId: editProvince,
        cityId: editCity,
        detailedAddress: editDetailedAddress,
        zipCode: editZipCode,
        barangayId: editBarangay,
        contactNumber: editDIContactNumber
      };

      const response = await fetch(backendUrl + "/api/customer/profile/delivery-info/edit", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message, { ...toastSuccess });
        // Update context states with new values
        setSelectedProvince(editProvince);
        setSelectedCity(editCity);
        setSelectedBarangay(editBarangay);
        // Refresh delivery info
        await handleFetchDeliveryInfo();
        // Exit edit mode
        setIsEditingDelivery(false);
      } else {
        toast.error(data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, { ...toastError });
    } finally {
      setLoading(false);
    }
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
      if (success) {
        window.location.href = "/orders"
      }
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
            <input 
              value={poMedicalInstitutionName} 
              placeholder='Medical Institution Name' 
              className='input-delivery-info' 
              type="text" 
              disabled
            />
          </div>

          {/* EMAIL ADDRESS */}
          <div className='input-container'>
            <input 
              value={isEditingDelivery ? editDIEmailAddress : poEmailAddress}
              onChange={(e) => setEditDIEmailAddress(e.target.value)}
              className='input-delivery-info' 
              type="email" 
              placeholder='Email Address' 
              disabled={!isEditingDelivery}
            />
          </div>

          {/* COUNTRY PHILIPPINES */}
          <div className='input-container'>
            <input 
              className='input-delivery-info' 
              type="text" 
              value="Country: Philippines" 
              disabled
            />
          </div>

          {/* PROVINCE AND CITY */}
          <div className='PO-dropdown-container'>
            <select 
              value={isEditingDelivery ? editProvince : selectedProvince}
              onChange={(e) => {
                const value = e.target.value;
                setEditProvince(value);
                setSelectedProvince(value); // ✅ UPDATE CONTEXT TOO
              }}
              disabled={!isEditingDelivery}
            >
              <option value="" disabled hidden>Select Province</option>
              {provinces.map((prov) => (
                <option key={prov.ID} value={prov.ID}>
                  {prov.provinceName}
                </option>
              ))}
            </select>
            
            <select 
              value={isEditingDelivery ? editCity : selectedCity}
              onChange={(e) => {
                const value = e.target.value;
                setEditCity(value);
                setSelectedCity(value); // ✅ UPDATE CONTEXT TOO
              }}
              disabled={!isEditingDelivery}
            >
              <option value="" disabled hidden>Select City</option>
              {filteredCities.map((city) => (
                <option key={city.ID} value={city.ID}>
                  {city.cityName}
                </option>
              ))}
            </select>
          </div>

          {/* STREET ADDRESS */}
          <div className='input-container'>
            <input 
              value={isEditingDelivery ? editDetailedAddress : poDetailedAddress}
              onChange={(e) => setEditDetailedAddress(e.target.value)}
              className='input-delivery-info' 
              type="text" 
              placeholder='Detailed Address' 
              disabled={!isEditingDelivery}
            />
          </div>

          {/* ZIP CODE AND BARANGAY */}
          <div className='PO-dropdown-container'>
            <input 
              className='input-delivery-info' 
              type="text" 
              value={isEditingDelivery ? editZipCode : poZipCode}
              onChange={handleZipCode}
              placeholder='Zip code' 
              disabled={!isEditingDelivery}
            />
            <select 
              value={isEditingDelivery ? editBarangay : selectedBarangay}
              onChange={(e) => {
                const value = e.target.value;
                setEditBarangay(value);
                setSelectedBarangay(value); // ✅ UPDATE CONTEXT TOO
              }}
              disabled={!isEditingDelivery}
            > 
              <option value="" disabled hidden>Select Barangay</option>
              {filteredBarangays.map((brgy) => (
                <option key={brgy.ID} value={brgy.ID}>
                  {brgy.barangayName}
                </option>
              ))}
            </select>
          </div>

          {/* PHONE NUMBER */}
          <div className='input-container'>
            <input 
              value={isEditingDelivery ? editDIContactNumber : poContactNumber}
              onChange={handleContactNumber}
              className='input-delivery-info' 
              type="tel" 
              placeholder="+63 | Contact Number" 
              disabled={!isEditingDelivery}
            />
          </div>

          {/* ✅ NEW: Conditional Buttons */}
          {!isEditingDelivery ? (
            <button 
              type="button" 
              className="DI-button" 
              onClick={hasDeliveryInfo ? handleEditToggle : handleDeliveryInfoButton}
            >
              {hasDeliveryInfo ? "Edit Delivery Info" : "Add Delivery Info"}
            </button>
          ) : (
            <div className="DI-edit-buttons">
              <button 
                type="button" 
                className="DI-button-cancel" 
                onClick={() => setIsEditingDelivery(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="DI-button-save" 
                onClick={handleSaveDeliveryChanges}
              >
                Save Changes
              </button>
            </div>
          )}
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
