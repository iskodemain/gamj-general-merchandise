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
  const {navigate, backendUrl, token, cartItems, totalPrice, products, toastError, toastSuccess, setCartItems, provinces, filteredCities, filteredBarangays, selectedProvince, setSelectedProvince, selectedCity, setSelectedCity, selectedBarangay, setSelectedBarangay, hasDeliveryInfo, poMedicalInstitutionName, poEmailAddress, poDetailedAddress, poZipCode, poContactNumber, setActiveStep, paymentMethod, setPaymentMethod, verifiedUser, setShowUnavailableNote, handleFetchDeliveryInfo, orderItems, addOrder, cartItemsToDelete, paypalClientId, showPaypalModal, setShowPaypalModal, fetchStorePolicy, getShippingFee} = useContext(ShopContext);

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [storePolicyContent, setStorePolicyContent] = useState('');

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

  useEffect(() => {
    const loadStorePolicy = async () => {
      if (fetchStorePolicy && fetchStorePolicy.content) {
        setStorePolicyContent(fetchStorePolicy.content);
      }
    };
    loadStorePolicy();
  }, [fetchStorePolicy]);


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

    setPendingOrderData({
      paymentMethod,
      orderItems,
      cartItemsToDelete
    });
    setShowConfirmModal(true);

    // if (paymentMethod === "Cash On Delivery") {
    //   setLoading(true); 
    //   const success = await addOrder(paymentMethod, orderItems, cartItemsToDelete);
    //   setLoading(false); 
    //   if (success) {
    //     window.location.href = "/orders"
    //   }
    // }

    // if (paymentMethod === "Paypal") {
    //   setShowPaypalModal(true);
    //   return;
    // }
  }

  const handleConfirmOrder = async () => {
    setShowConfirmModal(false);

    if (!pendingOrderData) return;

    const { paymentMethod, orderItems, cartItemsToDelete } = pendingOrderData;

    if (paymentMethod === "Cash On Delivery") {
      setLoading(true); 
      const success = await addOrder(paymentMethod, orderItems, cartItemsToDelete);
      setLoading(false); 
      if (success) {
        window.location.href = "/orders";
      }
    }

    if (paymentMethod === "Paypal") {
      setShowPaypalModal(true);
    }

    setPendingOrderData(null);
  };

  return (
    <>
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
      
      {/* ✅ CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="confirm-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-scroll">
              <div className="confirm-header">
                <div className="confirm-icon">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h2 className="confirm-title">Confirm Your Order</h2>
              </div>

              <div className="confirm-body">
                <p className="confirm-message">
                  Are you sure you want to place this order?
                </p>
                <div className="confirm-details">
                  <div className="confirm-detail-row">
                    <span className="confirm-label">Payment Method:</span>
                    <span className="confirm-value">{paymentMethod}</span>
                  </div>
                  <div className="confirm-detail-row">
                    <span className="confirm-label">Total Items:</span>
                    <span className="confirm-value">{orderItems?.length || 0}</span>
                  </div>
                  <div className="confirm-detail-row">
                    <span className="confirm-label">Total Amount:</span>
                    <span className="confirm-value">₱{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <p className="confirm-terms">
                  By placing this order, you agree to our{' '}
                  <button 
                    type="button"
                    className="confirm-terms-link" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTermsModal(true);
                    }}
                  >
                    Terms & Conditions
                  </button>
                </p>
              </div>

              <div className="confirm-actions">
                <button 
                  type="button"
                  className="confirm-btn confirm-btn-yes" 
                  onClick={handleConfirmOrder}
                >
                  Yes, Place Order
                </button>
                <button 
                  type="button"
                  className="confirm-btn confirm-btn-no" 
                  onClick={() => setShowConfirmModal(false)}
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ✅ TERMS & CONDITIONS MODAL - CUSTOMER VIEW */}
      {showTermsModal && (
        <div className="sp-preview-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="sp-preview-modal" onClick={(e) => e.stopPropagation()}>
            {/* Browser-style topbar */}
            <div className="sp-preview-topbar">
              <div className="sp-preview-topbar-left">
                <div className="sp-preview-dot sp-preview-dot--red" />
                <div className="sp-preview-dot sp-preview-dot--yellow" />
                <div className="sp-preview-dot sp-preview-dot--green" />
              </div>
              <div className="sp-preview-topbar-title">Store Policy</div>
              <button 
                type="button"
                className="sp-preview-close" 
                onClick={() => setShowTermsModal(false)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Header with gradient */}
            <div className="sp-preview-header">
              <div className="sp-preview-store-badge">Store Policy</div>
              <h2 className="sp-preview-heading">Terms &amp; Conditions</h2>
              <p className="sp-preview-meta">Please read these terms carefully before placing an order.</p>
            </div>

            {/* Scrollable content body */}
            <div className="sp-preview-body">
              {storePolicyContent && storePolicyContent.trim() ? (
                <div 
                  className="sp-preview-content" 
                  dangerouslySetInnerHTML={{ __html: storePolicyContent }} 
                />
              ) : (
                <div className="sp-preview-empty">
                  <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="#ccc" strokeWidth="2">
                    <rect x="8" y="4" width="48" height="56" rx="4"/>
                    <line x1="20" y1="20" x2="44" y2="20"/>
                    <line x1="20" y1="28" x2="44" y2="28"/>
                    <line x1="20" y1="36" x2="36" y2="36"/>
                  </svg>
                  <p>No Terms & Conditions available.<br />Please contact store support.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sp-preview-footer">
              <span className="sp-preview-footer-note">These are the official Terms & Conditions</span>
              <button 
                type="button"
                className="sp-preview-close-btn" 
                onClick={() => setShowTermsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PlaceOrder
