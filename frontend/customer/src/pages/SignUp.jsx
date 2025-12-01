import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import StepOneInstitution from '../components/SignUp/StepOneInstitution.jsx'
import StepTwoRepresentative from '../components/SignUp/StepTwoRepresentative.jsx'
import StepThreeCreateAccount from '../components/SignUp/StepThreeCreateAccount.jsx'
import StepFourVerifyEmail from '../components/SignUp/StepFourVerifyEmail.jsx'
const SignUp = () => {
    const {signUpStep} = useContext(ShopContext)
    
  return (
    <>
      {signUpStep === 1 && <StepOneInstitution/>}
      {signUpStep === 2 && <StepTwoRepresentative/>}
      {signUpStep === 3 && <StepThreeCreateAccount/>}
      {signUpStep === 4 && <StepFourVerifyEmail/>}
    </>
  )
}

export default SignUp









