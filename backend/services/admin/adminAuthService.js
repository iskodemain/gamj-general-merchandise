import bcrypt from 'bcrypt';
import Admin from '../../models/admin.js';
import { generateLoginToken, createAdminToken } from '../../utils/token.js';
import { generateVerificationCode } from '../../utils/codeGenerator.js';
import { sendMail } from '../../utils/mailer.js'; 
import { validateEmail, validatePhone, validatePassword } from '../../validators/userValidator.js';
import { loginEmailTemplate } from '../../utils/emailTemplates.js';
import { Op } from "sequelize";




// ADMIN LOGIN INPUT
export const loginAdminService = async (identifier, password) => {
    try {
        const isEmail = validateEmail(identifier);
        const isPhone = validatePhone(identifier);

        if (!isEmail && !isPhone) {
            return {success: false, message: 'Invalid email or phone format.'};
        }

        const admin = await Admin.findOne({
            where: isEmail ? {emailAddress: identifier} : {phoneNumber: identifier}
        })

        if (!admin) {
            return {success: false, message: 'Your account and/or password is incorrect, please try again'};
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        // const isMatch = await (password, admin.password);

        if (!isMatch) {
            return {success: false, message: 'Your account and/or password is incorrect, please try again'};
        }
        
        // Generate Codes
        const loginToken = generateLoginToken();
        const code = generateVerificationCode();
        const expirationTime = new Date(Date.now() + 10 * 60 * 1000); 
        await admin.update({
            verificationCode: code,
            codeExpiresAt: expirationTime,
            loginToken: loginToken,
        })

        // Send email (or SMS if phone)
        if (admin.emailAddress) {
            await sendMail({
                to: admin.emailAddress,
                subject: 'Login Verification Code',
                html: loginEmailTemplate(admin.userName, code),
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

// ADMIN LOGIN VERIFICATON CODE
export const loginCodeVerifyService = async (loginToken, code) => {
    try {
        if (!loginToken || !code) {
            return {
                success: false,
                message: 'Verification failed. Login session or verification code may have expired. Please try logging in again.'
            }
        }

        const admin = await Admin.findOne({ where: { loginToken } });
        if (!admin) {
            return {
                success: false,
                message: 'Expired login session. Please log in again.'
            }
        }

        if (admin.verificationCode !== code) {
            return {
                success: false,
                message: 'Invalid verification code.'
            }
        }

        if (new Date() > admin.codeExpiresAt) {
            await admin.update({ 
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
        await admin.update({ 
            verificationCode: null, 
            codeExpiresAt: null, 
            loginToken: null 
        });

        // Create token
        const adminAuthToken = createAdminToken(admin.ID);

        return {
            success: true,
            message: 'Login successfully!',
            token: adminAuthToken, // Eto na yung permanent token for headers
            admin
        };
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchAdminProfileService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }
        
        return {
            success: true,
            adminUser
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const saveAdminProfileService = async (adminId, data) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    let identifierType = "invalid";

    if (validateEmail(data.identifier)) {
      identifierType = "email";
    } else if (validatePhone(data.identifier)) { 
      identifierType = "phone";
    }

    if (identifierType === "invalid") {
      return {
        success: false,
        message: "You must provide a valid email or PH mobile number."
      };
    }

    const existsAdmin = await Admin.findOne({
      where: {
        [identifierType === "email" ? "emailAddress" : "phoneNumber"]:
          data.identifier,
        ID: { [Op.ne]: adminUser.ID } // exclude self
      }
    });

    if (existsAdmin) {
      return {
        success: false,
        message: "This email or phone number is already used by another account."
      };
    }

    // HASH THE PASSWORD
    let hashedPassword = adminUser.password;

    if (data.password && data.password.trim() !== "") {
      const passwordError = validatePassword(data.password);
      if (passwordError) {
        return { success: false, message: passwordError };
      }

      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(data.password, salt);
    }

    const updated = await Admin.update(
        {
            userName: data.userName,
            emailAddress: identifierType === "email" ? data.identifier : null,
            phoneNumber: identifierType === "phone" ? data.identifier : null,
            password: hashedPassword
        },
        { where: { ID: adminUser.ID } }
    );

    return {
      success: true,
      message: "Save Changes Successful",
      updated,
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};