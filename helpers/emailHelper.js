const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || "gmail",
  auth: {
    user: process.env.SMTP_NAME,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(email, username, token) {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:8000";
  const verifyUrl = `${baseUrl}/api/v1/auth/verify-email/${token}`;

  const mailOptions = {
    from: `"Administration App" <${process.env.SMTP_NAME}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 500px; margin: auto;">
        <h2 style="color: #2563eb;">Administration App</h2>
        <p>Hello <b>${username}</b>,</p>
        <p>Thank you for registering! Please click the button below to verify your email address:</p>
        <p style="margin: 25px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>Or copy this link: <br/> <a href="${verifyUrl}">${verifyUrl}</a></p>
        <p style="color: gray; font-size: 12px;">This link will expire in 24 hours.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendPasswordResetEmail(email, token) {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:8000";
  const resetUrl = `${baseUrl}/api/v1/auth/reset-password/${token}`;

  const mailOptions = {
    from: `"Administration App" <${process.env.SMTP_NAME}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 500px; margin: auto;">
        <h2 style="color: #2563eb;">Reset Your Password</h2>
        <p>You requested to reset your password. This link is valid for 1 hour.</p>
        <p>Reset API URL: <a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: gray; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
