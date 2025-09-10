import { getLocationDataService } from '../services/customerLocationService.js'

export const getLocationData = async (req, res) => {
    try {
        const result = await getLocationDataService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}