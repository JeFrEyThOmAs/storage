import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,   // your gmail
    pass: process.env.EMAIL_PASS,   // app password
  },
});

export async function sendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Upsert OTP (replace if it already exists)
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true }
  );

  const html = `
    <div style="font-family:sans-serif;">
      <h2>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `Storage App <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Storage App OTP",
    html,
  });

  return { success: true, message: `OTP sent successfully on ${email}` };
}