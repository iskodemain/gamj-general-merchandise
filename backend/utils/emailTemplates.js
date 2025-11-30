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


export const orderStatusUpdateTemplate = (userName, orderStatus, paymentMethod, listOfProducts, dateOrdered) => {
  // 🎨 Dynamic status configuration
  const statusConfig = {
    'Processing': {
      color: '#00E3B6',
      icon: '⚙️',
      progress: 33,
      message: 'Your order is being prepared'
    },
    'Out for Delivery': {
      color: '#656DFF',
      icon: '🚚',
      progress: 66,
      message: 'Your order is on its way'
    },
    'Delivered': {
      color: '#00DD31',
      icon: '✅',
      progress: 100,
      message: 'Your order has been delivered'
    },
    'Cancelled': {
      color: '#e36666',
      icon: '❌',
      progress: 0,
      message: 'Your order has been cancelled'
    }
  };

  const currentStatus = statusConfig[orderStatus] || statusConfig['Processing'];

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
            text-align: center;
            margin-bottom: 30px;
        }

        .email-header img {
            max-width: 120px;
            margin: 0 auto 10px auto;
        }

        .email-header h2 {
            margin: 0;
            color: #333;
        }

        .email-body {
            text-align: center;
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 24px;
            background-color: ${currentStatus.color};
            color: #ffffff;
            font-weight: bold;
            border-radius: 25px;
            margin: 20px 0;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .status-icon {
            font-size: 18px;
            line-height: 1;
            display: inline-block;
            vertical-align: middle;
        }

        .status-message {
            font-size: 15px;
            color: #555;
            margin: 15px 0;
            font-style: italic;
        }

        .order-details {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
        }

        .order-details h3 {
            margin: 0 0 15px 0;
            color: #333;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .order-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }

        .info-item {
            padding: 10px;
            background-color: #ffffff;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
        }

        .info-item strong {
            display: flex;
            align-items: center;
            gap: 6px;
            color: ${currentStatus.color};
            font-size: 13px;
            margin-bottom: 5px;
        }

        .info-item .icon {
            font-size: 14px;
            line-height: 1;
        }

        .info-item span {
            color: #333;
            font-size: 14px;
            display: block;
            margin-left: 20px;
        }

        .products-list {
            margin-top: 15px;
            padding: 15px;
            background-color: #ffffff;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
        }

        .products-list h4 {
            margin: 0 0 10px 0;
            font-size: 15px;
        }

        .products-list ul {
            margin: 0;
            padding-left: 20px;
            color: #333;
        }

        .products-list li {
            margin: 5px 0;
            font-size: 14px;
        }

        .progress-section {
            margin: 25px 0;
            text-align: center;
        }

        .progress-section > p {
            margin-bottom: 10px;
            color: #555;
            font-weight: 600;
        }

        .progress-bar {
            width: 80%;
            height: 12px;
            background-color: #e0e0e0;
            border-radius: 6px;
            margin: 0 auto 15px auto;
            position: relative;
            overflow: hidden;
        }

        .progress-bar-fill {
            height: 12px;
            width: ${currentStatus.progress}%;
            background-color: ${currentStatus.color};
            border-radius: 6px;
            transition: width 0.3s ease;
        }

        .progress-label {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: 10px;
            padding: 8px 16px;
            background-color: ${currentStatus.color};
            color: white;
            border-radius: 15px;
            font-size: 14px;
            font-weight: 600;
        }

        .progress-label .icon {
            font-size: 16px;
            line-height: 1;
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

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-content {
                padding: 20px;
            }

            .order-info-grid {
                grid-template-columns: 1fr;
            }

            .progress-bar {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <table class="email-container" role="presentation">
        <tr>
            <td>
                <div class="email-content">
                    <!-- Header with Centered Logo -->
                    <div class="email-header">
                        <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
                        <h2>Order Status Update</h2>
                    </div>

                    <!-- Body -->
                    <div class="email-body">
                        <p>Hi <strong>${userName}</strong>,</p>
                        <p>Your order has been updated at <strong>GAMJ General Merchandise</strong>.</p>

                        <div class="status-badge">
                            <span class="status-icon">${currentStatus.icon} ${" "}</span>
                            <span>${orderStatus}</span>
                        </div>

                        <p class="status-message">${currentStatus.message}</p>

                        <!-- Order Details -->
                        <div class="order-details">
                            <h3>
                                <span class="icon">📦</span>
                                <span>Order Information</span>
                            </h3>
                            
                            <!-- Order Info Grid -->
                            <div class="order-info-grid">
                                <div class="info-item">
                                    <strong>
                                        <span class="icon">📅</span>
                                        <span>Date Ordered</span>
                                    </strong>
                                    <span>${new Date(dateOrdered).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}</span>
                                </div>
                                
                                <div class="info-item">
                                    <strong>
                                        <span class="icon">💳</span>
                                        <span>Payment Method</span>
                                    </strong>
                                    <span>${paymentMethod}</span>
                                </div>
                            </div>

                            <!-- Products List -->
                            <div class="products-list">
                                <h4>Items in this Update:</h4>
                                <ul>
                                    ${listOfProducts}
                                </ul>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="progress-section">
                            <p>Order Progress</p>
                            <div class="progress-bar">
                                <div class="progress-bar-fill"></div>
                            </div>
                            <div class="progress-label">
                                <span class="icon">${currentStatus.icon} ${" "}</span>
                                <span>${orderStatus}</span>
                            </div>
                        </div>

                        <p style="margin-top: 30px;">Thank you for choosing GAMJ General Merchandise!</p>
                    </div>

                    <!-- Footer -->
                    <div class="email-footer">
                        <p>If you have any questions about your order, feel free to reach out to us.</p>
                        <p>Contact us at: <a href="mailto:gamjmerchandisehelp@gmail.com" target="_blank">gamjmerchandisehelp@gmail.com</a></p>
                        <p>Thank you for shopping with us!</p>
                        <p style="margin-top: 15px;">
                            © ${new Date().getFullYear()} GAMJ General Merchandise. All rights reserved.
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
};



export const customerCancelledOrderTemplate = (userName, orderStatus, paymentMethod, orderId, productName) => {
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

    .payment-method, .order-info { 
        font-size: 15px; 
        margin-top: 10px; 
        color: #555555; 
    }

    .order-info strong {
        color: #333333;
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

          <h2 class="email-title">Order Cancelled Successfully</h2>

          <!-- Body -->
          <div class="email-body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your order has been <b>successfully cancelled</b> as per your request.</p>

            <div class="status-badge">
              Order Status: ${orderStatus}
            </div>

            <div class="order-info">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Product:</strong> ${productName}</p>
            </div>

            <p class="payment-method">Payment Method: <b>${paymentMethod}</b></p>
            ${refundMessage}
          </div>

          <!-- Footer -->
          <div class="email-footer">
            <p>If this cancellation wasn’t made by you or you have questions, contact us immediately.</p>
            <p>Email: <a href="mailto:gamjmerchandisehelp@gmail.com">gamjmerchandisehelp@gmail.com</a></p>
            <p>Thank you for choosing GAMJ General Merchandise!</p>
            <p style="margin-top: 15px;">
                © ${new Date().getFullYear()} GAMJ General Merchandise. All rights reserved.
            </p>
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
            <p style="margin-top: 15px;">
                © ${new Date().getFullYear()} GAMJ General Merchandise. All rights reserved.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const refundOrderTemplate = (userName, orderStatus, refundMethod, orderId, productName) => {
  // Determine the message based on refund method
  let refundMessage = "";

  if (refundMethod.includes("PayPal Refund")) {
    refundMessage = "Your refund will be processed to your PayPal account.";
  } else if (refundMethod.includes("Cash Refund")) {
    refundMessage = "You will receive your refund in cash.";
  } else if (refundMethod.includes("No Refund Needed")) {
    refundMessage = "You have indicated that no refund is needed for this order.";
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Refund Request Update</title>
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
      margin: 0 auto;
      max-width: 120px;
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
  <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td>
        <div class="email-content">
          <div class="email-header">
            <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo" />
            <h2>Refund Request Update</h2>
          </div>
          <div class="email-body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>
              You requested a refund for your order
              <strong>#${orderId}</strong> (<b>${productName}</b>).
            </p>
            <div class="status-badge">Status: ${orderStatus}</div>
            <p>${refundMessage}</p>
            ${
              refundMethod.includes("No Refund Needed")
                ? ""
                : `<p>If applicable, please allow <strong>3–5 business days</strong> for your request to be processed.</p>`
            }
          </div>
          <div class="email-footer">
            <p>
              Need help? Contact us at
              <a href="mailto:gamjmerchandisehelp@gmail.com">
                gamjmerchandisehelp@gmail.com
              </a>
              <p style="margin-top: 15px;">
                © ${new Date().getFullYear()} GAMJ General Merchandise. All rights reserved.
              </p>
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
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
                        <p style="margin-top: 15px;">
                            © ${new Date().getFullYear()} GAMJ General Merchandise. All rights reserved.
                        </p>
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
                        <p style="margin-top: 15px;">
                            © ${new Date().getFullYear()} GAMJ General Merchandise. All rights reserved.
                        </p>
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
                        <p style="margin-top: 15px;">
                            © ${new Date().getFullYear()} GAMJ General Merchandise. All rights reserved.
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
}


export const userAccountApprovalTemplate = (userName) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved</title>
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

        .approved-title {
            font-size: 26px;
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 20px;
        }

        .highlight-text {
            font-weight: bold;
            color: #2e7d32;
        }

        /* Footer */
        .email-footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
        }

        .email-footer a {
            color: #2e7d32;
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
                        <h2 class="approved-title">Your Account Has Been Approved!</h2>

                        <p>Hi <b>${userName}</b>,</p>

                        <p>
                            We’re happy to inform you that your account has been 
                            <span class="highlight-text">successfully approved</span> and is now fully active.
                        </p>

                        <p>
                            You can now log in to explore our product and make your first purchase.
                        </p>

                        <p>
                            Thank you for choosing <b>GAMJ General Merchandise</b>.  
                            We look forward to serving your medical supply needs.
                        </p>
                    </div>

                    <!-- Footer Section -->
                    <div class="email-footer">
                        <p>If you have any questions or need assistance, feel free to reach out.</p>
                        <p>Email us at:  
                            <a href="mailto:gamjmerchandisehelp@gmail.com" target="_blank">
                                gamjmerchandisehelp@gmail.com
                            </a>
                        </p>
                        <p style="margin-top: 15px;">
                            © ${new Date().getFullYear()} GAMJ General Merchandise. All rights reserved.
                        </p>
                    </div>

                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
};


export const userAccountRejectedTemplate = (userName, rejectTitle, rejectMessage) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Rejected</title>
    <style>
        body, table, td, a {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        img {
            border: 0;
            display: block;
            margin: 0 auto; /* Ensures image is centered in email */
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
            text-align: center; /* Centers all inner content */
        }

        .email-header img {
            max-width: 140px;
            margin-bottom: 20px;
        }

        .rejected-title {
            font-size: 26px;
            font-weight: bold;
            color: #c62828;
            margin-bottom: 20px;
        }

        .reason-title {
            font-size: 18px;
            font-weight: bold;
            color: #c62828;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .reason-message {
            font-size: 15px;
            color: #444444;
            margin: 10px auto 25px auto;
            padding: 12px 15px;
            background-color: #ffe6e6;
            border-left: 4px solid #c62828;
            border-radius: 4px;
            text-align: left;
            max-width: 90%;
            display: block;
        }

        .email-footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
        }

        .email-footer a {
            color: #2e7d32;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>

<body>
    <table class="email-container" role="presentation" width="100%">
        <tr>
            <td align="center">
                <div class="email-content">

                    <!-- Centered Logo -->
                    <div class="email-header">
                        <img src="cid:gamj_logo" alt="GAMJ General Merchandise Logo">
                    </div>

                    <h2 class="rejected-title">Your Account Has Been Rejected</h2>

                    <p>Hi <b>${userName}</b>,</p>

                    <p>
                        We have reviewed your account application, and unfortunately,
                        we are unable to approve it at this time.
                    </p>

                    <p class="reason-title">Reason for Rejection:</p>

                    <div class="reason-message">
                        <b>Title: ${rejectTitle}</b><br>
                        <b>Message: </b>${rejectMessage}
                    </div>

                    <p>
                        For questions or clarifications, feel free to reach out to our support team.
                    </p>

                    <div class="email-footer">
                        <p>Need help? Contact us:</p>
                        <p>
                            <a href="mailto:gamjmerchandisehelp@gmail.com">
                                gamjmerchandisehelp@gmail.com
                            </a>
                        </p>
                        <p style="margin-top: 15px;">
                            © ${new Date().getFullYear()} GAMJ General Merchandise. All rights reserved.
                        </p>
                    </div>

                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
};


export const userAccountCreatedTemplate = (userName) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Created Successfully</title>
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
        .success-title {
            font-size: 26px;
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 20px;
        }
        .highlight-text {
            font-weight: bold;
            color: #2e7d32;
        }
        /* Footer */
        .email-footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
        }
        .email-footer a {
            color: #2e7d32;
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
                        <h2 class="success-title">Your Account Has Been Activated!</h2>
                        
                        <p>Hi <b>${userName}</b>,</p>
                        
                        <p>
                            Great news! Your account has been <span class="highlight-text">successfully approved</span> 
                            and is now fully active.
                        </p>
                        
                        <p>
                            You can now <b>log in</b> and access the GAMJ General Merchandise platform 
                            with your credentials.
                        </p>
                        
                        <p>
                            Thank you for being part of <b>GAMJ General Merchandise</b>.  
                            We look forward to working with you!
                        </p>
                    </div>
                    
                    <!-- Footer Section -->
                    <div class="email-footer">
                        <p>If you have any questions or need assistance, our support team is here to help.</p>
                        <p>Email us at:  
                            <a href="mailto:gamjmerchandisehelp@gmail.com" target="_blank">
                                gamjmerchandisehelp@gmail.com
                            </a>
                        </p>
                        <p style="margin-top: 15px;">
                            © ${new Date().getFullYear()} GAMJ General Merchandise. All rights reserved.
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
};