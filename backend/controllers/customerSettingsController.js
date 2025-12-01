import { fetchBusinessInfoService } from "../services/customerSettingsService.js";

export const fetchBusinessInfo = async (req, res) => {
    try {
        const result = await fetchBusinessInfoService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}