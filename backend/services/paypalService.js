import axios from "axios";

// 1️⃣ Generate PayPal Access Token
export const generateAccessToken = async () => {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64");
  const response = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    { 
        headers: { 
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        } 
    }
  );
  return response.data.access_token;
};


// 2️⃣ Calculate PayPal fee and grossed-up amount
// Formula: customerPays = (originalAmount + fixedFee) / (1 - percentFee)
// This ensures the owner receives exactly `originalAmount` after PayPal deducts its fee
export const calculatePaypalFee = (originalAmount) => {
  const percentFee = parseFloat(process.env.PAYPAL_PERCENT_FEE || "0.039");
  const fixedFee = parseFloat(process.env.PAYPAL_FIXED_FEE || "15");
  const grossed = (Number(originalAmount) + fixedFee) / (1 - percentFee);
  const grossedRounded = Math.ceil(grossed * 100) / 100;
  const fee = parseFloat((grossedRounded - Number(originalAmount)).toFixed(2));
  return { grossedAmount: grossedRounded, paypalFee: fee };
};

// 3️⃣ Create PayPal Order
export const createPayPalOrderService = async (amount) => {
  const accessToken = await generateAccessToken();
  // Gross up the amount so owner receives exactly `amount` after PayPal fee
  const { grossedAmount } = calculatePaypalFee(amount);
  const response = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
            amount: { 
                currency_code: process.env.PAYPAL_CURRENCY, 
                value: Number(grossedAmount).toFixed(2) 
            },
        },
      ],
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return { ...response.data, paypalFee: calculatePaypalFee(amount).paypalFee };
};


// 3️⃣ Capture PayPal Order
export const capturePayPalOrderService = async (orderID) => {
  const accessToken = await generateAccessToken();
  const response = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
};
