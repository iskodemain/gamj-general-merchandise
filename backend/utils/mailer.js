import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,           // try 587 instead of letting 'service: gmail' decide
  secure: false,       // false for port 587 (STARTTLS)
  auth: {
    user: process.env.GAMJ_EMAIL,
    pass: process.env.GAMJ_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false   // important for Render's environment
  }
});


export const sendMail = async ({ to, subject, html, attachments }) => {
  return transporter.sendMail({
    from: `Verification Code ${process.env.GAMJ_EMAIL}`,
    to,
    subject,
    html,
    attachments,
  });
};

export const orderSendMail = async ({ to, subject, html, attachments }) => {
  return transporter.sendMail({
    from: `Order Status ${process.env.GAMJ_EMAIL}`,
    to,
    subject,
    html,
    attachments,
  });
};

export const accountSendMail = async ({ to, subject, html, attachments }) => {
  return transporter.sendMail({
    from: `Account Update ${process.env.GAMJ_EMAIL}`,
    to,
    subject,
    html,
    attachments,
  });
};
