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