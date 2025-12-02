import { fetchOrdersService, fetchOrderCancelService, fetchOrderReturnAndRefundService, updateOrderStatusService, fetchRefundProofService, processRefundRequestService, approveRefundRequestService, sucessfullyProcessedRefundService, rejectedRefundRequestService, submitRefundProofService } from "../../services/admin/adminOrderService.js";

export const fetchOrders = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchOrdersService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchOrderCancel = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchOrderCancelService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchOrderReturnAndRefund = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchOrderReturnAndRefundService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const payload = req.body;
        const { ID } = req.admin;
        const result = await updateOrderStatusService(ID, payload);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const fetchRefundProof = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchRefundProofService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const processRefundRequest = async (req, res) => {
    try {
        const { refundID, newStatus } = req.body;
        const { ID } = req.admin;
        const result = await processRefundRequestService(ID, refundID, newStatus);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const approveRefundRequest = async (req, res) => {
    try {
        const { refundID, newStatus } = req.body;
        const { ID } = req.admin;
        const result = await approveRefundRequestService(ID, refundID, newStatus);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const sucessfullyProcessedRefund = async (req, res) => {
    try {
        const { refundID, newStatus } = req.body;
        const { ID } = req.admin;
        const result = await sucessfullyProcessedRefundService(ID, refundID, newStatus);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const rejectedRefundRequest = async (req, res) => {
    try {
        const { refundID, newStatus, rejectedReason } = req.body;
        const { ID } = req.admin;
        const result = await rejectedRefundRequestService(ID, refundID, newStatus, rejectedReason);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const submitRefundProof = async (req, res) => {
  try {
      const { ID } = req.admin;
      const result = await submitRefundProofService(ID, req.body, req.files);
      res.json(result);
  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
};
