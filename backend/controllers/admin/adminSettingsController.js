import { fetchSettingsDataService, updateSettingsDataService } from "../../services/admin/adminSettingsService.js";

export const fetchSettingsData = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchSettingsDataService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const updateSettingsData = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await updateSettingsDataService(ID, req.body, req.files);;
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}