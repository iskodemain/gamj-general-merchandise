// import nodemailer from 'nodemailer';

// export const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GAMJ_EMAIL,
//     pass: process.env.GAMJ_PASSWORD,
//   },
// });


// // ADD THIS - will print exact error in Render Logs on startup
// transporter.verify(function (error, success) {
//   if (error) {
//     console.log('❌ Mailer error:', error);
//   } else {
//     console.log('✅ Mailer is ready to send emails');
//   }
// });


// export const sendMail = async ({ to, subject, html, attachments }) => {
//   return transporter.sendMail({
//     from: `Verification Code ${process.env.GAMJ_EMAIL}`,
//     to,
//     subject,
//     html,
//     attachments,
//   });
// };

// export const orderSendMail = async ({ to, subject, html, attachments }) => {
//   return transporter.sendMail({
//     from: `Order Status ${process.env.GAMJ_EMAIL}`,
//     to,
//     subject,
//     html,
//     attachments,
//   });
// };

// export const accountSendMail = async ({ to, subject, html, attachments }) => {
//   return transporter.sendMail({
//     from: `Account Update ${process.env.GAMJ_EMAIL}`,
//     to,
//     subject,
//     html,
//     attachments,
//   });
// };



import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generic send function
export const sendMail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: `Verification Code <${process.env.RESEND_EMAIL}>`,
      to,
      subject,
      html
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Email sent:', data);
    }
    return data;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Mailer error: Email sending failed');
    } else {
      console.error('[DEV ERROR] Mailer failed:', error);
    }
    throw error;
  }
};

// Specialized wrappers
export const orderSendMail = async ({ to, subject, html }) => {
  return sendMail({
    from: `Order Status <${process.env.RESEND_EMAIL}>`,
    to,
    subject,
    html
  });
};

export const accountSendMail = async ({ to, subject, html }) => {
  return sendMail({
    from: `Account Update <${process.env.RESEND_EMAIL}>`,
    to,
    subject,
    html
  });
};