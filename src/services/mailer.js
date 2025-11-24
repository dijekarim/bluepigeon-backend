const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: process.env.NODE_ENV === "development"
    ? { rejectUnauthorized: false }  // only in dev
    : undefined, 
});

async function sendOtp(email, otp) {
  return transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
    html: `<p>Your OTP is <b>${otp}</b></p>`
  });
}

module.exports = { sendOtp };
