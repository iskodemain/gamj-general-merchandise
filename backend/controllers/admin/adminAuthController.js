import { loginAdminService, loginCodeVerifyService, fetchAdminProfileService, saveAdminProfileService} from "../../services/admin/adminAuthService.js";

// ADMIN LOGIN INPUT
export const loginAdmin = async (req, res) => {
    try {
        const {identifier, password} = req.body;
        const result = await loginAdminService(identifier, password);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


// ADMIN LOGIN INPUT VERIFICATON CODE
export const loginCodeVerify = async (req, res) => {
    try {
        const {loginToken, code} = req.body;
        const result = await loginCodeVerifyService(loginToken, code);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchAdminProfile = async (req, res) => {
    try {
        const {ID} = req.admin;
        const result = await fetchAdminProfileService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const saveAdminProfile = async (req, res) => {
    try {
        const payload = req.body;
        const {ID} = req.admin;
        const result = await saveAdminProfileService(ID, payload);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}