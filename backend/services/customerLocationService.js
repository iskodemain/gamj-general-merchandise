import Provinces from '../models/provinces.js';
import Cities from '../models/cities.js';
import Barangays from '../models/barangays.js';

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