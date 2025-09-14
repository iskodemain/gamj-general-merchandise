import fs from 'fs/promises';
import bcrypt from 'bcrypt';
import {v2 as cloudinary} from 'cloudinary';
import Customer from '../models/customer.js';
import DeliveryInfo from '../models/deliveryInfo.js';
import { validateEmail, validatePhone } from '../validators/userValidator.js';
import { sendMail } from '../utils/mailer.js';
import { Op } from 'sequelize';
import { generateVerificationCode } from '../utils/codeGenerator.js';
import { resetPasswordEmailTemplate } from '../utils/emailTemplates.js';
import { validatePassword } from '../validators/userValidator.js';

const extractCloudinaryPublicId = (url, folder) => {
    const filenameWithExt = url.split('/').pop();
    const filename = filenameWithExt.split('.')[0];
    return `${folder}/${filename}`;
};

export const fetchCustomerEditProfileService = async (ID) => {
    try {
        const user = await Customer.findByPk(ID);
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            }
        }
        
        return {
            // IMAGE PROOF NAME
            success: true,
            user
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const updateCustomerEditProfileService = async (ID, medicalInstitutionName, contactNumber, landlineNumber, emailAddress, fullAddress, proofType, imageProof, profileImage, repFirstName, repLastName, repContactNumber, repEmailAddress, repJobPosition) => {
    try {
        const user = await Customer.findByPk(ID);
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        if (!user.imageProof && !imageProof) {
            return {
                success: false,
                message: 'Proof of legitimacy is required.'
            };
        }

        // EMAIL ADDRESS
        const conflictingEmail = await Customer.findOne({
            where: {
            ID: { [Op.ne]: ID },
            [Op.or]: [
                { emailAddress: emailAddress },
                { repEmailAddress: emailAddress },
                { loginEmail: emailAddress },
            ]
            }
        });
        if (conflictingEmail) {
            return {
                success: false,
                message: 'Email address is already used. Please try again',
            };
        }

        // REP EMAIL ADDRESS
        const conflictingRepEmail = await Customer.findOne({
            where: {
            ID: { [Op.ne]: ID },
            [Op.or]: [
                { emailAddress: repEmailAddress },
                { repEmailAddress: repEmailAddress },
                { loginEmail: repEmailAddress },
            ]
            }
        });
        if (conflictingRepEmail) {
            return {
            success: false,
            message: 'Representative email is already used. Please try again',
            };
        }


        // CONTACT NUMBER
        const conflictingContact = await Customer.findOne({
            where: {
            ID: { [Op.ne]: ID },
            [Op.or]: [
                { contactNumber: contactNumber },
                { repContactNumber: contactNumber },
                { loginPhoneNum: contactNumber },
            ]
            }
        });
        if (conflictingContact) {
            return {
            success: false,
            message: 'Contact number is already used. Please try again.',
            };
        }

        // REP CONTACT NUMBER
        const conflictingRepContact = await Customer.findOne({
            where: {
            ID: { [Op.ne]: ID },
            [Op.or]: [
                { contactNumber: repContactNumber },
                { repContactNumber: repContactNumber },
                { loginPhoneNum: repContactNumber },
            ]
            }
        });
        if (conflictingRepContact) {
            return {
            success: false,
            message: 'Representative contact number is already used. Please try again',
            };
        }


        if (emailAddress && emailAddress !== user.emailAddress) {
            if (!validateEmail(emailAddress)) {
                return { 
                    success: false, 
                    message: 'Invalid email format.' 
                };
            }
        }

        if (contactNumber && contactNumber !== user.contactNumber) {
            if (!validatePhone(contactNumber)) {
                return { success: false, message: 'Invalid contact number format.' };
            }
        }

        if (landlineNumber !== undefined) {
            user.landlineNumber = landlineNumber === '' ? null : landlineNumber;
        }

        if (imageProof) {
            const result = await cloudinary.uploader.upload(imageProof.path, {
                folder: 'gamj/customerProofs',
            });

            if (user.imageProof && user.imageProof.includes('res.cloudinary.com')) {
                const publicId = extractCloudinaryPublicId(user.imageProof, 'gamj/customerProofs');
                await cloudinary.uploader.destroy(publicId);
            }

            user.imageProof = result.secure_url;
            await fs.unlink(imageProof.path);
        }

        if (profileImage) {
            const result = await cloudinary.uploader.upload(profileImage.path, {
                folder: 'gamj/customerProfile',
            });

            if (
                user.profileImage && 
                user.profileImage.includes('res.cloudinary.com') && 
                !user.profileImage.includes('profile_icon_unzxy8.png')
            ) {
                const publicId = extractCloudinaryPublicId(user.profileImage, 'gamj/customerProfile');
                await cloudinary.uploader.destroy(publicId);
            }

            user.profileImage = result.secure_url;
            await fs.unlink(profileImage.path);
        }


        if (repContactNumber && repContactNumber !== user.repContactNumber) {
            if (!validatePhone(repContactNumber)) {
                return { success: false, message: 'Invalid representative contact number format.' };
            }
        }

        if (repEmailAddress && repEmailAddress !== user.repEmailAddress) {
            if (!validateEmail(repEmailAddress)) {
                return { success: false, message: 'Invalid representative email format.' };
            }
        }

        user.medicalInstitutionName = medicalInstitutionName || user.medicalInstitutionName;
        user.contactNumber = contactNumber || user.contactNumber;
        user.emailAddress = emailAddress || user.emailAddress;
        user.fullAddress = fullAddress || user.fullAddress;
        user.proofType = proofType || user.proofType;

        user.repFirstName = repFirstName || user.repFirstName;
        user.repLastName = repLastName || user.repLastName;
        user.repContactNumber = repContactNumber || user.repContactNumber;
        user.repEmailAddress = repEmailAddress || user.repEmailAddress;
        user.repJobPosition = repJobPosition || user.repJobPosition;

        user.updateAt = new Date();

        await user.save();

        return {
            success: true,
            message: 'Profile updated successfully.',
            data: {
                medicalInstitutionName: user.medicalInstitutionName,
                contactNumber: user.contactNumber,
                landlineNumber: user.landlineNumber,
                emailAddress: user.emailAddress,
                fullAddress: user.fullAddress,
                proofType: user.proofType,
                imageProof: user.imageProof,
                profileImage: user.profileImage,
                repFirstName: user.repFirstName,
                repLastName: user.repLastName,
                repContactNumber: user.repContactNumber,
                repEmailAddress: user.repEmailAddress,
                repJobPosition: user.repJobPosition,
                updateAt: user.updateAt
            }
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchCustomerDeliveryInfoService = async (customerId) => {
    try {
        const user = await DeliveryInfo.findOne({
            where: { customerId }
        });

        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        return {
            success: true,
            user
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const updateCustomerDeliveryInfoService = async (customerId, medicalInstitutionName, emailAddress, provinceId, cityId, detailedAddress, zipCode, barangayId, contactNumber) => {
    try {

        const currentCustomer = await Customer.findByPk(customerId);
        if (!currentCustomer) {
            return { success: false, message: "Customer not found." };
        }

        const customerConflictingEmail = await Customer.findOne({
            where: {
               ID: {[Op.ne]: currentCustomer.ID},
               [Op.or]: [
                { emailAddress },
                { repEmailAddress: emailAddress },
                { loginEmail: emailAddress },
               ],
            },
        });

        const deliveryConflictingEmail = await DeliveryInfo.findOne({
            where: {
            customerId: { [Op.ne]: currentCustomer.ID },
                emailAddress
            }
        });

        if (customerConflictingEmail || deliveryConflictingEmail) {
            return {
                success: false,
                message: 'Email address is already used. Please try again',
            };
        }

        const customerConflictingContact = await Customer.findOne({
            where: {
                ID: { [Op.ne]: currentCustomer.ID },
                [Op.or]: [
                { contactNumber },
                { repContactNumber: contactNumber },
                { loginPhoneNum: contactNumber },
                ],
            },
        });

        const deliveryConflictingContact = await DeliveryInfo.findOne({
            where: {
                customerId: { [Op.ne]: currentCustomer.ID },
                contactNumber,
            },
        });
        if (customerConflictingContact || deliveryConflictingContact) {
            return {
            success: false,
            message: 'Contact number is already used. Please try again.',
            };
        }


        if (emailAddress && !validateEmail(emailAddress)) {
            return { success: false, message: "Invalid email format." };
        }

        if (contactNumber && !validatePhone(contactNumber)) {
            return { success: false, message: "Invalid contact number format." };
        }

        let user = await DeliveryInfo.findOne({
            where: { customerId }
        });

        if (!user) {
            user = await DeliveryInfo.create({
                customerId,                       
                medicalInstitutionName,
                emailAddress,
                provinceId,
                cityId,
                detailedAddress,
                zipCode,
                barangayId,
                contactNumber,
                updateAt: new Date(),
            }, {
                fields: [
                    'customerId',
                    'medicalInstitutionName',
                    'emailAddress',
                    'provinceId',
                    'cityId',
                    'detailedAddress',
                    'zipCode',
                    'barangayId',
                    'contactNumber',
                    'updateAt'
                ]
            });

            return {
                success: true,
                message: "Delivery info created successfully.",
                data: user,
            };
        }

        user.medicalInstitutionName = medicalInstitutionName || user.medicalInstitutionName;
        user.emailAddress = emailAddress || user.emailAddress;
        user.provinceId = provinceId || user.provinceId;
        user.cityId = cityId || user.cityId;
        user.detailedAddress = detailedAddress || user.detailedAddress;
        user.zipCode = zipCode || user.zipCode;
        user.barangayId = barangayId || user.barangayId;
        user.contactNumber = contactNumber || user.contactNumber;
        user.updateAt = new Date();

        await user.save();

        return {
            success: true,
            message: 'Delivery info updated successfully.',
            data: user
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
} 

export const fetchCustomerAccountSecurityService = async (ID) => {
    try {
        const user = await Customer.findByPk(ID);
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const identifier = user.loginEmail || user.loginPhoneNum
        const password = user.loginPassword
        
        return {
            success: true,
            identifier,
            password
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const verifyCustomerAccountSecurityService = async (customerId, currentPassword) => {
    try {

        const user = await Customer.findByPk(customerId);
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        // Compare old password
        const isMatch = await bcrypt.compare(currentPassword, user.loginPassword);
        if (!isMatch) {
            return { success: false, message: "Current password is incorrect" };
        }

        const code = generateVerificationCode();
        const expirationTime = new Date(Date.now() + 30 * 60 * 1000); 

        // Send email verification code
        if (user.loginEmail) {
            await sendMail({
                to: user.loginEmail,
                subject: 'Reset Password Verification',
                html: resetPasswordEmailTemplate(user.medicalInstitutionName, code),
                attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
            });
        } 
        
        // Send phone verification Code
        if (user.loginPhoneNum) {
            
        } 

        // Update User Data
        await user.update({
            verificationCode: code,
            codeExpiresAt: expirationTime
        })

        // SUCCESSFULLY SENT
        return { 
            success: true, 
            message: `A verification code has been sent to your ${user.loginEmail ? 'email address' : 'phone number'}. Please check your inbox.`,
        };
    
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const updateCustomerAccountSecurityService = async (customerId, newPassword, verificationCode) => {
    try {
        
        const user = await Customer.findByPk(customerId);
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        if (user.verificationCode !== verificationCode) {
            return {
                success: false,
                message: 'Invalid verification code.'
            };
        }

        if (new Date() > user.codeExpiresAt) {
            await user.update({ 
                verificationCode: null,
                codeExpiresAt: null
            });
            return { 
                success: false,
                message: 'Verification code has expired. Please request a new one.',
                codeExpired: true
            };
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            return { 
                success: false,
                message: passwordError
            };
        }

        // HASHING NEW PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({
            loginPassword: hashedPassword,
            verificationCode: null,
            codeExpiresAt: null
        });

        return { success: true, message: "Password updated successfully" };
    
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


export const deleteCustomerAccountService = async (customerId) => {
    try {
        // Find user
        const user = await Customer.findByPk(customerId);
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // Delete user
        await user.destroy();

        return {
            success: true,
            message: 'Account deleted successfully. You will be logged out.'
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};


