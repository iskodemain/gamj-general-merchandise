import { fetchInventoryStockService, addStockService, fetchInventoryBatchService, fetchInventoryHistoryService } from "../../services/admin/adminInventoryService.js";


export const fetchInventoryStock = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchInventoryStockService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const fetchInventoryBatch = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchInventoryBatchService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchInventoryHistory = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchInventoryHistoryService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}



export const addStock = async (req, res) => {
    try {
        const { productId, variantValueId, variantCombinationId, quantityReceived, expirationDate, supplier, batchNumber, manufacturingDate, notes, lowStockThreshold } = req.body;
        const { ID } = req.admin;
        const result = await addStockService(ID, productId, variantValueId, variantCombinationId, quantityReceived, expirationDate, supplier, batchNumber, manufacturingDate, notes, lowStockThreshold);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}