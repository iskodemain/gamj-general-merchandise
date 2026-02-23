import ReturnRefundPolicy from "../../models/returnRefundPolicy.js";
import Admin from "../../models/admin.js";

// 🔹 ID GENERATOR
const withTimestamp = (prefix, number) => {
  return `${prefix}-${number.toString().padStart(5, "0")}-${Date.now()}`;
};

// 🔹 FETCH RETURN REFUND POLICY (Single Record)
export const fetchReturnRefundPolicyService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // Fetch the single policy record (first record in table)
        const returnRefundPolicy = await ReturnRefundPolicy.findOne({
            order: [['updatedAt', 'DESC']] // Get the most recently updated policy
        });

        if (!returnRefundPolicy) {
            return {
                success: true,
                message: 'No return and refund policy found',
                returnRefundPolicy: []
            };
        }

        return {
            success: true,
            message: 'Policy fetched successfully',
            returnRefundPolicy
        };
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};


// 🔹 ADD RETURN REFUND POLICY (Create New Record)
export const addReturnRefundPolicyService = async (adminId, data) => {
    try {
        // ✅ STEP 1: Validate Admin
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // ✅ STEP 2: Validate Input
        const { returnRefundDays } = data;
        
        if (!returnRefundDays || returnRefundDays <= 0) {
            return {
                success: false,
                message: 'Return/Refund days must be greater than 0'
            };
        }

        // ✅ STEP 3: Check if policy already exists (should only have ONE policy)
        const existingPolicy = await ReturnRefundPolicy.findOne();
        
        if (existingPolicy) {
            return {
                success: false,
                message: 'Policy already exists. Please use update instead.'
            };
        }

        // ✅ STEP 4: Generate Unique ID
        const lastPolicy = await ReturnRefundPolicy.findOne({
            order: [['createdAt', 'DESC']]
        });

        let nextNumber = 1;
        if (lastPolicy && lastPolicy.ID) {
            const lastIdParts = lastPolicy.ID.split('-');
            if (lastIdParts.length >= 2) {
                nextNumber = parseInt(lastIdParts[1], 10) + 1;
            }
        }

        const policyId = withTimestamp('RRP', nextNumber);

        // ✅ STEP 5: Create New Policy
        const newPolicy = await ReturnRefundPolicy.create({
            policyId: policyId,
            returnRefundDays: parseInt(returnRefundDays, 10)
        });

        return {
            success: true,
            message: 'Return and refund policy created successfully',
            data: newPolicy
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};


// 🔹 UPDATE RETURN REFUND POLICY (Update Existing Record)
export const updateReturnRefundPolicyService = async (adminId, data) => {
    try {
        // ✅ STEP 1: Validate Admin
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // ✅ STEP 2: Validate Input
        const { returnRefundDays } = data;
        
        if (!returnRefundDays || returnRefundDays <= 0) {
            return {
                success: false,
                message: 'Return/Refund days must be greater than 0'
            };
        }

        // ✅ STEP 3: Find Existing Policy (should only have ONE)
        const existingPolicy = await ReturnRefundPolicy.findOne({
            order: [['updatedAt', 'DESC']]
        });

        if (!existingPolicy) {
            return {
                success: false,
                message: 'No policy found to update. Please create one first.'
            };
        }

        // ✅ STEP 4: Update the Policy
        await ReturnRefundPolicy.update(
            {
                returnRefundDays: parseInt(returnRefundDays, 10),
                updatedAt: new Date()
            },
            {
                where: { ID: existingPolicy.ID }
            }
        );

        // ✅ STEP 5: Fetch Updated Policy
        const updatedPolicy = await ReturnRefundPolicy.findByPk(existingPolicy.ID);

        return {
            success: true,
            message: 'Return and refund policy updated successfully',
            data: updatedPolicy
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};