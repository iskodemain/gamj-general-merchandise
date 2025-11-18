import Admin from "../../models/admin.js";
import Barangays from "../../models/barangays.js";
import Cities from "../../models/cities.js";
import Customer from "../../models/customer.js";
import DeliveryInfo from "../../models/deliveryInfo.js";
import Provinces from "../../models/provinces.js";



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
            // IMAGE PROOF NAME
            success: true,
            customerList
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