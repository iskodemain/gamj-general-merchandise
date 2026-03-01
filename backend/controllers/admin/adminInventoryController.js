import { fetchInventoryStockService, addStockService, fetchInventoryBatchService, fetchInventoryHistoryService, addInventorySettingsService, fetchInventorySettingsService, updateInventorySettingsService, deleteInventorySettingsService } from "../../services/admin/adminInventoryService.js";


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
        const { productId, variantValueId, variantCombinationId, quantityReceived, expirationDate, supplier, batchNumber, manufacturingDate, notes } = req.body;
        const { ID } = req.admin;
        const result = await addStockService(ID, productId, variantValueId, variantCombinationId, quantityReceived, expirationDate, supplier, batchNumber, manufacturingDate, notes);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const fetchInventorySettings = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchInventorySettingsService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const addInventorySettings = async (req, res) => {
    try {
        const { ID } = req.admin;
        const data = req.body;
        
        const result = await addInventorySettingsService(ID, data);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export const updateInventorySettings = async (req, res) => {
    try {
        const { ID } = req.admin;
        const data = req.body;
        
        const result = await updateInventorySettingsService(ID, data);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export const deleteInventorySettings = async (req, res) => {
  try {
    const { ID } = req.admin;
    const { productInventorySettingsID } = req.body;
    
    const result = await deleteInventorySettingsService(ID, productInventorySettingsID);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
