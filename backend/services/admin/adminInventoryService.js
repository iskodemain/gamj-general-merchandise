import Admin from "../../models/admin.js";
import InventoryStock from "../../models/inventoryStock.js";
import InventoryBatch from "../../models/inventoryBatch.js"
import InventoryHistory from "../../models/inventoryHistory.js"
import { sequelize } from "../../config/sequelize.js";

// ID GENERATOR
const withTimestamp = (prefix, number) => {
  return `${prefix}-${number.toString().padStart(5, "0")}-${Date.now()}`;
};

export const fetchInventoryStockService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const inventoryStock = await InventoryStock.findAll({});
        if (inventoryStock.length === 0) {
            return {
                success: true,
                inventoryStock: [],
            };
        }


        return {
            success: true,
            inventoryStock,
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchInventoryBatchService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const inventoryBatch = await InventoryBatch.findAll({});
        if (inventoryBatch.length === 0) {
            return {
                success: true,
                inventoryBatch: [],
            };
        }


        return {
            success: true,
            inventoryBatch,
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchInventoryHistoryService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const inventoryHistory = await InventoryHistory.findAll({});
        if (inventoryHistory.length === 0) {
            return {
                success: true,
                inventoryHistory: [],
            };
        }


        return {
            success: true,
            inventoryHistory,
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


export const addStockService = async (adminId, productId, variantValueId, variantCombinationId, quantityReceived, expirationDate, supplier, batchNumber, manufacturingDate, notes, lowStockThreshold) => {
    try {
        const t = await sequelize.transaction();

        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            await t.rollback();
            return { success: false, message: "User not found" };
        }

        // 2. Validate required fields
        if (!productId || !quantityReceived) {
            await t.rollback();
            return { success: false, message: "Missing required fields" };
        }

        if (Number(quantityReceived) <= 0) {
            await t.rollback();
            return { success: false, message: "Quantity must be greater than 0" };
        }

        // AUTO-GENERATE INVENTORY BATCH ID
        const lastBatch = await InventoryBatch.findOne({
            order: [["ID", "DESC"]],
        });

        const nextBatchNo = lastBatch ? lastBatch.ID + 1 : 1;
        const inventoryBatchId = withTimestamp("IBT", nextBatchNo);

        // AUTO-GENERATE BATCH NUMBER IF NOT GIVEN
        if (!batchNumber || !batchNumber.trim()) {
            batchNumber = "BATCH-" + nextBatchNo.toString().padStart(5, "0");
        }

        const batch = await InventoryBatch.create({
            inventoryBatchId,
            productId,
            variantValueId,
            variantCombinationId,
            quantityReceived,
            remainingQuantity: quantityReceived,
            manufacturingDate,
            expirationDate,
            supplier,
            batchNumber,
        }, { transaction: t });

        // 3. Create/Update Inventory Stock
        let stock = await InventoryStock.findOne({
            where: {
                productId,
                variantValueId: variantValueId || null,
                variantCombinationId: variantCombinationId || null
            }
        });

        if (stock) {
            // Update existing stock
            await stock.update({
                totalQuantity: stock.totalQuantity + quantityReceived,
                lowStockThreshold: lowStockThreshold ?? stock.lowStockThreshold
            }, { transaction: t });
        } else {
            // AUTO-GENERATE INVENTORY STOCK ID
            const lastStock = await InventoryStock.findOne({
                order: [["ID", "DESC"]],
            });

            const nextStockNo = lastStock ? lastStock.ID + 1 : 1;
            const inventoryStockId = withTimestamp("IST", nextStockNo);

            // Create new stock record
            stock = await InventoryStock.create({
                inventoryStockId,
                productId,
                variantValueId,
                variantCombinationId,
                totalQuantity: quantityReceived,
                lowStockThreshold
            }, { transaction: t });
        }

        // AUTO-GENERATE INVENTORY HISTORY ID
        const lastHistory = await InventoryHistory.findOne({
            order: [["ID", "DESC"]],
        });

        const nextHistoryNo = lastHistory ? lastHistory.ID + 1 : 1;
        const inventoryHistoryId = withTimestamp("IHT", nextHistoryNo);
        await InventoryHistory.create({
            inventoryHistoryId,
            productId,
            variantValueId,
            variantCombinationId,
            type: "IN",
            quantity: quantityReceived,
            referenceId: batch.ID,
            remarks: notes || `Stock-in for batch ${batchNumber}`
        }, { transaction: t });

        await t.commit();

        return {
            success: true,
            message: "Stock added successfully"
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}