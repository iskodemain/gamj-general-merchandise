import { loginAdminService, loginCodeVerifyService } from "../../services/admin/adminAuthService.js";

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