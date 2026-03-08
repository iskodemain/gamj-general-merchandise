import { fetchReturnRefundPolicyService, addReturnRefundPolicyService, updateReturnRefundPolicyService, addStorePolicyService, fetchStorePolicyService, updateStorePolicyService } from "../../services/admin/adminPolicyService.js"; 



export const fetchReturnRefundPolicy = async (req, res) => {
    try {
        const result = await fetchReturnRefundPolicyService();
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



// ✅ ADD STORE POLICY
export const addStorePolicy = async (req, res) => {
    try {
        const { ID } = req.admin;
        const data = req.body;
        
        const result = await addStorePolicyService(ID, data);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const updateStorePolicy = async (req, res) => {
    try {
        const { ID } = req.admin;
        const data = req.body;
        
        const result = await updateStorePolicyService(ID, data);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const fetchStorePolicy = async (req, res) => {
    try {
        const result = await fetchStorePolicyService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}
