import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import {v2 as cloudinary} from 'cloudinary';
import Customer from '../models/customer.js';
import { createCustomerToken, generateLoginToken, generatePasswordResetToken } from '../utils/token.js';
import { generateVerificationCode } from '../utils/codeGenerator.js';
import { sendMail } from '../utils/mailer.js';
import { validateEmail, validatePhone, validatePassword } from '../validators/userValidator.js';
import { loginEmailTemplate, registrationEmailTemplate, resetPasswordEmailTemplate } from '../utils/emailTemplates.js';

// 🔹 ID GENERATOR
const withTimestamp = (prefix, number) => {
  return `${prefix}-${number.toString().padStart(5, "0")}-${Date.now()}`;
};
 
// CUSTOMER REGISTRATION INPUT
let tempUserData = {};
export const registerCustomerService = async (medicalInstitutionName, contactNumber, landlineNumber, emailAddress, fullAddress, proofType, imageProof, repFirstName, repLastName, repContactNumber, repEmailAddress, repJobPosition, loginPhoneNum, loginEmail, loginPassword) => {
    try {
        if (!medicalInstitutionName || !contactNumber || !emailAddress || !proofType || !fullAddress || !repFirstName || !repLastName || !repContactNumber || !repEmailAddress || !repJobPosition) {
            return { 
                success: false, 
                message: "Please complete all fields in the account details to proceed with account creation." 
            };
        }

        const hasEmail = Boolean(loginEmail);
        const hasPhone = Boolean(loginPhoneNum);
        const passwordError = validatePassword(loginPassword);

        if (!hasEmail && !hasPhone) {
            return {
                success: false, 
                message: "Please provide either a login email or phone number." 
            };
        }

        if (hasEmail && hasPhone) {
            return { 
                success: false, 
                message: "Only one login credential allowed: email or phone number, not both." 
            };
        }

        if (hasEmail && !validateEmail(loginEmail)) {
            return { 
                success: false, 
                message: "Invalid email format." 
            };
        }

        if (hasPhone && !validatePhone(loginPhoneNum)) {
            return { 
                success: false, 
                message: "Invalid phone format." 
            };
        }

        const existingUser = await Customer.findOne({
            where: hasEmail? {loginEmail} : {loginPhoneNum}
        })

        if (existingUser) {
            return { 
                success: false, 
                message: "You're already registered! Just go to the login page to sign in."
            };
        }

        if (passwordError) {
            return { 
                success: false, 
                message: passwordError 
            };
        }

        if (!imageProof) {
            return { 
                success: false, 
                message: "Image proof is required." 
            };
        }

        // Upload to clodinary
        let cloudResult;
        try {
            cloudResult = await cloudinary.uploader.upload(imageProof.path, {
            folder: 'gamj/customerProofs',
            resource_type: 'image'
            });
        } catch (cloudError) {
            return {
                success: false,
                message: "Image upload to Cloudinary failed.",
                error: cloudError.message
            };
        }
        
        // Delete local file
        try {
            await fs.unlink(imageProof.path);
        } catch (unlinkError) {
            console.error("Failed to delete local image: ", unlinkError.message);
        }

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Registration Key
        const registerKey = hasEmail ? loginEmail : loginPhoneNum;

        tempUserData[registerKey] = {
            medicalInstitutionName, 
            contactNumber, 
            landlineNumber, 
            emailAddress, 
            fullAddress, 
            proofType,
            imageUrl: cloudResult.secure_url,
            cloudinaryId: cloudResult.public_id, 
            repFirstName, 
            repLastName, 
            repContactNumber, 
            repEmailAddress, 
            repJobPosition, 
            loginPhoneNum: hasPhone ? loginPhoneNum : null, 
            loginEmail: hasEmail ? loginEmail : null, 
            loginPassword,
            verificationCode,
            expiresAt
        }

        // Send email or phone verification code
        if (hasEmail) {
            await sendMail({
                to: loginEmail,
                subject: 'Account Verification',
                html: registrationEmailTemplate(verificationCode),
                attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
            });
        } else {
            // Phone Number Verification Code Logic Here
        }
        

        return {
            success: true,
            message: `Verification code sent to your ${hasEmail ? 'email' : 'phone'}.`,
            registerKey,
        };
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }

}

// CUSTOMER REGISTRATION VERIFICATON CODE
export const registerCodeVerifyService = async (registerKey, code) => {
    try {
        const userData = tempUserData[registerKey];
        if (!userData) {
            return { 
                success: false, 
                message: "Verification expired or not initiated. Please try again" 
            };
        }
        if (userData.verificationCode !== code) {
            return { 
                success: false, 
                message: "Invalid verification code." 
            };
        }
        if (new Date() > userData.expiresAt) {
            try {
                await cloudinary.uploader.destroy(userData.cloudinaryId);
            } catch (cloudError) {
                console.error("Cloudinary cleanup failed: ", cloudError.message);
            }
            delete tempUserData[registerKey];
            return { 
                success: false, 
                message: "Verification code expired. Please register again." 
            };
        }

        // HASH THE PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.loginPassword, salt);

        // AUTO-GENERATE CUSTOMER ID
        const lastCustomer = await Customer.findOne({
        order: [["ID", "DESC"]],
        });

        const nextCustomerNo = lastCustomer ? Number(lastCustomer.ID) + 1 : 1;
        const customerId = withTimestamp("CUST", nextCustomerNo);

        // SAVE TO DATABASE
        const newUser = await Customer.create({
            customerId,
            medicalInstitutionName: userData.medicalInstitutionName, 
            contactNumber: userData.contactNumber, 
            landlineNumber: userData.landlineNumber, 
            emailAddress: userData.emailAddress, 
            fullAddress: userData.fullAddress, 
            proofType: userData.proofType,
            imageProof: userData.imageUrl, 
            repFirstName: userData.repFirstName, 
            repLastName: userData.repLastName, 
            repContactNumber: userData.repContactNumber, 
            repEmailAddress: userData.repEmailAddress, 
            repJobPosition: userData.repJobPosition, 
            loginPhoneNum: userData.loginPhoneNum, 
            loginEmail: userData.loginEmail, 
            loginPassword: hashedPassword
        });

        // CREATE TOKEN
        const authToken = createCustomerToken(newUser.ID); // Permanent token

        // CLEAN TEMPDATA
        delete tempUserData[registerKey];

        return {
            success: true,
            message: "Account created successfully.",
            token: authToken
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

// CUSTOMER LOGIN INPUT
export const loginCustomerService = async (identifier, password) => {
    try {
        const isEmail = validateEmail(identifier);
        const isPhone = validatePhone(identifier);

        if (!isEmail && !isPhone) {
            return {success: false, message: 'Invalid email or phone format.'};
        }

        const user = await Customer.findOne({
            where: isEmail ? {loginEmail: identifier} : {loginPhoneNum: identifier}
        })

        if (!user) {
            return {success: false, message: 'Your account and/or password is incorrect, please try again'};
        }

        const isMatch = await bcrypt.compare(password, user.loginPassword);

        if (!isMatch) {
            return {success: false, message: 'Your account and/or password is incorrect, please try again'};
        }
        
        // Generate Codes
        const loginToken = generateLoginToken();
        const code = generateVerificationCode();
        const expirationTime = new Date(Date.now() + 10 * 60 * 1000); 
        await user.update({
            verificationCode: code,
            codeExpiresAt: expirationTime,
            loginToken: loginToken,
        })

        // Send email (or SMS if phone)
        if (user.loginEmail) {
            await sendMail({
            to: user.loginEmail,
            subject: 'Login Verification Code',
            html: loginEmailTemplate(user.medicalInstitutionName, code),
            attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
            });
        }

        return {
            success: true, 
            message: 'Verification code sent. Please enter the code to complete login.',
            loginToken: loginToken, // Process this to frontend local storage
        };
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

// CUSTOMER LOGIN VERIFICATON CODE
export const loginCodeVerifyService = async (loginToken, code) => {
    try {
        if (!loginToken || !code) {
            return {
                success: false,
                message: 'Verification failed. Login session or verification code may have expired. Please try logging in again.'
            }
        }

        const user = await Customer.findOne({ where: { loginToken } });
        if (!user) {
            return {
                success: false,
                message: 'Expired login session. Please log in again.'
            }
        }

        if (user.verificationCode !== code) {
            return {
                success: false,
                message: 'Invalid verification code.'
            }
        }

        if (new Date() > user.codeExpiresAt) {
            await user.update({ 
                verificationCode: null, 
                codeExpiresAt: null,
                loginToken: null,
            });
            return {
                success: false,
                message: 'Verification code expired. Please log in again.',
                codeExpired: true
            }
        }

        // Clear all after sucessfully validated
        await user.update({ 
            verificationCode: null, 
            codeExpiresAt: null, 
            loginToken: null 
        });

        // Create token
        const authToken = createCustomerToken(user.ID);

        return {
            success: true,
            message: 'Login successfully!',
            token: authToken, // Eto na yung permanent token for headers
            verifiedCustomer: user.verifiedCustomer
        };
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

// FETCH VERIFIED CUSTOMER
export const fetchVerifiedCustomerService = async (ID) => {
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


// REQUEST CUSTOMER PASSWORD RESET
export const requestPasswordResetService = async (identifier) => {
    try {
        const isEmail = validateEmail(identifier);

        const user = await Customer.findOne({
            where: isEmail ? {loginEmail: identifier} : {loginPhoneNum: identifier}
        });

        if (!user) {
            return {
                success: false,
                message: 'Please try again with another phone or email.'
            }
        }

        const code = generateVerificationCode();
        const expirationTime = new Date(Date.now() + 30 * 60 * 1000); 

        // Send email verification code
        if (isEmail) {
            await sendMail({
                to: identifier,
                subject: 'Reset Password Verification',
                html: resetPasswordEmailTemplate(user.medicalInstitutionName, code),
                attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
            });
        } else {
            // Send phone verification Code
        }

        // Update User Data
        await user.update({
            verificationCode: code,
            codeExpiresAt: expirationTime
        })

        // SUCCESSFULLY SENT
        return { 
            success: true, 
            message: `A verification code has been sent to your ${isEmail ? 'email address' : 'phone number'}. Please check your inbox.`,
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

// VERIFY CUSTOMER PASSWORD RESET
export const verifyPasswordResetService = async (identifier, code) => {
    try {
        const isEmail = validateEmail(identifier);

        const user = await Customer.findOne({
            where: isEmail ? {loginEmail: identifier} : {loginPhoneNum: identifier}
        });

        if (!user) {
            return {
                success: false,
                message: 'We could not find an account associated with the provided details.',
                emptyUser: true
            }
        }

        if (user.verificationCode !== code) {
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

        const resetPasswordToken = generatePasswordResetToken();

        await user.update({
            resetPasswordToken
        });

        return { 
            success: true, 
            message: 'Code verified successfully!',
            resetPasswordToken 
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

// CONFIRM CUSTOMER PASSWORD RESET
export const confirmPasswordResetService = async (identifier, resetPasswordToken, newPassword) => {
    try {
        const isEmail = validateEmail(identifier);
        const passwordError = validatePassword(newPassword);

        const user = await Customer.findOne({
            where: isEmail ? {loginEmail: identifier} : {loginPhoneNum: identifier}
        });

        if (!user) {
            return {
                success: false,
                message: 'We could not find an account associated with the provided details.',
                emptyUser: true
            }
        }

        if (!resetPasswordToken) {
            await user.update({ 
                verificationCode: null,
                codeExpiresAt: null,
                resetPasswordToken: null
            });
            return {
                success: false,
                message: 'Forgot password session has expired. Please restart the process.',
                emptyResetToken: true
            }
        }

        if (user.resetPasswordToken !== resetPasswordToken) {
            await user.update({ 
                verificationCode: null,
                codeExpiresAt: null,
                resetPasswordToken: null
            });
            return {
                success: false,
                message: 'Forgot password session has expired. Please restart the process.',
                differentResetToken: true
            }
        }

        if (new Date() > user.codeExpiresAt) {
            await user.update({ 
                verificationCode: null,
                codeExpiresAt: null,
                resetPasswordToken: null
            });
            return { 
                success: false,
                message: 'Verification code has expired. Please request a new one.',
                codeExpired: true
            };
        }

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
            codeExpiresAt: null,
            resetPasswordToken: null
        })

        return { 
            success: true, 
            message: 'Password updated successfully!' 
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


