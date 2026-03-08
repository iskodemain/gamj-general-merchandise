import { getLocationDataService, fetchShippingRatesService } from '../services/customerLocationService.js'

export const fetchShippingRates = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchShippingRatesService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const getLocationData = async (req, res) => {
    try {
        const result = await getLocationDataService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}