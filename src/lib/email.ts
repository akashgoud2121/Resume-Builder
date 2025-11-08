import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@resumebuilder.com',
      to: email,
      subject: 'Your OTP Code - Resume Builder',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #f9fafb; }
              .otp-box { background: white; border: 2px solid #4F46E5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
              .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; }
              .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Resume Builder</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email</h2>
                <p>Thank you for signing up! Please use the following OTP code to complete your registration:</p>
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Resume Builder. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Your OTP code is: ${otp}. This code will expire in 10 minutes.`,
    });
    return true;
  } catch (error) {
    return false;
  }
}



