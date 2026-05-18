import Admin from "../../models/admin.js";
import InventoryStock from "../../models/inventoryStock.js";
import InventoryBatch from "../../models/inventoryBatch.js"
import InventoryHistory from "../../models/inventoryHistory.js"
import ProductInventorySettings from "../../models/productInventorySettings.js";
import Notifications from "../../models/notifications.js";
import Customer from "../../models/customer.js";
import Products from "../../models/products.js";
import { sequelize } from "../../config/sequelize.js";
import { io } from "../../server.js";
import { orderSendMail } from "../../utils/mailer.js";
import { stockAdjustmentLowStockTemplate, outOfStockTemplate } from "../../utils/emailTemplates.js";

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

        let updatedStock;

        if (stock) {
            // Update existing stock
            const newTotal = stock.totalQuantity + Number(quantityReceived);
            await stock.update({
                totalQuantity: newTotal
            }, { transaction: t });
            updatedStock = newTotal;
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

            updatedStock = Number(quantityReceived);
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
            stockAfter: updatedStock,
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

export const adjustStockService = async (adminId, productId, variantValueId, variantCombinationId, quantity, adjustType, reason) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) return { success: false, message: "User not found" };

    if (!productId || !quantity || !adjustType || !reason) {
      return { success: false, message: "Missing required fields" };
    }

    if (Number(quantity) <= 0) {
      return { success: false, message: "Quantity must be greater than 0" };
    }

    if (!["ADD", "DEDUCT"].includes(adjustType)) {
      return { success: false, message: "Invalid adjust type. Must be ADD or DEDUCT." };
    }

    const product = await Products.findByPk(productId);
    if (!product) return { success: false, message: "Product not found" };

    // Find inventory stock record
    const stock = await InventoryStock.findOne({
      where: {
        productId,
        variantValueId: variantValueId || null,
        variantCombinationId: variantCombinationId || null,
      },
    });

    if (!stock) return { success: false, message: "Inventory stock record not found for this product/variant." };

    const currentQty = Number(stock.totalQuantity || 0);
    const adjustQty = Number(quantity);

    if (adjustType === "DEDUCT" && adjustQty > currentQty) {
      return { success: false, message: `Cannot deduct ${adjustQty} — only ${currentQty} in stock.` };
    }

    // Calculate new total
    const newTotalQuantity = adjustType === "ADD"
      ? currentQty + adjustQty
      : Math.max(0, currentQty - adjustQty);

    // Update InventoryStock
    await stock.update({ totalQuantity: newTotalQuantity, updatedAt: new Date() });

    // Update isOutOfStock flag on product + notify all users when stock hits zero
    if (newTotalQuantity === 0) {
      await Products.update({ isOutOfStock: true }, { where: { ID: productId } });

      // In-app out of stock notification broadcast to all user types
      const lastOosNotif = await Notifications.findOne({ order: [["ID", "DESC"]] });
      let oosNotifNo = lastOosNotif ? Number(lastOosNotif.ID) + 1 : 1;

      const oosNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", oosNotifNo++),
        senderId: null,
        receiverId: null,
        receiverType: "All",
        senderType: "System",
        notificationType: "Product Update",
        title: "Out of Stock Alert",
        message: `❌ The product "${product.productName}" is now OUT OF STOCK after a stock adjustment.`,
        isRead: false,
        createAt: new Date(),
      });

      io.emit("lowStockAlert", oosNotification);

      // Bulk email — all verified admins/delivery staff + all verified customers
      const oosAdmins = await Admin.findAll({ where: { verifiedUser: true } });
      const oosCustomers = await Customer.findAll({ where: { verifiedCustomer: true } });

      const oosAdminEmails = oosAdmins.map(a => a.emailAddress).filter(Boolean);
      const oosCustomerEmails = oosCustomers.map(c => c.loginEmail || c.emailAddress).filter(Boolean);
      const oosAllEmails = [...new Set([...oosAdminEmails, ...oosCustomerEmails])];

      if (oosAllEmails.length > 0) {
        orderSendMail({
          to: oosAllEmails.join(","),
          subject: `OUT OF STOCK: ${product.productName}`,
          html: outOfStockTemplate(
            product.productName,
            `Stock Adjustment (${adjustType})`,
            adjustQty,
            reason
          ),
        });
      }
    } else {
      await Products.update({ isOutOfStock: false }, { where: { ID: productId } });
    }

    // Update InventoryBatch — find the most recent batch for this product/variant
    // For ADD: increase quantityReceived and remainingQuantity of the latest batch
    // For DEDUCT: decrease remainingQuantity using FIFO (oldest expiry first)
    if (adjustType === "ADD") {
      // Find the latest batch (most recently received)
      const latestBatch = await InventoryBatch.findOne({
        where: {
          productId,
          variantValueId: variantValueId || null,
          variantCombinationId: variantCombinationId || null,
        },
        order: [["dateReceived", "DESC"]],
      });

      if (latestBatch) {
        await latestBatch.update({
          quantityReceived: Number(latestBatch.quantityReceived) + adjustQty,
          remainingQuantity: Number(latestBatch.remainingQuantity) + adjustQty,
          updatedAt: new Date(),
        });
      }
    } else {
      // DEDUCT: FIFO — oldest expiry first
      let remainingToDeduct = adjustQty;
      const batches = await InventoryBatch.findAll({
        where: {
          productId,
          variantValueId: variantValueId || null,
          variantCombinationId: variantCombinationId || null,
        },
        order: [
          ["expirationDate", "ASC"],
          ["dateReceived", "ASC"],
        ],
      });

      for (const batch of batches) {
        if (remainingToDeduct <= 0) break;
        const batchRemaining = Number(batch.remainingQuantity || 0);
        const deductFromBatch = Math.min(batchRemaining, remainingToDeduct);
        await batch.update({ remainingQuantity: batchRemaining - deductFromBatch, updatedAt: new Date() });
        remainingToDeduct -= deductFromBatch;
      }
    }

    // Create InventoryHistory record
    const lastHistory = await InventoryHistory.findOne({ order: [["ID", "DESC"]] });
    const nextHistoryNo = lastHistory ? lastHistory.ID + 1 : 1;
    const inventoryHistoryId = withTimestamp("IHT", nextHistoryNo);

    await InventoryHistory.create({
      inventoryHistoryId,
      productId,
      variantValueId: variantValueId || null,
      variantCombinationId: variantCombinationId || null,
      type: "ADJUST",
      adjustType,
      quantity: adjustQty,
      stockAfter: newTotalQuantity,
      referenceId: `ADJ-${adminUser.adminId || adminId}`,
      remarks: reason,
      createdAt: new Date(),
    });

    // Check low stock threshold and notify if needed
    const inventorySettings = await ProductInventorySettings.findOne({
      where: {
        productId,
        variantValueId: variantValueId || null,
        variantCombinationId: variantCombinationId || null,
      },
    });

    const shouldNotify = adjustType === "DEDUCT" && inventorySettings && newTotalQuantity > 0 && newTotalQuantity <= inventorySettings.lowStockThreshold;

    if (shouldNotify) {
      const productName = product.productName;
      const lowStockThreshold = inventorySettings.lowStockThreshold;
      const lowStockMessage = newTotalQuantity === 0
        ? `⚠️ The product "${productName}" is now OUT OF STOCK after a stock adjustment.`
        : `⚠️ The product "${productName}" is running low after a stock adjustment. Only ${newTotalQuantity} left in stock!`;

      // Notification counter
      const lastNotification = await Notifications.findOne({ order: [["ID", "DESC"]] });
      let nextNotificationNo = lastNotification ? Number(lastNotification.ID) + 1 : 1;

      // Broadcast low stock notification to all
      const lowStockNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: null,
        receiverId: null,
        receiverType: "All",
        senderType: "System",
        notificationType: "Product Update",
        title: "Low Stock Alert",
        message: lowStockMessage,
        isRead: false,
        createAt: new Date(),
      });

      io.emit("lowStockAlert", lowStockNotification);

      // Collect all email recipients: all admins + all customers
      const allAdmins = await Admin.findAll({ where: { verifiedUser: true } });
      const allCustomers = await Customer.findAll({ where: { verifiedCustomer: true } });

      const adminEmails = allAdmins
        .map(a => a.emailAddress)
        .filter(Boolean);

      const customerEmails = allCustomers
        .map(c => c.loginEmail || c.emailAddress)
        .filter(Boolean);

      const allEmails = [...new Set([...adminEmails, ...customerEmails])];

      if (allEmails.length > 0) {
        orderSendMail({
          to: allEmails.join(","),
          subject: newTotalQuantity === 0
            ? `OUT OF STOCK: ${productName}`
            : `Low Stock Alert: ${productName}`,
          html: stockAdjustmentLowStockTemplate(
            productName,
            adjustType,
            adjustQty,
            newTotalQuantity,
            reason,
            lowStockThreshold
          ),
        });
      }
    }

    return {
      success: true,
      message: `Stock ${adjustType === "ADD" ? "increased" : "decreased"} by ${adjustQty} units successfully.`,
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};
