import Provinces from '../models/provinces.js';
import Cities from '../models/cities.js';
import Barangays from '../models/barangays.js';
import Customer from '../models/customer.js';
import ShippingRate from '../models/shippingRate.js';

export const fetchShippingRatesService = async (customerID) => {
    try {
        const customerUser = await Customer.findByPk(customerID);
        if (!customerUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const shippingRates = await ShippingRate.findAll({});
        if (!shippingRates.length) {
            return {
                success: true,
                shippingRates: []
            }
        }

        return {
            success: true,
            shippingRates
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


export const getLocationDataService = async () => {
    try {
        const provinces = await Provinces.findAll({});
        if (!provinces.length) {
            return {
                success: false,
                message: 'No provinces found.'
            }
        }

        const cities = await Cities.findAll({});
        if (!cities.length) {
            return {
                success: false,
                message: 'No cities found.'
            }
        }

        const barangays = await Barangays.findAll({});
        if (!barangays.length) {
            return {
                success: false,
                message: 'No barangays found.'
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