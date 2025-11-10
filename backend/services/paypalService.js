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


// 2️⃣ Create PayPal Order
export const createPayPalOrderService = async (amount) => {
  const accessToken = await generateAccessToken();
  const response = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
            amount: { 
                currency_code: process.env.PAYPAL_CURRENCY, 
                value: Number(amount).toFixed(2) 
            },
        },
      ],
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
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
