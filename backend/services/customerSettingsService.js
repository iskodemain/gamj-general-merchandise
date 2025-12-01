import SystemSettings from "../models/SystemSettings.js";

export const fetchBusinessInfoService = async () => {
    try {
        const settingData = await SystemSettings.findAll({});
        if (settingData.length === 0) {
            return {
                success: true,
                message: "No business information found.",
                settingData: [],
            };
        }


        return {
            success: true,
            settingData,
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}