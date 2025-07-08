import React, {useContext, useEffect, useState}from 'react'
import './Login.css'
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import { ShopContext } from '../context/ShopContext.jsx'
import axios from 'axios'
import { toast } from "react-toastify";
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import { FaCloudUploadAlt } from "react-icons/fa";

// NOTE: MAKE SURE NA SAME YUNG VARIABLE NAME NG (USERS ACCOUNT VARIABLES) SA BACKEND MO HANGGANG DITO. FROM DATABASE, VARIABLE SA SERVER HANGGANG DITO SA FRONTEND.
function Login() {
  const [currentState, setCurrentState] = useState('Login');
  const {token, setToken, navigate, backendUrl, toastSuccess, toastError, setEmailAccountCreate} = useContext(ShopContext)

  // USERS ACCOUNT VARIABLES
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordType, setPasswordType] = useState('password')
  const [user_name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // New fields for Create Account
  const [medicalInstitutionName, setMedicalInstitutionName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [landlineNumber, setLandlineNumber] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedProofType, setUploadedProofType] = useState('');
  //navigate('/account-verification');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setMedicalInstitutionName('');
    setContactNumber('');
    setLandlineNumber('');
    setFullAddress('');
    setProofFile(null);
  };
  
  const handleProofUpload = (e) => {
    setProofFile(e.target.files[0]);
  };

  const onSubmitHandler = async(event) => {
      event.preventDefault();

      setLoading(true);

      try {
        if (currentState === "Create Account") {
          // CREATE ACCOUNT
          const formData = new FormData();
          formData.append('user_name', user_name);
          formData.append('email', email);
          formData.append('password', password);
          formData.append('medicalInstitutionName', medicalInstitutionName);
          formData.append('contactNumber', contactNumber);
          formData.append('landlineNumber', landlineNumber);
          formData.append('fullAddress', fullAddress);
          if (proofFile) formData.append('proofFile', proofFile);

          const response = await axios.post(
            backendUrl + "/api/user/register",
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          if (response.data.success) {
            setEmailAccountCreate(email);
            toast.success(response.data.message, {...toastSuccess});
            navigate('/account-verification')
          } else {
            toast.error(response.data.message, {...toastError});
          }
        } else {
          // LOGIN ACCOUNT
          const response = await axios.post(backendUrl + "/api/user/login", {email, password})
          if (response.data.success) {
            window.location.reload()
            setToken(response.data.token);
            localStorage.setItem('token', response.data.token);
            toast.success(response.data.message, {...toastSuccess});
          } else {
            toast.error(response.data.message, {...toastError});
          }

        }
      } catch (error) {
        console.log(error);
        toast.error(error.message, {...toastError});
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  const handleStateSwitch = (newState) => {
    setCurrentState(newState);
    resetForm();  // Clear the form fields when switching states
  };

  const togglePassword = () => {
    setPasswordType((prevPasswordType) => 
      prevPasswordType === 'password' ? 'text' : 'password'
    );
  };

  //  for file upload
  const UploadModal = () => (
    <div className="upload-modal-bg">
      <div className="upload-modal-card">
        <div className="upload-modal-header">Upload Proof of Legitimacy</div>
        <label htmlFor="proofFileInput" className="upload-modal-dashed">
          <FaCloudUploadAlt size={36} color="#43A047" style={{marginBottom: 8}} />
          <span className="upload-modal-text">Select one image file to upload</span>
          <input
            id="proofFileInput"
            type="file"
            accept="image/*,application/pdf"
            style={{display: 'none'}}
            onChange={handleProofUpload}
          />
          {proofFile && <span className="proof-file-name">{proofFile.name}</span>}
        </label>
        <div>
          <label className="upload-modal-dropdown-label">Uploaded Proof Type</label>
          <select
            value={uploadedProofType}
            onChange={e => setUploadedProofType(e.target.value)}
            className="upload-modal-dropdown"
          >
            <option value="">Select type</option>
            <option value="Business Permit">Business Permit</option>
            <option value="DOH License">DOH License</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="upload-modal-btns">
          <button
            type="button"
            className="upload-modal-cancel"
            onClick={() => setShowUploadModal(false)}
          >Cancel</button>
          <button
            type="button"
            className="upload-modal-confirm"
            onClick={() => setShowUploadModal(false)}
            disabled={!proofFile || !uploadedProofType}
          >Confirm &amp; Submit</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] upthis'>
      {showUploadModal && <UploadModal />}
      <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] m-auto gap-4 text-gray-800 formsize'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10 '>
          <p className='cs-text'>{currentState}</p>
          <hr className='border-none h-[3px] w-8 ml-1 ca-color'/>
        </div>
        {currentState === "Login" ? (
          <>
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 input-account-page' placeholder='Email' required/>
            <div className={`w-full px-3 py-2 pass-tainer ${isPasswordFocused ? 'focused' : ''}`} onClick={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} tabIndex={-1}>
              <input onChange={(e)=>setPassword(e.target.value)} value={password} type={passwordType} placeholder='Password' required onBlur={() => setIsPasswordFocused(false)}/>
              <div onClick={togglePassword} className='showHidePass'>
                {passwordType === 'password' ? <IoIosEyeOff /> : <IoIosEye />}
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="medical">Medical Institution Information</h1>
            <input
              onChange={(e) => setMedicalInstitutionName(e.target.value)}
              value={medicalInstitutionName}
              type="text"
              className="w-full px-3 py-2 input-account-page"
              placeholder="Medical Institution Name"
              required
            />
            <div className="w-full flex gap-2">
              <div className="contact-prefix-container">
                <span className="contact-prefix">+63</span>
                <input
                  onChange={(e) => setContactNumber(e.target.value)}
                  value={contactNumber}
                  type="tel"
                  className="w-full px-3 py-2 input-account-page contact-input"
                  placeholder="Contact Number"
                  pattern="[0-9]{10}"
                  required
                  maxLength={10}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
              <input
                onChange={(e) => setLandlineNumber(e.target.value)}
                value={landlineNumber}
                type="tel"
                className="w-full px-3 py-2 input-account-page lnumber"
                placeholder="Landline Number (optional)"
                style={{ maxWidth: 200 }}
              />
            </div>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              className="w-full px-3 py-2 input-account-page"
              placeholder="Email Address"
              required
            />
            <input
              onChange={(e) => setFullAddress(e.target.value)}
              value={fullAddress}
              type="text"
              className="w-full px-3 py-2 input-account-page"
              placeholder="Full Address"
              required
            />
            <div className="w-full flex flex-col gap-2 mt-2">
              
              <button
                type="button"
                className="upload-btn"
                onClick={() => setShowUploadModal(true)}
              >
                <FaCloudUploadAlt size={24} />
                <span>Upload Proof of Legitimacy</span>
              </button>
              {proofFile && (
                <span className="proof-file-name">{proofFile.name}</span>
              )}
            </div>
          </>
        )}

        <div className='w-full flex justify-between text-sm button-bottom'>
          {currentState === "Create Account" ? <div></div> : ""}
          {currentState === 'Login' && (
            <button 
              onClick={() => navigate('/forgot-password')} 
              className='ft-button'
            >
              Forgot Password?
            </button>
          )}
        </div>
        {currentState === "Create Account" ? (
          <>
            <button className='LC-button mt-2' type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Proceed to Next Step'}
            </button>
            {loading && <div className="loaderCA"></div>}
            <button type="button" onClick={() => handleStateSwitch("Login")} className='LC-button-next'>Sign in</button>
          </>
        ) : (
          <>
            <button className='LC-button' disabled>Sign In</button>
            <button type="button" onClick={() => handleStateSwitch("Create Account")} className='LC-button-next'>Create an Account</button>
          </>
        )}
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default Login
