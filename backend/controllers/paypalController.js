import { createPayPalOrderService, capturePayPalOrderService } from "../services/paypalService.js";
import { addOrderService } from "../services/customerOrderService.js";


export const createPayPalOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        const result = await createPayPalOrderService(amount);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const capturePayPalOrder = async (req, res) => {
  try {
    const { orderID, paymentMethod, orderItems, cartItemsToDelete } = req.body;
    const { ID } = req.user;

    const capture = await capturePayPalOrderService(orderID);

    // Check both top-level and nested statuses (PayPal sometimes nests status)
    const status = capture.status || capture?.purchase_units?.[0]?.payments?.captures?.[0]?.status;

    if (status === "COMPLETED") {
      const result = await addOrderService(ID, paymentMethod, orderItems, cartItemsToDelete);
      res.json(result);
    }

    res.status(400).json({ success: false, message: "Payment not completed" });
  } catch (error) {
    console.error("PayPal Capture Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to capture PayPal order" });
  }
};