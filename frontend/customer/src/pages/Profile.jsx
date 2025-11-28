import React, { useContext, useEffect, useState } from 'react';
import './Profile.css';
import { HiMiniTrash } from "react-icons/hi2";
import { IoCloseOutline } from "react-icons/io5";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { toast } from 'react-toastify';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import Loading from '../components/Loading';
import { assets } from '../assets/assets';
import { IoIosEyeOff } from "react-icons/io";
import { IoIosEye } from "react-icons/io";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const {token, backendUrl, toastSuccess, toastError, provinces, filteredCities, filteredBarangays, selectedProvince, setSelectedProvince, selectedCity, setSelectedCity, selectedBarangay, setSelectedBarangay, setToken, verifiedUser, setVerifiedUser, rejectedCustomer, setRejectedCustomer, activeStep, setActiveStep, setHasDeliveryInfo, setNbProfileImage} = useContext(ShopContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadedImage, setShowUploadedImage] = useState(false);
  const [imageProofSize, setImageProofSize] = useState(null);


  // EDIT PROFILE (FETCHED)
  const [medicalInstitutionName, setMedicalInstitutionName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [landlineNumber, setLandlineNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [proofType, setProofType] = useState('');
  const [imageProof, setImageProof] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [repFirstName, setRepFirstName] = useState('');
  const [repLastName, setRepLastName] = useState('');
  const [repContactNumber, setRepContactNumber] = useState('');
  const [repEmailAddress, setRepEmailAddress] = useState('');
  const [repJobPosition, setRepJobPosition] = useState('');
  // EDIT PROFILE (NEW UPDATE)
  const [newImageProof, setNewImageProof] = useState(null);
  const [newProfileImage, setNewProfileImage] = useState(null);


  const handleCancelModal = () => {
    setImageProof(null);
    setShowUploadModal(false);
  }

  const handleContactNumber = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    // Limit to 10 digits max
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // Must start with 9
    if (value && value[0] !== '9') {
      return; // Ignore input if first digit isn't 9
    }

    setContactNumber(value);
  };

  const handleLandlineNumber = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');

    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    setLandlineNumber(value);
  };

  const handleRepContactNumber = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    // Limit to 10 digits max
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // Must start with 9
    if (value && value[0] !== '9') {
      return; // Ignore input if first digit isn't 9
    }

    setRepContactNumber(value);
  };

  const handleProofUpload = (e) => {
    const file = e.target.files[0];
    const allowedTypes = /jpeg|jpg|png|webp|svg|bmp|ico|tiff|heic|avif/;
    let readableSize;

    if (!file) return;

    if (e.target.files.length > 1) {
      toast.error("Please upload only one image.", {...toastError});
      setNewImageProof(null);
      return;
    }

    const fileType = file.type.split("/")[1].toLowerCase();
    if (!allowedTypes.test(fileType)) {
      toast.error("Invalid file type. Please upload an image.", {...toastError});
      setNewImageProof(null);
      return;
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.", {...toastError});
      setNewImageProof(null);
      return;
    }

    if (file.size < 1024 * 1024) {
      //show in KB
      readableSize = (file.size / 1024).toFixed(2) + " KB";
    } else {
      //show in MB
      readableSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    }

    setImageProofSize(readableSize);
    setNewImageProof(file);
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    const allowedTypes = /jpeg|jpg|png|webp|svg|bmp|ico|tiff|heic|avif/;
    let readableSize;

    if (!file) return;

    if (e.target.files.length > 1) {
      toast.error("Please upload only one image.", {...toastError});
      setNewProfileImage(null);
      return;
    }

    const fileType = file.type.split("/")[1].toLowerCase();
    if (!allowedTypes.test(fileType)) {
      toast.error("Invalid file type. Please upload an image.", {...toastError});
      setNewProfileImage(null);
      return;
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.", {...toastError});
      setNewProfileImage(null);
      return;
    }

    if (file.size < 1024 * 1024) {
      //show in KB
      readableSize = (file.size / 1024).toFixed(2) + " KB";
    } else {
      //show in MB
      readableSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    }
    setNewProfileImage(file);
    setNbProfileImage(file);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
  }

  const handleFetchEditProfile = async() => {
    try {
      const response = await axios.get(backendUrl + "/api/customer/profile/edit-profile", {
        headers: {
           Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setMedicalInstitutionName(response.data.user.medicalInstitutionName);
        setContactNumber(response.data.user.contactNumber);
        setLandlineNumber(response.data.user.landlineNumber);
        setEmailAddress(response.data.user.emailAddress);
        setFullAddress(response.data.user.fullAddress);
        setProofType(response.data.user.proofType);
        setImageProof(response.data.user.imageProof);
        setProfileImage(response.data.user.profileImage);
        setRepFirstName(response.data.user.repFirstName);
        setRepLastName(response.data.user.repLastName);
        setRepContactNumber(response.data.user.repContactNumber);
        setRepEmailAddress(response.data.user.repEmailAddress);
        setRepJobPosition(response.data.user.repJobPosition);
        setVerifiedUser(response.data.user.verifiedCustomer);
        setRejectedCustomer(response.data.user.rejectedCustomer);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    }
  }
  useEffect(() => {
    if (token) {
      handleFetchEditProfile();
    }
  }, [token]);

  const handleEditProfile = async(e) => {
    e.preventDefault();

    if (!medicalInstitutionName) {
      toast.error("Please enter the name of your medical institution.", { ...toastError });
      return;
    }
    
    if (!contactNumber) {
      toast.error("Please enter your contact number.", { ...toastError });
      return;
    }

    if (!emailAddress) {
      toast.error("Please enter your email address.", { ...toastError });
      return;
    }

    if (!fullAddress) {
      toast.error("Please enter the full address of your institution.", { ...toastError });
      return;
    }

    if (!proofType) {
      toast.error("You forgot to select a proof type.", { ...toastError });
      return;
    }

    if (!newImageProof && !imageProof) {
      toast.error("Uploading proof of legitimacy is required.", { ...toastError });
      return;
    }

    if (!repFirstName) {
      toast.error("Please enter your first name.", { ...toastError });
      return;
    }

    if (!repLastName) {
      toast.error("Please enter your last name.", { ...toastError });
      return;
    }

    if (!repContactNumber) {
      toast.error("Please enter your contact number.", { ...toastError });
      return;
    }

    if (!repEmailAddress) {
      toast.error("Please enter your work email address.", { ...toastError });
      return;
    }

    if (!repJobPosition) {
      toast.error("Please enter your job position or designation.", { ...toastError });
      return;
    }

    const formData = new FormData();
    formData.append("medicalInstitutionName", medicalInstitutionName);
    formData.append("contactNumber", contactNumber);
    formData.append("landlineNumber", landlineNumber);
    formData.append("emailAddress", emailAddress);
    formData.append("fullAddress", fullAddress);
    formData.append("proofType", proofType);
    formData.append("repFirstName", repFirstName);
    formData.append("repLastName", repLastName);
    formData.append("repContactNumber", repContactNumber);
    formData.append("repEmailAddress", repEmailAddress);
    formData.append("repJobPosition", repJobPosition);

    if (newImageProof instanceof File) {
      formData.append("imageProof", newImageProof);
    }

    if (newProfileImage instanceof File) {
      formData.append("profileImage", newProfileImage);
    }

    setLoading(true); 

    try {
      const response = await axios.put(backendUrl + "/api/customer/profile/edit-profile/update", formData, {
        headers: {
           Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        if (response.data.user?.profileImage) {
          setNbProfileImage(response.data.user.profileImage);
        }
        
        toast.success(response.data.message, {...toastSuccess});
      } else {
        toast.error(response.data.message, {...toastError});
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    } finally {
      setLoading(false);
    }
    
  } 


  // DELIVERY INFORMATION
  const [DIemailAddress, setDIEmailAddress] = useState('');
  const [country] = useState('Philippines')
  const [detailedAddress, setDetailedAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [DIcontactNumber, setDIcontactNumber] = useState('');

  const handleZipCode = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    // Limit to 10 digits max
    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    setZipCode(value);
  };

  const deliveryContactNumber = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    // Limit to 10 digits max
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // Must start with 9
    if (value && value[0] !== '9') {
      return; // Ignore input if first digit isn't 9
    }

    setDIcontactNumber(value);
  };

  const handleFetchDeliveryInfo = async() => {
    try {
      const response = await axios.get(backendUrl + "/api/customer/profile/delivery-info", {
        headers: {
           Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setDIEmailAddress(response.data.user.emailAddress);
        setDetailedAddress(response.data.user.detailedAddress);
        setZipCode(response.data.user.zipCode);
        setDIcontactNumber(response.data.user.contactNumber);

        // Use context states instead of local ones
        setSelectedProvince(response.data.user.provinceId);
        setSelectedCity(response.data.user.cityId);
        setSelectedBarangay(response.data.user.barangayId); 
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    }
  }
  useEffect(() => {
    if (token) {
      handleFetchDeliveryInfo();
    }
  }, [token]);

  const handleDeliveryInfo = async(e) => {
    e.preventDefault();

    if (!DIemailAddress) {
      toast.error("Please enter your email address.", { ...toastError });
      return;
    }

    if (!selectedProvince) {
      toast.error("Please select your province.", { ...toastError });
      return;
    }

    if (!selectedCity) {
      toast.error("Please select your city.", { ...toastError });
      return;
    }

    if (!detailedAddress) {
      toast.error("Please enter your detailed address.", { ...toastError });
      return;
    }

    if (!zipCode) {
      toast.error("Please enter your zip code.", { ...toastError });
      return;
    }

    if (!selectedBarangay) {
      toast.error("Please select your barangay.", { ...toastError });
      return;
    }

    if (!contactNumber) {
      toast.error("Please enter your contact number.", { ...toastError });
      return;
    }
    setLoading(true); 

    try {
      const payload = {
        medicalInstitutionName, 
        emailAddress: DIemailAddress, 
        provinceId: selectedProvince, 
        cityId: selectedCity, 
        detailedAddress,
        zipCode, 
        barangayId: selectedBarangay, 
        contactNumber: DIcontactNumber 
      };
      const response = await axios.put(backendUrl + "/api/customer/profile/delivery-info/edit", payload, {
        headers: {Authorization: `Bearer ${token}`}
      });
      if (response.data.success) {
        setHasDeliveryInfo(true);
        toast.success(response.data.message, {...toastSuccess});
      } else {
        toast.error(response.data.message, {...toastError});
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    } finally {
      setLoading(false);
    }
    
  } 

  // ACCOUNT SECURTY
  const [identifier, setIdentifier] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [accountUpdate, setAccountUpdate] = useState(false)

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isCurrentPasswordFocused, setIsCurrentPasswordFocused] = useState(false);
  const [newPasswordType, setNewPasswordType] = useState('password');
  const [currrentPasswordType, setCurrentPasswordType] = useState('password');
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialCharacter, setHasSpecialCharacter] = useState(false);

  // VERIFY BUTTON
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialCharacter;

  const passedChecks = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialCharacter,
  ];

  const passedCount = passedChecks.filter(Boolean).length;

  const toggleNewPassword = () => {
    setNewPasswordType((prevPasswordType) => 
      prevPasswordType === 'password' ? 'text' : 'password'
    );
  };

  const toggleCurrentPassword = () => {
    setCurrentPasswordType((prevPasswordType) => 
      prevPasswordType === 'password' ? 'text' : 'password'
    );
  };

  // 
  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }

  const confirmDeleteAccount = async() => {
    setLoading(true); 
    try {
      const response = await axios.delete(backendUrl + "/api/customer/profile/account-security/delete", {
        headers: {Authorization: `Bearer ${token}`}
      });
      if (response.data.success) {
        toast.success(response.data.message, {...toastSuccess});
        localStorage.removeItem('token');
        setToken('');
        navigate('/login')
      } else {
        toast.error(response.data.message, {...toastError});
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    } finally {
      setLoading(false);
    }
  }


  // FETCH ACCOUNT SECURITY
  const handleFetchAccountSecurity = async() => {
    try {
      const response = await axios.get(backendUrl + "/api/customer/profile/account-security", {
        headers: {
           Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setIdentifier(response.data.identifier);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    }
  }
  useEffect(() => {
    if (token) {
      handleFetchAccountSecurity();
    }
  }, [token]);

  // ACCOUNT STEP 1
  const stepOneAccountSecurity = async(e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.", { ...toastError });
      return;
    }

    if (!newPassword) {
      toast.error("Please enter your new password.", { ...toastError });
      return;
    }

    setLoading(true); 

    try {
      const payload = {
        currentPassword
      };
      const response = await axios.post(backendUrl + "/api/customer/profile/account-security/verify", payload, {
        headers: {Authorization: `Bearer ${token}`}
      });
      if (response.data.success) {
        toast.success(response.data.message, {...toastSuccess});
        setAccountUpdate(true)
      } else {
        toast.error(response.data.message, {...toastError});
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    } finally {
      setLoading(false);
    }

  } 

  // ACCOUNT STEP 2
  const stepTwoAccountSecurity = async(e) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error("Please enter your new password.", { ...toastError });
      return;
    }

    if (!code) {
      toast.error("Please enter your verification code.", { ...toastError });
      return;
    }

    setLoading(true); 

    try {
      const payload = {
        newPassword,
        verificationCode: code
      };
      const response = await axios.put(backendUrl + "/api/customer/profile/account-security/update", payload, {
        headers: {Authorization: `Bearer ${token}`}
      });
      if (response.data.success) {
        toast.success(response.data.message, {...toastSuccess});
        setCurrentPassword('');
        setNewPassword('');
        setCode('');
        setAccountUpdate(false);
      } else {
        toast.error(response.data.message, {...toastError});
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    } finally {
      setLoading(false);
    }

  } 


  useEffect(() => {
      const minLength = newPassword.length >= 8;
      const hasUpper = /[A-Z]/.test(newPassword);
      const hasLower = /[a-z]/.test(newPassword);
      const hasNum = /[0-9]/.test(newPassword);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  
      setHasMinLength(minLength);
      setHasUpperCase(hasUpper);
      setHasLowerCase(hasLower);
      setHasNumber(hasNum);
      setHasSpecialCharacter(hasSpecial);
  
    }, [newPassword]);

  

  const ViewImage = () => {
    if (!imageProof && !newImageProof) return null;

    const imageSrc = newImageProof
      ? URL.createObjectURL(newImageProof)
      : imageProof;

    return (
      <div className="view-image-bg">
        <img src={imageSrc} alt="Uploaded Preview" className="image-preview" />
        <div className="view-image-component">
          <IoCloseOutline
            onClick={() => setShowUploadedImage(false)}
            className="close-preview-btn"
          />
          <p className="vi-profile-name">
            {newImageProof && newImageProof.name}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-steps">
        <div
          className={`step${activeStep === 1? ' active' : ''}`}
          onClick={() => setActiveStep(1)}
          style={{ cursor: 'pointer' }}>
          <span className="step-label">Edit Profile</span>
        </div>
        <div
          className={`step${activeStep === 2 ? ' active' : ''}`}
          onClick={() => setActiveStep(2)}
          style={{ cursor: 'pointer' }}
        >
          <span className="step-label">Delivery Info</span>
        </div>
        <div
          className={`step${activeStep === 3 ? ' active' : ''}`}
          onClick={() => setActiveStep(3)}
          style={{ cursor: 'pointer' }}
        >
          <span className="step-label">Security</span>
        </div>
      </div>

      {activeStep === 1 && (
        <>
          <div className='edit-profile-main'>
            {loading && <Loading />}
            <h2 className="profile-title">Edit Profile</h2>
            <div className='profile-picture-main'>
              <label htmlFor='profileImage' className={`profile-picture ${newProfileImage ? 'active' : ''}`}>
                <img src={newProfileImage ? URL.createObjectURL(newProfileImage) :  profileImage} alt="" />
                <div className="overlay">
                  <FaRegEdit className="overlay-icon" />
                </div>
                <input onChange={handleProfileUpload} type="file" id="profileImage" accept="image/*" hidden/>
              </label>
              <div className='recommended-ct'>
                <p className='recommend-px first'>Recommended:</p>
                <p className='recommend-px second'>500 × 500 px</p>
              </div>
            </div>
            
            <form className="profile-form" onSubmit={handleEditProfile}>
              <section className="profile-section-m">
                <h3 className="section-title">Medical Institution Information</h3>
                <div className="form-group">
                  <label>Medical Institution Name</label>
                  <input onChange={(e) => setMedicalInstitutionName(e.target.value)} value={medicalInstitutionName} type="text" placeholder="Enter institution name" required/>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input onChange={handleContactNumber} value={contactNumber} type="text" placeholder="Enter contact number" required/>
                  </div>
                  <div className="form-group">
                    <label>Landline Number (Optional)</label>
                    <input onChange={handleLandlineNumber} value={landlineNumber} type="text" placeholder="02 | Landline number" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Official Email Address</label>
                  <input onChange={(e) => setEmailAddress(e.target.value)} value={emailAddress} type="email" placeholder="Enter official email" required/>
                </div>
                <div className="form-group">
                  <label>Official Full Address</label>
                  <input onChange={(e) => setFullAddress(e.target.value)} value={fullAddress} type="text" placeholder="Enter full address" required/>
                </div>
                {!verifiedUser &&
                  <button type="button" className="review-proof-btn" onClick={() => setShowUploadModal(true)}>
                  <div className='icon-text-tainer'>
                    <IoEyeOutline className="eye-icon" />
                    <p>Review Uploaded Proof</p>
                  </div>
                </button>
                }
              </section>
              <section className="profile-section-a">
                <h3 className="section-title">Authorized Representative Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input onChange={(e) => setRepFirstName(e.target.value)} value={repFirstName} type="text" placeholder="Enter first name" required/>
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input onChange={(e) => setRepLastName(e.target.value)} value={repLastName} type="text" placeholder="Enter last name" required/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Work Contact Number</label>
                    <input onChange={handleRepContactNumber} value={repContactNumber} type="text" placeholder="Enter work contact number" required/>
                  </div>
                  <div className="form-group">
                    <label>Work Email Address</label>
                    <input onChange={(e) => setRepEmailAddress(e.target.value)} value={repEmailAddress} type="email" placeholder="Enter work email" required/>
                  </div>
                </div>
                <div className="form-group">
                  <label>Job Position/Designation</label>
                  <input onChange={(e) => setRepJobPosition(e.target.value)} value={repJobPosition} type="text" placeholder="Enter job position/designation" required/>
                </div>
              </section>
              <button type="submit" className="save-btn">Save Changes</button>
            </form>
            {/* <div className='profile-in-container'>
              <p className='profile-in-title'>IMPORTANT NOTE:</p>
              <p className='profile-in-paragraph'>
                Your account is currently under verification. Please wait for approval—we will notify you once your account has been successfully verified. In the meantime, purchasing products is temporarily unavailable as we review your information. Thank you for your patience and understanding.
              </p>
            </div> */}
          </div>
        </>
      )}

      {activeStep === 2 && (
        <>
        {loading && <Loading />}
          <h2 className="profile-title">Delivery Information</h2>
          <form className="profile-form" onSubmit={handleDeliveryInfo}>
            <div className="form-group">
              <label>Medical Institution Name</label>
              <input value={medicalInstitutionName} type="text" required disabled/>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input onChange={(e) => setDIEmailAddress(e.target.value)} value={DIemailAddress} type="email" placeholder="Enter your email address" required/>
            </div>
            <div className="form-group">
              <label>Select Country</label>
              <input value={country} type="text" placeholder="Philippines" disabled required/>
            </div>
            <div className="form-row">
              {/* PROVINCE DROPDOWN */}
              <div className="form-group">
                <label>Province</label>
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} required>
                  <option value="" disabled hidden>Select Province</option>
                  {
                    provinces.map((prov) =>(
                      <option key={prov.ID} value={prov.ID}>
                        {prov.provinceName}
                      </option>
                    ))
                  }
                </select>
              </div>
              {/* CITY DROPDOWN */}
              <div className="form-group">
                <label>City</label>
                <select className='select-cb' value={selectedCity}  onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} required>
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
            </div>
            <div className="form-group">
              <label>Detailed Address</label>
              <input onChange={(e) => setDetailedAddress(e.target.value)} value={detailedAddress} type="text" placeholder="Enter your detailed address" required/>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Zip Code</label>
                <input onChange={handleZipCode} value={zipCode} type="text" placeholder="Enter your zip code" required/>
              </div>
              {/* BARANGAY DROPDOWN */}
              <div className="form-group">
                <label>Barangay</label>
                <select className='select-cb' value={selectedBarangay} onChange={(e) => setSelectedBarangay(e.target.value)} disabled={!selectedCity} required> 
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
            </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input onChange={deliveryContactNumber} value={DIcontactNumber} type="text" placeholder="+63 9876543210" required/>
              </div>
            
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </form>
        </>
      )}

      {activeStep === 3 && (
        <>
        {loading && <Loading />}
          <div className="security-header">
            <h2 className="profile-title" style={{ marginBottom: 0 }}>Account Security</h2>
            <button type="button" className="delete-account-btn" onClick={handleDeleteAccount}>
              <HiMiniTrash size={20} style={{ marginRight: 2 }} />
              Delete Account
            </button>
          </div>
          {!accountUpdate ? 
            // FIRST STEP
            <form className="profile-form" onSubmit={stepOneAccountSecurity}>
              <div className="form-group">
                <label>
                  {/\S+@\S+\.\S+/.test(identifier) ? "Email Address" : "Phone Number"}
                </label>
                <input value={identifier} type="text" disabled/>
              </div>
              <div className="change-password">
                <label className='cyp-label'>Change Your Password</label>
                <div className={`current-password ${isCurrentPasswordFocused ? 'focused' : ''}`} onClick={() => setIsCurrentPasswordFocused(true)} onBlur={() => setIsCurrentPasswordFocused(false)} tabIndex={-1}>
                  <input onChange={(e)=>setCurrentPassword(e.target.value)} value={currentPassword} type={currrentPasswordType} placeholder='Current password' required onBlur={() => setIsCurrentPasswordFocused(false)}/>
                  <div onClick={toggleCurrentPassword} className='current-password-showHidePass'>
                    {currrentPasswordType === 'password' ? <IoIosEyeOff className='current-offPass'/> : <IoIosEye className='current-onPass'/>}
                  </div>
                </div>
                <div className={`new-password ${isPasswordFocused ? 'focused' : ''}`} onClick={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} tabIndex={-1}>
                  <input onChange={(e)=>setNewPassword(e.target.value)} value={newPassword} type={newPasswordType} placeholder='New password' required onBlur={() => setIsPasswordFocused(false)}/>
                  <div onClick={toggleNewPassword} className='new-password-showHidePass'>
                    {newPasswordType === 'password' ? <IoIosEyeOff className='np-offPass'/> : <IoIosEye className='np-onPass'/>}
                  </div>
                </div>
              </div>
      
              <div className='new-password-validator'>
                {[...Array(5)].map((_, index) => (
                  <span
                    key={index}
                    className={`np-line-password ${passedCount > index ? 'valid' : ''}`}
                  ></span>
                ))}
              </div>
      
              <div className="np-password-rules">
                {isPasswordValid ? 
                <FaCheckCircle className='np-infocon-valid'/> :
                <AiOutlineInfoCircle className='np-infocon'/>
                }
      
                {!hasLowerCase ? 
                  <p className='np-rules-txt'>Must include at least one lowercase letter (a–z)</p> :!hasUpperCase ? 
                  <p className='np-rules-txt'>Must include at least one uppercase letter (A–Z)</p> : !hasMinLength ? 
                  <p className='np-rules-txt'>Password must be at least 8 characters long</p> : !hasNumber ? 
                  <p className='np-rules-txt'>Must include at least one number (0–9)</p> : !hasSpecialCharacter ? <p className='np-rules-txt'>Must include at least one special character (e.g. !@#$%^&*())</p> : isPasswordValid && <p className='np-rules-txt valid'>Strong password confirmed.</p> 
                }
              </div>
              
              <button type="submit" className="save-btn" disabled={!isPasswordValid || loading}>
              {loading ? 'Saving...' : 'Save Changes'}</button>
            </form> :

            // SECOND STEP
            <form className="profile-form" onSubmit={stepTwoAccountSecurity}>
              <div className="form-group">
                <label>
                  {/\S+@\S+\.\S+/.test(identifier) ? "Email Address" : "Phone Number"}
                </label>
                <input value={identifier} type="text" disabled/>
              </div>
              <div className="ac-verify-code">
                <label> 
                  Verification Code Send to Your {/\S+@\S+\.\S+/.test(identifier) ? "Email Address" : "Phone Number"}
                </label>
                <input onChange={(e) => setCode(e.target.value)} value={code} type="text" placeholder='Enter you 6-digits verification code.'/>
              </div>
              <button type="submit" className="save-btn" disabled={!isPasswordValid || loading}>
              {loading ? 'Verifying...' : 'Verify Code'}</button>
            </form>
          }
        </>
      )}

      {showUploadModal && (
        <div className="upload-modal-bg">
          {showUploadedImage && <ViewImage/>}
          <div className='upload-modal-border'>
            <div className="upload-modal-card">
              {imageProof && 
                <button type='button' className='um-cls-btn' onClick={handleCloseModal}>
                  <IoCloseOutline/>
                </button>
              }
              <div className="upload-modal-header">
                <p className='upload-title'>Upload Proof of Legitimacy</p>
                <p className='upload-description'>Submit a clear and detailed image of your valid proof to verify your legitimacy in the medical industry</p>
              </div>
              {(!imageProof && !newImageProof) && (
                <label htmlFor="imageProofInput" className="upload-modal-dashed">
                  <div className='upload-icon-bg'>
                    <div className='upload-circle-bg'>
                      <FaCloudUploadAlt className="upload-icon" />
                    </div>
                  </div>
                  <div className="select-modal-container">
                    <p className='select-text-1'>Select one image file to upload</p>
                    <p className='select-text-2'>
                      Your image will remain private and used only for verification.
                    </p>
                  </div>

                  <div className='select-button-bg'>
                    <p className='select-files'>Select Files</p>
                  </div>

                  <p className='file-acceptable'>(PNG, JPG, JPEG, etc.)</p>
                  <input
                    id="imageProofInput"
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleProofUpload}
                  />
                </label>
              )}
    
              {imageProof ? 
                <div className='uploaded-image-modal'>
                  <div className='uploaded-icon-main'>
                    <div className='uploaded-icon-bg'>
                      <img src={assets.uploaded_file_icon} className='uploaded-icon' alt="" />
                    </div>
                  </div>
                  <p className='proof-file-name'>Image Succesfully Uploaded</p>
                  <div className='uploaded-button-modal'>
                    <button onClick={() => setImageProof(null)} className='remove-image-btn'>Remove</button>
                    <button className='view-image-btn' onClick={()=> setShowUploadedImage(true)}>View Image</button>
                  </div>
                </div> : 
                
                newImageProof &&
                <div className='uploaded-image-modal'>
                  <div className='uploaded-icon-main'>
                    <div className='uploaded-icon-bg'>
                      <img src={assets.uploaded_file_icon} className='uploaded-icon' alt="" />
                    </div>
                  </div>
                  <p className='proof-file-name'>{newImageProof.name}</p>
                  <p className='proof-file-size'>Size: {imageProofSize}</p>
                  <div className='uploaded-button-modal'>
                    <button onClick={() => setNewImageProof(null)} className='remove-image-btn'>Remove</button>
                    <button className='view-image-btn' onClick={()=> setShowUploadedImage(true)}>View Image</button>
                  </div>
                </div>
              }
    
              <div>
                <select value={proofType} onChange={e => setProofType(e.target.value)} className="upload-modal-dropdown">
                  <option value="" disabled hidden>Uploaded Proof Type</option>
                  <option className="option-type" value="Business Permit">Business Permit</option>
                  <option className="option-type" value="DOH License">DOH License</option>
                  <option className="option-type" value="Other">Other</option>
                </select>
              </div>
              <div className="upload-modal-btns">
                {!imageProof && !newImageProof && 
                  (
                  <button type="button" className="upload-modal-cancel" onClick={handleCancelModal}>Cancel</button>
                  )
                }

                <button type="button" className="upload-modal-confirm" onClick={() => setShowUploadModal(false)} disabled={!(imageProof || newImageProof) || !proofType}>Confirm &amp; Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className='view-delete-modal'>
          <div className='confirm-delete-modal'>
            <div className='delete-modal-text'>
              <p className='head-confirmation'>Confirm Delete</p>
              <p className='text-confirmation'>Are you sure you want to delete your account?</p>
            </div>
            <div className='confirm-button'>
              <button type='button' className='y-da' onClick={confirmDeleteAccount}>Yes</button>
              <button type='button' className='n-da' onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {
        verifiedUser === false && rejectedCustomer === false && (
          <div className='profile-in-container'>
            <p className='profile-in-title-unverified'>IMPORTANT NOTE:</p>
            <p className='profile-in-paragraph-unverified'>
              Your account is currently under verification. Please wait for approval—we will notify you once your account has been successfully verified. In the meantime, purchasing products is temporarily unavailable as we review your information. Thank you for your patience and understanding.
            </p>
          </div>
        ) 
      }
      {
        verifiedUser === false && rejectedCustomer === true && (
          <div className='profile-in-container'>
            <p className='profile-in-title-rejected'>IMPORTANT NOTE:</p>
            <p className='profile-in-paragraph-rejected'>
              Your account application has been reviewed and unfortunately cannot be approved at this time. Because of this, access to purchasing products is currently unavailable. If you believe this decision was made in error or need further clarification, you may contact our support team at: <i>gamjmerchandisehelp@gmail.com</i>. Thank you for your understanding.
            </p>
          </div>
        ) 
      }
      
    </div>

  );
}

export default Profile;
