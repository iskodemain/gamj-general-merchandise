import React, { useContext, useState } from 'react'
import OurPolicy from '../OurPolicy.jsx'
import Infos from '../Infos.jsx'
import Footer from '../Footer.jsx'
import './StepOneInstitution.css'
import { FaCloudUploadAlt } from "react-icons/fa";
import { ShopContext } from '../../context/ShopContext.jsx'
import { assets } from '../../assets/assets.js'
import { toast } from 'react-toastify'
import { IoCloseOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";

const StepOneInstitution = () => {
  const {navigate, toastSuccess, toastError, signUpStep, setSignUpStep, signUpData, setSignUpData} = useContext(ShopContext);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUploadedImage, setShowUploadedImage] = useState(false);
  const [proofFileSize, setProofFileSize] = useState(null);

  const [medicalInstitutionName, setMedicalInstitutionName] = useState(signUpData.medicalInstitutionName || '');
  const [contactNum, setContactNum] = useState(signUpData.contactNumber || '');
  const [landlineNum, setLandlineCNum] = useState(signUpData.landlineNumber || '');
  const [fullAddress, setFullAddress] = useState(signUpData.fullAddress || '');
  const [emailAddress, setEmailAddress] = useState(signUpData.emailAddress || '');
  const [proofType, setProofType] = useState(signUpData.proofType || '');
  const [proofFile, setProofFile] = useState(signUpData.imageProof || null);

  const isStepOneComplete = medicalInstitutionName && contactNum && fullAddress && emailAddress && proofType && proofFile;
  

  const handleStepOneSubmit = (e) => {
    e.preventDefault();

    if (!medicalInstitutionName) {
      toast.error("Please enter the name of your medical institution.", { ...toastError });
      return;
    }

    if (!contactNum) {
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

    if (!proofFile) {
      toast.error("Uploading proof of legitimacy is required.", { ...toastError });
      return;
    }

    if (!proofType) {
      toast.error("You forgot to select a proof type.", { ...toastError });
      return;
    }

    setSignUpData(prev => ({
      ...prev,
      medicalInstitutionName,
      contactNumber: contactNum,
      landlineNumber: landlineNum,
      emailAddress,
      fullAddress,
      imageProof: proofFile,
      proofType
    }));

    toast.success("Institution details saved. Proceeding to the next step.", { ...toastSuccess });

    setSignUpStep(2);
  };

  const handleProofUpload = (e) => {
    const file = e.target.files[0];
    const allowedTypes = /jpeg|jpg|png|webp|svg|bmp|ico|tiff|heic|avif/;
    let readableSize;

    if (!file) return;

    if (e.target.files.length > 1) {
      toast.error("Please upload only one image.", {...toastError});
      setProofFile(null);
      return;
    }

    const fileType = file.type.split("/")[1].toLowerCase();
    if (!allowedTypes.test(fileType)) {
      toast.error("Invalid file type. Please upload an image.", {...toastError});
      setProofFile(null);
      return;
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.", {...toastError});
      setProofFile(null);
      return;
    }

    if (file.size < 1024 * 1024) {
      //show in KB
      readableSize = (file.size / 1024).toFixed(2) + " KB";
    } else {
      //show in MB
      readableSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    }

    setProofFileSize(readableSize);
    setProofFile(file);
  };

  const handleStateSignIn = () => {
    navigate('/login')
  };

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

    setContactNum(value);
  };

  const handleLandlineNumber = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');

    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    setLandlineCNum(value);
  };

  const handleCancelModal = () => {
    setProofFile(null);
    setShowUploadModal(false);
  }

  const handleCloseModal = () => {
    setShowUploadModal(false);
  }

  //  for view imafe file
  const ViewImage = () => {
    if (!proofFile) return null;
    const imagePreviewUrl = URL.createObjectURL(proofFile);

    return (
      <div className='view-image-bg'>
        <img src={imagePreviewUrl} alt="Uploaded Preview" className='image-preview'/>
        <div className='view-image-component'>
            <IoCloseOutline onClick={() => setShowUploadedImage(false)} className="close-preview-btn"/>
            <p className='vi-profile-name'>{proofFile.name}</p>
        </div>
        
      </div>
    );
  }

  //  for file upload
  const UploadModal = () => (
    <div className="upload-modal-bg">
      {showUploadedImage && <ViewImage/>}
      <div className='upload-modal-border'>
        <div className="upload-modal-card">
          {!proofFile && 
            <button type='button' className='um-cls-btn' onClick={handleCloseModal}>
              <IoCloseOutline/>
            </button>
          }
          <div className="upload-modal-header">
            <p className='upload-title'>Upload Proof of Legitimacy</p>
            <p className='upload-description'>Submit a clear and detailed image of your valid proof to verify your legitimacy in the medical industry</p>
          </div>
          {!proofFile && <label htmlFor="proofFileInput" className="upload-modal-dashed">
            <div className='upload-icon-bg'>
              <div className='upload-circle-bg'>
                <FaCloudUploadAlt className="upload-icon"/>
              </div>
            </div>
            <div className="select-modal-container">
              <p className='select-text-1'>Select one image file to upload</p>
              <p className='select-text-2'>Your image will remain private and used only for verification.</p>
            </div>

            <div className='select-button-bg'>
              <p className='select-files'>Select Files</p>
            </div>

            <p className='file-acceptable'>(PNG, JPG, JPEG, etc.)</p>
            <input
              id="proofFileInput"
              type="file"
              accept="image/*,application/pdf"
              style={{display: 'none'}}
              onChange={handleProofUpload}
            />
            {/* {proofFile && <span className="proof-file-name">{proofFile.name}</span>} */}
          </label>}

          {proofFile && 
            <div className='uploaded-image-modal'>
              <div className='uploaded-icon-main'>
                <div className='uploaded-icon-bg'>
                  <img src={assets.uploaded_file_icon} className='uploaded-icon' alt="" />
                </div>
              </div>
              <p className='proof-file-name'>{proofFile.name}</p>
              <p className='proof-file-size'>Size: {proofFileSize}</p>
              <div className='uploaded-button-modal'>
                <button onClick={() => setProofFile(null)} className='remove-image-btn'>Remove</button>
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
            {proofFile ? 
            (
              <button type="button" className="upload-modal-confirm" onClick={() => setShowUploadModal(false)} disabled={!proofFile || !proofType}>Confirm &amp; Submit</button>
             ) : 
             (
              <>
                <button type="button" className="upload-modal-cancel" onClick={handleCancelModal}>Cancel</button>
                <button type="button" className="upload-modal-confirm" onClick={() => setShowUploadModal(false)} disabled={!proofFile || !proofType}>Confirm &amp; Submit</button>
              </>
             )
            }
            
          </div>
        </div>
      </div>
    </div>
  );

  
  return (
    <div className='sp1-main'>
      {showUploadModal && <UploadModal />}
      <form className='sp1-form' onSubmit={handleStepOneSubmit}>
        <div className='sp1-progress-line'>
          <button type='button' className="stepOne sp1-line-steps"></button>
          <button type='button' className="stepTwo sp1-line-steps"></button>
          <button type='button' className="stepThree sp1-line-steps"></button>
          <button type='button' className="stepFour sp1-line-steps"></button>
        </div>
        <div className='sp1-tainer'>
          <p className='sp1-text'>Account Details</p>
          <p className='sp1-stepNum'>{signUpStep}/4</p>
        </div>
        <p className='sp1-mii'>Medical Institution Information</p>
        <input type="text" value={medicalInstitutionName} onChange={(e) => setMedicalInstitutionName(e.target.value)} className='sp1-input-info' placeholder='Medical Institution Name' required/>
        <div className='sp1-number-tainer'>
          <div className='cpx-container'>
            <p className='ct-prefix'>+63</p> 
            <input type="text" onChange={handleContactNumber} className='sp1-input-info' placeholder='Contact Number' value={contactNum} required/>
          </div>
          <div className='lp-container'>
            <p className='ll-prefix'>(02)</p>
            <input type="text" onChange={handleLandlineNumber} value={landlineNum} className='sp1-input-info' placeholder='Landline Number (optional)'/>
          </div>
        </div>
        <input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} className='sp1-input-info' placeholder='Official Email Address (e.g. sample@domain.com)' required/>

        <input type="text" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} className='sp1-input-info' placeholder='Official Full Address (e.g. 1234 Medical Ave., Quezon City, PH 1100)' required/>

        <div className="proof-container">
          {!proofFile && 
            <button type="button" className="upload-btn" onClick={() => setShowUploadModal(true)}> 
              <FaCloudUploadAlt className='upload-btn-icon'/>
              <span className="upload-btn-text">Upload Proof of Legitimacy</span>
            </button>
          }
          {proofFile && 
            <button type="button" className="uploaded-btn" onClick={() => setShowUploadModal(true)}> 
              <IoEyeOutline className='uploaded-btn-icon'/>
              <span className="uploaded-btn-text">Preview Uploaded Image</span>
            </button>
          }
        </div>
        <button className='sp1-LC-button' type="submit" disabled={!isStepOneComplete}>Proceed to the Next Step</button>
        <button type="button" onClick={handleStateSignIn} className='sp1-LC-button-next' >Already have an account?</button>
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default StepOneInstitution
