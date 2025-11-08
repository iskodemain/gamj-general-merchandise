export const placeOrderTemplate = (userName, orderStatus, paymentMethod, orderId) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
    <style>
        body, table, td, a {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        img {
            border: 0;
            display: block;
            max-width: 100%;
        }

        .email-container {
            width: 100%;
            background-color: #f4f6f9;
            padding: 20px 0;
        }

        .email-content {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            margin-bottom: 30px;
            text-align: center;
        }

        .email-header img {
            margin: 0 auto;
            max-width: 120px;
        }

        .email-title {
            text-align: center;
        }

        .email-body {
            text-align: center;
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
        }

        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background-color: #43A047;
            color: #ffffff;
            font-weight: bold;
            border-radius: 10px;
            margin: 20px 0;
        }

        .payment-method {
            font-size: 15px;
            margin-top: 10px;
            color: #555;
        }

        .email-footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
        }

        .email-footer a {
            color: #43A047;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <table class="email-container" role="presentation">
        <tr>
            <td>
                <div class="email-content">
                    <!-- Header -->
                    <div class="email-header">
                        <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
                    </div>

                    <h2 class="email-title">Order Status Update</h2>

                    <!-- Body -->
                    <div class="email-body">
                        <p>Hi <strong>${userName}</strong>,</p>
                        <p>Thank you for placing your order with <strong>GAMJ General Merchandise</strong>.</p>

                        <div class="status-badge">
                            Order ID: #${orderId}
                        </div>

                        <div class="status-badge">
                            Order Status: ${orderStatus}
                        </div>

                        <p>Your order is currently <b>pending</b> and awaiting confirmation from our team.</p>
                        <p class="payment-method">Payment Method: <b>${paymentMethod}</b></p>
                        <p>We’ll notify you once your order has been processed and is ready for delivery.</p>
                    </div>

                    <!-- Footer -->
                    <div class="email-footer">
                        <p>If you have any questions about your order, feel free to reach out to us.</p>
                        <p>Contact us at: <a href="mailto:gamjmerchandisehelp@gmail.com" target="_blank">gamjmerchandisehelp@gmail.com</a></p>
                        <p>Thank you for shopping with us!</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

export const processingOrderTemplate = (userName, orderStatus, paymentMethod) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Now Being Processed</title>
    <style>
        body, table, td, a {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        img {
            border: 0;
            display: block;
            max-width: 100%;
        }

        .email-container {
            width: 100%;
            background-color: #f4f6f9;
            padding: 20px 0;
        }

        .email-content {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .email-header img {
            max-width: 120px;
            margin-bottom: 10px;
        }

        .email-body {
            text-align: center;
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
        }

        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background-color: #1976d2; /* Blue for processing */
            color: #ffffff;
            font-weight: bold;
            border-radius: 20px;
            margin: 20px 0;
        }

        .payment-method {
            font-size: 15px;
            margin-top: 10px;
            color: #555;
        }

        .progress-section {
            margin: 25px 0;
            text-align: center;
        }

        .progress-bar {
            width: 80%;
            height: 10px;
            background-color: #e0e0e0;
            border-radius: 5px;
            margin: 0 auto;
            position: relative;
        }

        .progress-bar-fill {
            height: 10px;
            background-color: #1976d2;
            width: 60%; /* visually show progress */
            border-radius: 5px;
        }

        .email-footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
        }

        .email-footer a {
            color: #43A047;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <table class="email-container" role="presentation">
        <tr>
            <td>
                <div class="email-content">
                    <!-- Header -->
                    <div class="email-header">
                        <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
                        <h2>Order Processing Update</h2>
                    </div>

                    <!-- Body -->
                    <div class="email-body">
                        <p>Hi <strong>${userName}</strong>,</p>
                        <p>Good news! Your order is now being <b>processed</b> by our team at <strong>GAMJ General Merchandise</strong>.</p>

                        <div class="status-badge">
                            Order Status: ${orderStatus}
                        </div>

                        <div class="progress-section">
                            <div class="progress-bar">
                                <div class="progress-bar-fill"></div>
                            </div>
                            <p style="margin-top: 10px; color: #555;">We’re carefully preparing your items for delivery.</p>
                        </div>

                        <p class="payment-method">Payment Method: <b>${paymentMethod}</b></p>
                        <p>You’ll receive another update once your order has been shipped.</p>
                    </div>

                    <!-- Footer -->
                    <div class="email-footer">
                        <p>If you have any questions about your order, feel free to reach out to us.</p>
                        <p>Contact us at: <a href="mailto:gamjmerchandisehelp@gmail.com" target="_blank">gamjmerchandisehelp@gmail.com</a></p>
                        <p>Thank you for choosing us!</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

export const outForDeliveryTemplate = (userName, orderStatus, paymentMethod) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Out for Delivery</title>
<style>
  body, table, td, a { margin: 0; padding: 0; font-family: Arial, sans-serif; }
  img { border: 0; display: block; max-width: 100%; }
  .email-container { width: 100%; background-color: #f4f6f9; padding: 20px 0; }
  .email-content { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  .email-header { text-align: center; margin-bottom: 30px; }
  .email-header img { max-width: 120px; }
  .email-body { text-align: center; font-size: 16px; line-height: 1.6; color: #333; }
  .status-badge { display: inline-block; padding: 10px 20px; background-color: #0288d1; color: #fff; font-weight: bold; border-radius: 20px; margin: 20px 0; }
  .email-footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
  .email-footer a { color: #43A047; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
  <table class="email-container">
    <tr>
      <td>
        <div class="email-content">
          <div class="email-header">
            <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
            <h2>Out for Delivery!</h2>
          </div>
          <div class="email-body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your order is now <b>out for delivery</b> and will arrive soon!</p>
            <div class="status-badge">Status: ${orderStatus}</div>
            <p>Please make sure someone is available to receive your package.</p>
            <p class="payment-method">Payment Method: <b>${paymentMethod}</b></p>
          </div>
          <div class="email-footer">
            <p>For delivery concerns, reach us at: <a href="mailto:gamjmerchandisehelp@gmail.com">gamjmerchandisehelp@gmail.com</a></p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const deliveredOrderTemplate = (userName, orderStatus, paymentMethod) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Delivered</title>
<style>
  body, table, td, a { margin: 0; padding: 0; font-family: Arial, sans-serif; }
  img { border: 0; display: block; max-width: 100%; }
  .email-container { width: 100%; background-color: #f4f6f9; padding: 20px 0; }
  .email-content { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  .email-header { text-align: center; margin-bottom: 30px; }
  .email-header img { max-width: 120px; }
  .email-body { text-align: center; font-size: 16px; line-height: 1.6; color: #333; }
  .status-badge { display: inline-block; padding: 10px 20px; background-color: #43a047; color: #fff; font-weight: bold; border-radius: 20px; margin: 20px 0; }
  .email-footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
  .email-footer a { color: #43A047; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
  <table class="email-container">
    <tr>
      <td>
        <div class="email-content">
          <div class="email-header">
            <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
            <h2>Order Delivered Successfully!</h2>
          </div>
          <div class="email-body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your order has been <b>successfully delivered</b>! We hope you enjoy your purchase.</p>
            <div class="status-badge">Status: ${orderStatus}</div>
            <p>Thank you for shopping with <strong>GAMJ General Merchandise</strong>.</p>
            <p class="payment-method">Payment Method: <b>${paymentMethod}</b></p>
          </div>
          <div class="email-footer">
            <p>We’d love your feedback! If you have any issues, reach us at <a href="mailto:gamjmerchandisehelp@gmail.com">gamjmerchandisehelp@gmail.com</a></p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const customerCancelledOrderTemplate = (userName, orderStatus, paymentMethod) => {
  // Determine message content based on payment method
  const refundMessage =
    paymentMethod === "Paypal"
      ? `<p>If you made a payment, please allow <b>3–5 business days</b> for the refund to be processed.</p>
         <p>We’re sorry to see you cancel, and we hope to serve you again soon.</p>`
      : `<p>Your order has been cancelled successfully. We hope to serve you again soon.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Cancelled Confirmation</title>
<style>
  body, table, td, a { margin: 0; padding: 0; font-family: Arial, sans-serif; }
  img { border: 0; display: block; max-width: 100%; }
  .email-container { width: 100%; background-color: #f4f6f9; padding: 20px 0; }
  .email-content { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  .email-header { text-align: center; margin-bottom: 30px; }
  .email-header img { max-width: 120px; margin-bottom: 10px; }
  .email-body { text-align: center; font-size: 16px; line-height: 1.6; color: #333333; }
  .status-badge { display: inline-block; padding: 10px 20px; background-color: #f44336; color: #ffffff; font-weight: bold; border-radius: 20px; margin: 20px 0; }
  .payment-method { font-size: 15px; margin-top: 10px; color: #555; }
  .email-footer { text-align: center; font-size: 12px; color: #777777; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
  .email-footer a { color: #43A047; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
  <table class="email-container" role="presentation">
    <tr>
      <td>
        <div class="email-content">
          <!-- Header -->
          <div class="email-header">
            <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
            <h2>Order Cancelled Successfully</h2>
          </div>

          <!-- Body -->
          <div class="email-body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your order has been <b>successfully cancelled</b> as per your request.</p>

            <div class="status-badge">
              Order Status: ${orderStatus}
            </div>

            <p class="payment-method">Payment Method: <b>${paymentMethod}</b></p>
            ${refundMessage}
          </div>

          <!-- Footer -->
          <div class="email-footer">
            <p>If this cancellation wasn’t made by you or you have questions, contact us immediately.</p>
            <p>Email: <a href="mailto:gamjmerchandisehelp@gmail.com">gamjmerchandisehelp@gmail.com</a></p>
            <p>Thank you for choosing GAMJ General Merchandise!</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const adminCancelledOrderTemplate = (userName, orderStatus, paymentMethod, cancelComments) => {
  // Determine refund or message logic based on payment method
  const paymentNote =
    paymentMethod === "Paypal" && `<p>If payment has been made, please allow <b>3–5 business days</b> for the refund to reflect in your account.</p>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Cancelled by Admin</title>
<style>
  body, table, td, a { margin: 0; padding: 0; font-family: Arial, sans-serif; }
  img { border: 0; display: block; max-width: 100%; }
  .email-container { width: 100%; background-color: #f4f6f9; padding: 20px 0; }
  .email-content { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  .email-header { text-align: center; margin-bottom: 30px; }
  .email-header img { max-width: 120px; }
  .email-body { text-align: center; font-size: 16px; line-height: 1.6; color: #333333; }
  .status-badge { display: inline-block; padding: 10px 20px; background-color: #212121; color: #ffffff; font-weight: bold; border-radius: 20px; margin: 20px 0; }
  .reason-box { background-color: #fbe9e7; padding: 15px; border-radius: 6px; margin-top: 15px; color: #5d4037; text-align: left; }
  .email-footer { text-align: center; font-size: 12px; color: #777777; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
  .email-footer a { color: #43A047; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
  <table class="email-container" role="presentation">
    <tr>
      <td>
        <div class="email-content">
          <!-- Header -->
          <div class="email-header">
            <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
            <h2>Order Cancelled by GAMJ General Merchandise</h2>
          </div>

          <!-- Body -->
          <div class="email-body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>We regret to inform you that your order has been <b>cancelled</b> by our team.</p>

            <div class="status-badge">Status: ${orderStatus}</div>

            <div class="reason-box">
              <p><b>Reason:</b> ${cancelComments}</p>
              <p><b>Payment Method:</b> ${paymentMethod}</p>
            </div>

            ${paymentNote}
          </div>

          <!-- Footer -->
          <div class="email-footer">
            <p>If you have any questions regarding this cancellation, please contact us:</p>
            <p>Email: <a href="mailto:gamjmerchandisehelp@gmail.com">gamjmerchandisehelp@gmail.com</a></p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const refundOrderTemplate = (userName, orderStatus, paymentMethod) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Refund Processed</title>
<style>
  body, table, td, a { margin: 0; padding: 0; font-family: Arial, sans-serif; }
  img { border: 0; display: block; max-width: 100%; }
  .email-container { width: 100%; background-color: #f4f6f9; padding: 20px 0; }
  .email-content { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  .email-header { text-align: center; margin-bottom: 30px; }
  .email-header img { max-width: 120px; }
  .email-body { text-align: center; font-size: 16px; line-height: 1.6; color: #333; }
  .status-badge { display: inline-block; padding: 10px 20px; background-color: #7b1fa2; color: #fff; font-weight: bold; border-radius: 20px; margin: 20px 0; }
  .email-footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
  .email-footer a { color: #43A047; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
  <table class="email-container">
    <tr>
      <td>
        <div class="email-content">
          <div class="email-header">
            <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
            <h2>Return / Refund Update</h2>
          </div>
          <div class="email-body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your return or refund request has been processing.</p>
            <div class="status-badge">Status: ${orderStatus}</div>
            <p>If applicable, please allow 3–5 business days for the refund to reflect in your account.</p>
            <p class="payment-method">Payment Method: <b>${paymentMethod}</b></p>
          </div>
          <div class="email-footer">
            <p>Questions? Contact: <a href="mailto:gamjmerchandisehelp@gmail.com">gamjmerchandisehelp@gmail.com</a></p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};






export const loginEmailTemplate = (userName, verificationCode) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Verification Code</title>
    <style>
        /* Basic Reset */
        body, table, td, a {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        img {
            border: 0;
            display: block;
            max-width: 100%;
        }

        /* Layout */
        .email-container {
            width: 100%;
            background-color: #f4f6f9;
            padding: 20px 0;
        }

        .email-content {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .email-header {
            margin-bottom: 30px;
            display: flex;
            justify-content: center;
        }

        .email-header img {
            margin: 0 auto;
            max-width: 120px;
        }

        /* Body */
        .email-body {
            text-align: center;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }

        .verification-code {
            font-size: 24px;
            font-weight: bold;
            color: #43A047;
            margin: 20px 0;
            margin-bottom: 7rem
        }

        /* Footer */
        .email-footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
        }

        .email-footer a {
            color: #43A047;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <table class="email-container" role="presentation">
        <tr>
            <td>
                <div class="email-content">
                    <!-- Header Section with Logo -->
                    <div class="email-header">
                        <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
                    </div>

                    <!-- Body Section -->
                    <div class="email-body">
                        <h2>Login Verification Code</h2>
                        <p>Hi ${userName}, here's your 6-digit login code:</p>
                        <div class="verification-code">${verificationCode}</div>
                        <p>This code will expire in <b>10 minutes.</b></p>
                        <p>Enter this code to complete your login securely.</p>
                    </div>

                    <!-- Footer Section -->
                    <div class="email-footer">
                        <p>If this wasn't you, we recommend changing your password immediately.</p>
                        <p>Need help? Contact us at: <a href="mailto:gamjmerchandisehelp@gmail.com" target='blank'>gamjmerchandisehelp@gmail.com</a>.</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
}

export const registrationEmailTemplate = (verificationCode) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verification</title>
    <style>
        /* Basic Reset */
        body, table, td, a {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        img {
            border: 0;
            display: block;
            max-width: 100%;
        }

        /* Layout */
        .email-container {
            width: 100%;
            background-color: #f4f6f9;
            padding: 20px 0;
        }

        .email-content {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .email-header {
            margin-bottom: 30px;
            display: flex;
            justify-content: center;
        }

        .email-header img {
            margin: 0 auto;
            max-width: 120px;
        }

        /* Body */
        .email-body {
            text-align: center;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }

        .verification-code {
            font-size: 24px;
            font-weight: bold;
            color: #43A047;
            margin: 20px 0;
            margin-bottom: 7rem
        }

        /* Footer */
        .email-footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
        }

        .email-footer a {
            color: #43A047;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <table class="email-container" role="presentation">
        <tr>
            <td>
                <div class="email-content">
                    <!-- Header Section with Logo -->
                    <div class="email-header">
                        <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
                    </div>

                    <!-- Body Section -->
                    <div class="email-body">
                        <h2>Account Verification</h2>
                        <p>Greetings from GAMJ General Merchandise Shop!<br>Use the code below to verify your email and complete your registration:</p>
                        <div class="verification-code">${verificationCode}</div>
                        <p>This code will expire in <b>60 minutes.</b></p>
                        <p>Enter this code on the registration page to verify your account.</p>
                    </div>

                    <!-- Footer Section -->
                    <div class="email-footer">
                        <p>If you did not attempt to sign up, you can safely ignore this email.</p>
                        <p>Need help? Contact us at: <a href="mailto:gamjmerchandisehelp@gmail.com" target='blank'>gamjmerchandisehelp@gmail.com</a>.</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
}

export const resetPasswordEmailTemplate = (userName, verificationCode) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password Verification</title>
    <style>
        /* Basic Reset */
        body, table, td, a {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        img {
            border: 0;
            display: block;
            max-width: 100%;
        }

        /* Layout */
        .email-container {
            width: 100%;
            background-color: #f4f6f9;
            padding: 20px 0;
        }

        .email-content {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .email-header {
            margin-bottom: 30px;
            display: flex;
            justify-content: center;
        }

        .email-header img {
            margin: 0 auto;
            max-width: 120px;
        }

        /* Body */
        .email-body {
            text-align: center;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }

        .verification-code {
            font-size: 24px;
            font-weight: bold;
            color: #43A047;
            margin: 20px 0;
            margin-bottom: 7rem
        }

        /* Footer */
        .email-footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
        }

        .email-footer a {
            color: #43A047;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <table class="email-container" role="presentation">
        <tr>
            <td>
                <div class="email-content">
                    <!-- Header Section with Logo -->
                    <div class="email-header">
                        <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
                    </div>

                    <!-- Body Section -->
                    <div class="email-body">
                        <h2>Reset Password Verification</h2>
                        <p>Hi ${userName}, Here's your 6-digit code to reset your password:</p>
                        <div class="verification-code">${verificationCode}</div>
                        <p>This code will expire in <b>30 minutes.</b></p>
                        <p>Enter this code on the password reset page to verify.</p>
                    </div>

                    <!-- Footer Section -->
                    <div class="email-footer">
                        <p>If you did not request a password reset, please disregard this email.</p>
                        <p>Need help? Contact us at: <a href="mailto:gamjmerchandisehelp@gmail.com" target='blank'>gamjmerchandisehelp@gmail.com</a>.</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
}