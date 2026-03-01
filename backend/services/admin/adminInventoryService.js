import Admin from "../../models/admin.js";
import InventoryStock from "../../models/inventoryStock.js";
import InventoryBatch from "../../models/inventoryBatch.js"
import InventoryHistory from "../../models/inventoryHistory.js"
import ProductInventorySettings from "../../models/productInventorySettings.js";
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


export const addStockService = async (adminId, productId, variantValueId, variantCombinationId, quantityReceived, expirationDate, supplier, batchNumber, manufacturingDate, notes) => {
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
                totalQuantity: stock.totalQuantity + quantityReceived
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
                totalQuantity: quantityReceived
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

export const fetchInventorySettingsService = async (adminId) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const inventorySettings = await ProductInventorySettings.findAll({
      order: [['createdAt', 'DESC']]
    });
    if (inventorySettings.length === 0) {
        return {
            success: true,
            inventorySettings: [],
        };
    }

    return {
      success: true,
      inventorySettings,
      message: 'Inventory settings fetched successfully'
    };

  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

export const addInventorySettingsService = async (adminId, data) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const { productId, variantValueId, variantCombinationId, lowStockThreshold } = data;

    // Validation
    if (!productId) {
      return {
        success: false,
        message: 'Product ID is required'
      };
    }

    if (lowStockThreshold === undefined || lowStockThreshold === null || lowStockThreshold < 1) {
      return {
        success: false,
        message: 'Valid low stock threshold is required'
      };
    }

    // Check if settings already exist for this product/variant combination
    const existingSettings = await ProductInventorySettings.findOne({
      where: {
        productId,
        variantValueId: variantValueId || null,
        variantCombinationId: variantCombinationId || null
      }
    });

    if (existingSettings) {
      return {
        success: false,
        message: 'This already exists.'
      };
    }

    // AUTO-GENERATE INVENTORY HISTORY ID
    const lastInventorySettings = await ProductInventorySettings.findOne({
        order: [["ID", "DESC"]],
    });

    const nextInventorySettings = lastInventorySettings ? lastInventorySettings.ID + 1 : 1;
    const productInventorySettingsId = withTimestamp("PIS", nextInventorySettings);

    // Create new settings
    const newSettings = await ProductInventorySettings.create({
      productInventorySettingsId,
      productId,
      variantValueId: variantValueId || null,
      variantCombinationId: variantCombinationId || null,
      lowStockThreshold
    });

    return {
      success: true,
      message: 'Inventory settings added successfully',
      data: newSettings
    };

  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

export const updateInventorySettingsService = async (adminId, data) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const { productInventorySettingsID, lowStockThreshold } = data;

    if (!productInventorySettingsID) {
      return {
        success: false,
        message: 'Settings ID is required'
      };
    }

    if (lowStockThreshold === undefined || lowStockThreshold === null || lowStockThreshold < 1) {
      return {
        success: false,
        message: 'Valid low stock threshold is required'
      };
    }

    // Find the settings
    const settings = await ProductInventorySettings.findByPk(productInventorySettingsID);

    if (!settings) {
      return {
        success: false,
        message: 'Inventory settings not found'
      };
    }

    // Update
    settings.lowStockThreshold = lowStockThreshold;
    settings.updatedAt = new Date();
    await settings.save();

    return {
      success: true,
      message: 'Inventory settings updated successfully',
      data: settings
    };

  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

export const deleteInventorySettingsService = async (adminId, productInventorySettingsID) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    if (!productInventorySettingsID) {
      return {
        success: false,
        message: 'Settings ID is required'
      };
    }

    // Find the settings
    const settings = await ProductInventorySettings.findByPk(productInventorySettingsID);

    if (!settings) {
      return {
        success: false,
        message: 'Inventory settings not found'
      };
    }

    // Delete
    await settings.destroy();

    return {
      success: true,
      message: 'Inventory settings deleted successfully'
    };

  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};