import { fetchAllCustomerService, fetchDeliveryInfoService, fetchLocationDataService, fetchAllStaffService, fetchAllAdminService, approvedUserService } from "../../services/admin/adminUsersService.js";



export const fetchAllCustomer = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchAllCustomerService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchAllStaff = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchAllStaffService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchAllAdmin = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchAllAdminService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchDeliveryInfo = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchDeliveryInfoService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const fetchLocationData = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchLocationDataService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const approvedUser = async (req, res) => {
    try {
        const {userID, userType} = req.body;
        const { ID } = req.admin;
        const result = await approvedUserService(ID, userID, userType);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}