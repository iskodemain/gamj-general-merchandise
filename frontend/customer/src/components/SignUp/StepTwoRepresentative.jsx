import React, { useContext, useState } from 'react'
import './StepTwoRepresentative.css'
import Infos from '../Infos.jsx'
import Footer from '../Footer.jsx'
import { ShopContext } from '../../context/ShopContext.jsx'
import { toast } from 'react-toastify'

const StepTwoRepresentative = () => {
  const {toastSuccess, toastError, signUpStep, setSignUpStep, signUpData, setSignUpData} = useContext(ShopContext);

  const [repFirstName, setRepFirstName] = useState(signUpData.repFirstName || '');
  const [repLastName, setRepLastName] = useState(signUpData.repLastName || '');
  const [repContactNumber, setRepContactNumber] = useState(signUpData.repContactNumber || '');
  const [repEmailAddress, setRepEmailAddress] = useState(signUpData.repEmailAddress || '');
  const [repJobPosition, setRepJobPosition] = useState(signUpData.repJobPosition || '');

  const isStepTwoComplete = repFirstName && repLastName && repContactNumber && repEmailAddress && repJobPosition;

  const handleStepTwoSubmit = (e) => {
    e.preventDefault();

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

    setSignUpData(prev => ({
      ...prev,
      repFirstName,
      repLastName,
      repContactNumber,
      repEmailAddress,
      repJobPosition
    }));

    toast.success("Representative information recorded. Keep going.", { ...toastSuccess });

    setSignUpStep(3);
  };

  const handleBackBtn = () => {
    setSignUpStep(1);
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

    setRepContactNumber(value);
  };

  return (
    <div className='sp2-main'>
      <form className='sp2-form' onSubmit={handleStepTwoSubmit}>
        <div className='sp2-progress-line'>
          <button type='button' className="stepOne sp2-line-steps"></button>
          <button type='button' className="stepTwo sp2-line-steps"></button>
          <button type='button' className="stepThree sp2-line-steps"></button>
          <button type='button' className="stepFour sp2-line-steps"></button>
        </div>
        <div className='sp2-tainer'>
          <p className='sp2-text'>Account Details</p>
          <p className='sp2-stepNum'>{signUpStep}/4</p>
        </div>
        <p className='sp2-ard'>Authorized Representative Details</p>
        <div className='sp1-name-tainer'>
            <div className='sp2-fn-container'>
              <input type="text" value={repFirstName} onChange={(e) => setRepFirstName(e.target.value)} className='sp2-input-info' placeholder='First Name' required/>
            </div>
            <div className='sp2-ln-container'>
              <input type="text" value={repLastName} onChange={(e) => setRepLastName(e.target.value)} className='sp2-input-info' placeholder='Last Name' required/>
            </div>
        </div>

        <div className='sp2-number-tainer'>
          <div className='sp2-cpx-container'>
            <p className='sp2-ct-prefix'>+63</p> 
            <input type="text" onChange={handleContactNumber} className='sp2-input-info' placeholder='Contact Number' value={repContactNumber} required/>
          </div>
          <div className='sp2-lp-container'>
            <input type="email" value={repEmailAddress} onChange={(e) => setRepEmailAddress(e.target.value)} className='sp2-input-info' placeholder='Work Email Address' required/>
          </div>
        </div>
        <input type="text" value={repJobPosition} onChange={(e) => setRepJobPosition(e.target.value)} className='sp2-input-info' placeholder='Job Position/Designation (e.g. manager, assistant manager)' required/>

        <button className='sp2-LC-button' type="submit" disabled={!isStepTwoComplete}>Proceed to the Next Step</button>
        <button type="button" onClick={handleBackBtn} className='sp2-LC-button-next'>Back</button>
      </form>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default StepTwoRepresentative

