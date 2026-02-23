import { fetchReturnRefundPolicyService, addReturnRefundPolicyService, updateReturnRefundPolicyService } from "../../services/admin/adminPolicyService.js"; 



export const fetchReturnRefundPolicy = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchReturnRefundPolicyService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


// ✅ ADD RETURN REFUND POLICY
export const addReturnRefundPolicy = async (req, res) => {
    try {
        const { ID } = req.admin;
        const data = req.body;
        
        const result = await addReturnRefundPolicyService(ID, data);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ UPDATE RETURN REFUND POLICY
export const updateReturnRefundPolicy = async (req, res) => {
    try {
        const { ID } = req.admin;
        const data = req.body;
        
        const result = await updateReturnRefundPolicyService(ID, data);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};