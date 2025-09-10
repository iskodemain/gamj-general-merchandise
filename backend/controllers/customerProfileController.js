import { fetchCustomerEditProfileService, updateCustomerEditProfileService, fetchCustomerDeliveryInfoService, updateCustomerDeliveryInfoService, fetchCustomerAccountSecurityService, updateCustomerAccountSecurityService, verifyCustomerAccountSecurityService, deleteCustomerAccountService } from '../services/customerProfileService.js'


export const fetchCustomerEditProfile = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchCustomerEditProfileService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const updateCustomerEditProfile = async (req, res) => {
    try {
        const { ID } = req.user;
        const imageProof = req.files?.imageProof?.[0];
        const profileImage = req.files?.profileImage?.[0];
        const {medicalInstitutionName, contactNumber, landlineNumber, emailAddress, fullAddress, proofType, repFirstName, repLastName, repContactNumber, repEmailAddress, repJobPosition} = req.body;

        const result = await updateCustomerEditProfileService(ID, medicalInstitutionName, contactNumber, landlineNumber, emailAddress, fullAddress, proofType, imageProof, profileImage, repFirstName, repLastName, repContactNumber, repEmailAddress, repJobPosition);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchCustomerDeliveryInfo = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchCustomerDeliveryInfoService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const updateCustomerDeliveryInfo = async (req, res) => {
    try {
        const { ID } = req.user;
        const {medicalInstitutionName, emailAddress, provinceId, cityId, detailedAddress, zipCode, barangayId, contactNumber} = req.body;

        const result = await updateCustomerDeliveryInfoService(ID, medicalInstitutionName, emailAddress, provinceId, cityId, detailedAddress, zipCode, barangayId, contactNumber);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchCustomerAccountSecurity = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchCustomerAccountSecurityService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const verifyCustomerAccountSecurity = async (req, res) => {
    try {
        const { ID } = req.user;
        const { currentPassword } = req.body;
        const result = await verifyCustomerAccountSecurityService(ID, currentPassword);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const updateCustomerAccountSecurity = async (req, res) => {
    try {
        const { ID } = req.user;
        const { newPassword, verificationCode } = req.body;
        const result = await updateCustomerAccountSecurityService(ID, newPassword, verificationCode);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const deleteCustomerAccount = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await deleteCustomerAccountService(ID);

        return res.json(result);

    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
};






