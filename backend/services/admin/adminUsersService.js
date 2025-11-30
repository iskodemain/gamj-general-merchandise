import bcrypt from 'bcrypt';
import Admin from "../../models/admin.js";
import Barangays from "../../models/barangays.js";
import Cities from "../../models/cities.js";
import Customer from "../../models/customer.js";
import DeliveryInfo from "../../models/deliveryInfo.js";
import Provinces from "../../models/provinces.js";
import Staff from "../../models/staff.js"
import { accountSendMail } from '../../utils/mailer.js'; 
import { userAccountApprovalTemplate, userAccountRejectedTemplate, userAccountCreatedTemplate } from '../../utils/emailTemplates.js';
import Notifications from "../../models/notifications.js";
import { validateEmail, validatePhone, validatePassword } from '../../validators/userValidator.js';




export const fetchAllCustomerService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const customerList = await Customer.findAll({});
            if (customerList.length === 0) {
                return {
                    success: true,
                    customerList: [],
                };
            }
        
        return {
            success: true,
            customerList
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
} 

export const fetchAllStaffService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const staffList = await Staff.findAll({});
            if (staffList.length === 0) {
                return {
                    success: true,
                    staffList: [],
                };
            }
        
        return {
            success: true,
            staffList
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
} 


export const fetchAllAdminService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const adminList = await Admin.findAll({});
            if (adminList.length === 0) {
                return {
                    success: true,
                    adminList: [],
                };
            }
        
        return {
            success: true,
            adminList
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
} 


export const fetchDeliveryInfoService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const deliveryInfoList = await DeliveryInfo.findAll({})

        if (!deliveryInfoList) {
            if (deliveryInfoList.length === 0) {
                return {
                    success: true,
                    deliveryInfoList: [],
                };
            }
        }

        return {
            success: true,
            deliveryInfoList
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


export const fetchLocationDataService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const provinces = await Provinces.findAll({});
        if (!provinces.length) {
            return {
                success: true,
                provinces: []
            }
        }

        const cities = await Cities.findAll({});
        if (!cities.length) {
            return {
                success: true,
                cities: []
            }
        }

        const barangays = await Barangays.findAll({});
        if (!barangays.length) {
            return {
                success: true,
                barangays: []
            }
        }

        return {
            success: true,
            provinces,
            cities,
            barangays
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const approvedUserService = async (adminId, userID, userType) => {
  try {
    // Verify admin exists
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    let updated = null;

    // CUSTOMER
    if (userType === "Customer") {
      const customer = await Customer.findByPk(userID);
      if (!customer) {
        return {
          success: false,
          message: "Customer not found",
        };
      }
      customer.verifiedCustomer = true;
      customer.rejectedCustomer = false;
      await customer.save();

      updated = customer;

      await Notifications.create({
        senderId: adminUser.ID,
        receiverId: customer.ID,               
        receiverType: "Customer",            
        senderType: "Admin",
        notificationType: "Account",
        title: "Congratulations!",
        message: "Your account has been approved.",
        isRead: false,
        createAt: new Date()
        }, {
        fields: [ 
            "senderId", 
            "receiverId",
            "receiverType", 
            "senderType", 
            "notificationType", 
            "title", 
            "message", 
            "isRead", 
            "createAt"
        ]
      });

      await accountSendMail({
        to: customer.loginEmail || customer.repEmailAddress,
        subject: 'Your GAMJ Account Has Been Approved',
        html: userAccountApprovalTemplate(customer.medicalInstitutionName),
        attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
      });
    }

    // INVALID TYPE
    else {
      return {
        success: false,
        message: "Invalid user type",
      };
    }

    return {
      success: true,
      message: "User successfully approved",
      updated,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const rejectUserService = async (adminId, userID, userType, rejectTitle, rejectMessage) => {
  try {
    // Verify admin exists
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    let updated = null;

    // CUSTOMER
    if (userType === "Customer") {
      const customer = await Customer.findByPk(userID);
      if (!customer) {
        return {
          success: false,
          message: "Customer not found",
        };
      }
      customer.verifiedCustomer = false;
      customer.rejectedCustomer = true;

      await customer.save();

      updated = customer;

      await Notifications.create({
        senderId: adminUser.ID,
        receiverId: customer.ID,               
        receiverType: "Customer",            
        senderType: "Admin",
        notificationType: "Account",
        title: "Your Account Has Been Rejected!",
        message: `${rejectTitle} - ${rejectMessage}`,
        isRead: false,
        createAt: new Date()
        }, {
        fields: [ 
            "senderId", 
            "receiverId",
            "receiverType", 
            "senderType", 
            "notificationType", 
            "title", 
            "message", 
            "isRead", 
            "createAt"
        ]
      });

      await accountSendMail({
        to: customer.loginEmail || customer.repEmailAddress || customer.emailAddress,
        subject: 'Your GAMJ Account Has Been Rejected',
        html: userAccountRejectedTemplate(customer.medicalInstitutionName, rejectTitle, rejectMessage),
        attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
      });
    }

    // INVALID TYPE
    else {
      return {
        success: false,
        message: "Invalid user type",
      };
    }

    return {
      success: true,
      message: "User has been rejected successfully",
      updated,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const deleteUserService = async (adminId, userID, userType) => {
  try {
    // Verify admin exists
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    let userToDelete = null;

    // DELETE CUSTOMER
    if (userType === "Customer") {
      userToDelete = await Customer.findByPk(userID);

      if (!userToDelete) {
        return {
          success: false,
          message: "Customer not found",
        };
      }
      await userToDelete.update({ forceLogout: true });
      await userToDelete.destroy();
    }

    // DELETE STAFF
    else if (userType === "Staff") {
      userToDelete = await Staff.findByPk(userID);

      if (!userToDelete) {
        return {
          success: false,
          message: "Staff user not found",
        };
      }
      await userToDelete.update({ forceLogout: true });
      await userToDelete.destroy();
    }

    // DELETE ADMIN
    else if (userType === "Admin") {
      userToDelete = await Admin.findByPk(userID);

      if (!userToDelete) {
        return {
          success: false,
          message: "Admin user not found",
        };
      }
      await userToDelete.update({ forceLogout: true });
      await userToDelete.destroy();
    }

    // INVALID TYPE
    else {
      return {
        success: false,
        message: "Invalid user type",
      };
    }

    return {
      success: true,
      message: `${userType} account deleted successfully.`,
      deletedUser: { ID: userID, userType }
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const saveUserInfoService = async (adminId, data) => {
  try {
    // Verify admin exists
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (!["Customer", "Staff", "Admin"].includes(data.userType)) {
      return { success: false, message: "Invalid user type." };
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

    if (data.password) {
      const passwordError = validatePassword(data.password);
      if (passwordError) {
        return {
          success: false,
          message: passwordError
        };
      }
    }

    // HASH THE PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    let updated = null;

    if (data.userType === "Customer") {
      updated = await Customer.update(
        {
          medicalInstitutionName: data.medicalInstitutionName,
          contactNumber: data.contactNumber,
          landlineNumber: data.landlineNumber,
          emailAddress: data.emailAddress,
          fullAddress: data.fullAddress,
          repFirstName: data.repFirstName,
          repLastName: data.repLastName,
          repContactNumber: data.repContactNumber,
          repEmailAddress: data.repEmailAddress,
          repJobPosition: data.repJobPosition,
          loginEmail: identifierType === "email" ? data.identifier : null,
          loginPhoneNum: identifierType === "phone" ? data.identifier : null,
          loginPassword: hashedPassword
        },
        { where: { ID: data.ID } }
      );
    }

    if (data.userType === "Staff") {
      updated = await Staff.update(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          emailAddress: identifierType === "email" ? data.identifier : null,
          phoneNumber: identifierType === "phone" ? data.identifier : null,
          password: hashedPassword
        },
        { where: { ID: data.ID } }
      );
    }

    if (data.userType === "Admin") {
      updated = await Admin.update(
        {
          userName: data.userName,
          emailAddress: identifierType === "email" ? data.identifier : null,
          phoneNumber: identifierType === "phone" ? data.identifier : null,
          password: hashedPassword
        },
        { where: { ID: data.ID } }
      );
    }

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

export const addNewUserService = async (adminId, data) => {
  try {
    // Verify admin exists
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (!["Customer", "Staff", "Admin"].includes(data.userType)) {
      return { success: false, message: "Invalid account role selected." };
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

    const existsCustomer = await Customer.findOne({
      where: {
        [identifierType === "email" ? "loginEmail" : "loginPhoneNum"]: data.identifier
      }
    });

    const existsStaff = await Staff.findOne({
      where: {
        [identifierType === "email" ? "emailAddress" : "phoneNumber"]: data.identifier
      }
    });

    const existsAdmin = await Admin.findOne({
      where: {
        [identifierType === "email" ? "emailAddress" : "phoneNumber"]: data.identifier
      }
    });

    if (existsCustomer || existsStaff || existsAdmin) {
      return {
        success: false,
        message: "This email or phone number is already used by another account."
      };
    }


    // PASSWORD VALIDATION
    if (!data.password || data.password.trim() === "") {
      return { success: false, message: "Account password is required." };
    }

    const passwordError = validatePassword(data.password);
    if (passwordError) {
      return {
        success: false,
        message: passwordError
      };  
    }

    // HASH THE PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    let addNewUser = null;

    if (data.userType === "Customer") {
      addNewUser = await Customer.create(
        {
          medicalInstitutionName: data.medicalInstitutionName,
          contactNumber: data.contactNumber,
          landlineNumber: data.landlineNumber,
          emailAddress: data.emailAddress,
          fullAddress: data.fullAddress,
          repFirstName: data.repFirstName,
          repLastName: data.repLastName,
          repContactNumber: data.repContactNumber,
          repEmailAddress: data.repEmailAddress,
          repJobPosition: data.repJobPosition,
          loginEmail: identifierType === "email" ? data.identifier : null,
          loginPhoneNum: identifierType === "phone" ? data.identifier : null,
          loginPassword: hashedPassword,
          verifiedCustomer: true
        }, {
            fields: [
            'medicalInstitutionName',
            'contactNumber',
            'landlineNumber',
            'emailAddress',
            'fullAddress',
            'repFirstName',
            'repLastName',
            'repContactNumber',
            'repEmailAddress',
            'repJobPosition',
            'loginPhoneNum',
            'loginEmail',
            'loginPassword',
            'verifiedCustomer'
          ]
        }
      );

      await accountSendMail({
        to: addNewUser.loginEmail || addNewUser.repEmailAddress || addNewUser.emailAddress,
        subject: 'Your GAMJ Account Has Been Created by Admin',
        html: userAccountCreatedTemplate(addNewUser.medicalInstitutionName),
        attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
      });
    }

    if (data.userType === "Staff") {
      addNewUser = await Staff.create(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          emailAddress: identifierType === "email" ? data.identifier : null,
          phoneNumber: identifierType === "phone" ? data.identifier : null,
          password: hashedPassword,
          verifiedStaff: true
        }, {
            fields: [
            'firstName',
            'lastName',
            'emailAddress',
            'phoneNumber',
            'password',
            'verifiedStaff'
          ]
        }
      );
      if (identifierType === "email") {
        await accountSendMail({
          to: addNewUser.emailAddress,
          subject: 'Your GAMJ Account Has Been Created by Admin',
          html: userAccountCreatedTemplate(addNewUser.firstName + " " + addNewUser.lastName),
          attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
        });
      }
    }

    if (data.userType === "Admin") {
      addNewUser = await Admin.create(
        {
          userName: data.userName,
          emailAddress: identifierType === "email" ? data.identifier : null,
          phoneNumber: identifierType === "phone" ? data.identifier : null,
          password: hashedPassword,
          verifiedAdmin: true
        }, {
            fields: [
            'userName',
            'emailAddress',
            'phoneNumber',
            'password',
            'verifiedAdmin'
          ]
        }
      );
      if (identifierType === "email") {
        await accountSendMail({
          to: addNewUser.emailAddress,
          subject: 'Your GAMJ Account Has Been Created by Admin',
          html: userAccountCreatedTemplate(addNewUser.userName),
          attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
        });
      }
    }

    return {
      success: true,
      message: "Account created successfully.",
      addNewUser,
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};
