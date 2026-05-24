import { loginCustomerService, loginCodeVerifyService, registerCustomerService, registerCodeVerifyService, requestPasswordResetService, verifyPasswordResetService, confirmPasswordResetService, fetchVerifiedCustomerService, resendLoginCodeService, resendRegisterCodeService, resendForgotPasswordCodeService } from '../services/customerAuthService.js';


// CUSTOMER LOGIN INPUT
export const loginCustomer = async (req, res) => {
    try {
        const {identifier, password} = req.body;
        const result = await loginCustomerService(identifier, password);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// CUSTOMER LOGIN VERIFICATON CODE
export const loginCodeVerify = async (req, res) => {
    try {
        const {loginToken, code} = req.body;
        const result = await loginCodeVerifyService(loginToken, code);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// FETCH VERIFIED CUSTOMER
export const fetchVerifiedCustomer = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchVerifiedCustomerService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// CUSTOMER REGISTRATION INPUT
export const registerCustomer = async (req, res) => {
    try {
        const imageProof = req.file;
        const {medicalInstitutionName, contactNumber, landlineNumber, emailAddress, fullAddress, proofType, repFirstName, repLastName, repContactNumber, repEmailAddress, repJobPosition, loginPhoneNum, loginEmail, loginPassword} = req.body;
        const result = await registerCustomerService(medicalInstitutionName, contactNumber, landlineNumber, emailAddress, fullAddress, proofType, imageProof, repFirstName, repLastName, repContactNumber, repEmailAddress, repJobPosition, loginPhoneNum, loginEmail, loginPassword);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// CUSTOMER REGISTRATION VERIFICATON CODE
export const registerCodeVerify = async (req, res) => {
    try {
        const {registerKey, code} = req.body;
        const result = await registerCodeVerifyService(registerKey, code);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// REQUEST CUSTOMER PASSWORD RESET
export const requestPasswordResetCustomer = async (req, res) => {
    try {
        const {identifier} = req.body;
        const result = await requestPasswordResetService(identifier);
        res.json(result);

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// VERIFY CUSTOMER PASSWORD RESET
export const verifyPasswordResetCustomer = async (req, res) => {
    try {
        const {identifier, code} = req.body;
        const result = await verifyPasswordResetService(identifier, code);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// CONFIRM CUSTOMER PASSWORD RESET
export const confirmPasswordResetCustomer = async (req, res) => {
    try {
        const {identifier, resetPasswordToken, newPassword} = req.body;
        const result = await confirmPasswordResetService(identifier, resetPasswordToken, newPassword);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// RESEND CUSTOMER LOGIN OTP
export const resendLoginCode = async (req, res) => {
    try {
        const { loginToken } = req.body;
        const result = await resendLoginCodeService(loginToken);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// RESEND CUSTOMER SIGNUP OTP
export const resendRegisterCode = async (req, res) => {
    try {
        const { registerKey } = req.body;
        const result = await resendRegisterCodeService(registerKey);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// RESEND CUSTOMER FORGOT PASSWORD OTP
export const resendForgotPasswordCode = async (req, res) => {
    try {
        const { identifier } = req.body;
        const result = await resendForgotPasswordCodeService(identifier);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
