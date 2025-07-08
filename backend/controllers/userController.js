


// CUSTOMER LOGIN
const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await Customer.findOne({where: {email}});
        if (!user) {
            return res.json({success: false, message:"This user does not exist."});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = createToken(user.customer_id);
            return res.json({success: true, message: "Login Succesfully", token});
        }
        else {
            return res.json({success: false, message:"Invalid Credentials"});
        }


    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// CUSTOMER REGISTRATION
let tempUserData = {};
const registerUser = async (req, res) => {
    try {
        const {medicalInstitutionName, contactNumber, landlineNumber, emailAddress, fullAddress, imageProof, repFirstName, repLastName, repContactNumber, repEmailAddress, repJobPosition, loginPhoneNum, loginEmail, loginPassword} = req.body;

        if (!medicalInstitutionName || !contactNumber || !emailAddress || !fullAddress || !imageProof || !repFirstName || !repLastName || !repContactNumber || !repEmailAddress ||!repJobPosition) {
            return res.json({ success: false, message: "Please complete all fields in the account details to proceed with account creation." });
        }

        if (loginEmail && !loginPhoneNum) {
            // Validate email addres
            if (!validator.isEmail(email)) {
                return res.json({ success: false, message: "Please enter a valid email" });
            }
            // Check if user already exists
            const exists = await Customer.findOne({ where: { email } });
            if (exists) {
                return res.json({ success: false, message: "User already exists" });
            }
        }

        

        
        
        // PASSWORD VALIDATION
        if (!validator.isLength(password, { min: 8 })) {
            return res.json({success: false, message:"Password must be at least 8 characters long"});
        }
        if (!/[A-Z]/.test(password)) {
            return res.json({success: false, message:"Password must contain at least one uppercase letter."});
        }
        if (!/[a-z]/.test(password)) {
            return res.json({success: false, message:"Password must contain at least one lowercase letter."});
        }
        if (!/[0-9]/.test(password)) {
            return res.json({success: false, message:"Password must contain at least one number."});
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return res.json({success: false, message:"Password must contain at least one special character (e.g., !, @, #, $, etc.)."});
        }

        // Generate a verification code
        const verificationCode = generateVerificationCode();

        // Temporarily store user data
        tempUserData[email] = {
            user_name,
            email,
            password,
            verificationCode,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15-minute expiration
        };

        // Send verification email
        await transporter.sendMail({
            from: `Verification Code ${process.env.GAMJ_EMAIL}`,
            to: email,
            subject: 'Account Verification Code',
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Verification</title>
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
            color: #d53737;
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
            color: #d53737;
            text-decoration: none;
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
                        <img src="cid:aos_logo" alt="Company Logo">
                    </div>

                    <!-- Body Section -->
                    <div class="email-body">
                        <h2>Account Verification</h2>
                        <p>Greetings from Angle Online Store, Here's your 6-digit verification code:</p>
                        <div class="verification-code">${verificationCode}</div>
                        <p>This code will expire in <b>15 minutes.</b></p>
                        <p>Please enter the code to complete your account registration.</p>
                    </div>

                    <!-- Footer Section -->
                    <div class="email-footer">
                        <p>If you did not request a account verification, please disregard this email.</p>
                        <p>Need help? <a href="https://www.instagram.com/angleofficial_ph?igsh=MTQ0a2NrdmY4a2xjYw==" target='blank'>Message us in our instagram</a>.</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`,
attachments: [
    {
      filename: 'AOS.png',
      path: './controllers/emailsender/img/AOS.png',
      cid: 'aos_logo',
    },
  ],
        });

        res.json({ success: true, message: "Verification code sent to your email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error during registration.' });
    }
};