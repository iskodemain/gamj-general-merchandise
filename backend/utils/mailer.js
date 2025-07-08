import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GAMJ_EMAIL,
    pass: process.env.GAMJ_PASSWORD,
  },
});


export const sendMail = async ({ to, subject, html, attachments }) => {
  return transporter.sendMail({
    from: `Verification Code ${process.env.AOS_EMAIL}`,
    to,
    subject,
    html,
    attachments,
  });
};