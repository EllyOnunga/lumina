import nodemailer from "nodemailer";

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

// In a real-world scenario, you would use environment variables
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER || "mock_user",
        pass: process.env.EMAIL_PASS || "mock_pass",
    },
});

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: `"Lumina Marketplace" <${process.env.EMAIL_FROM || "no-reply@lumina.com"}>`,
            to,
            subject,
            text,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        // In production, you might want to retry or use a queue
    }
}

export async function sendWelcomeEmail(email: string, username: string) {
    await sendEmail({
        to: email,
        subject: "Welcome to Lumina Marketplace!",
        text: `Hi ${username}, welcome to our marketplace! We're glad to have you here.`,
        html: `<h1>Welcome, ${username}!</h1><p>We're glad to have you at Lumina Marketplace.</p>`,
    });
}

export async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.APP_URL || "http://localhost:5000"}/verify-email?token=${token}`;
    await sendEmail({
        to: email,
        subject: "Verify your email - Lumina Marketplace",
        text: `Please verify your email by clicking: ${verificationUrl}`,
        html: `<h1>Email Verification</h1><p>Please click the link below to verify your email:</p><a href="${verificationUrl}">Verify Email</a>`,
    });
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.APP_URL || "http://localhost:5000"}/reset-password?token=${token}`;
    await sendEmail({
        to: email,
        subject: "Reset your password - Lumina Marketplace",
        text: `Reset your password by clicking: ${resetUrl}. This link expires in 1 hour.`,
        html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; margin: 16px 0;">Reset Password</a>
      <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    `,
    });
}

export async function sendOrderConfirmationEmail(
    email: string,
    orderDetails: {
        orderId: number;
        customerName: string;
        items: { name: string; quantity: number; price: number }[];
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
    }
) {
    const itemsHtml = orderDetails.items
        .map(
            (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">KSH ${(item.price / 100).toFixed(2)}</td>
      </tr>
    `
        )
        .join("");

    await sendEmail({
        to: email,
        subject: `Order Confirmation #${orderDetails.orderId} - Lumina Marketplace`,
        text: `Thank you for your order! Order #${orderDetails.orderId} has been received. Total: KSH ${(orderDetails.total / 100).toFixed(2)}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 16px;">Order Confirmation</h1>
        <p>Hi ${orderDetails.customerName},</p>
        <p>Thank you for your order! We've received your order and will process it shortly.</p>
        
        <div style="background: #f5f5f5; padding: 16px; margin: 24px 0;">
          <h2 style="margin: 0 0 8px 0; font-size: 16px;">Order #${orderDetails.orderId}</h2>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr style="background: #000; color: #fff;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin: 24px 0;">
          <p style="margin: 4px 0;">Subtotal: <strong>KSH ${(orderDetails.subtotal / 100).toFixed(2)}</strong></p>
          <p style="margin: 4px 0;">Tax: <strong>KSH ${(orderDetails.tax / 100).toFixed(2)}</strong></p>
          <p style="margin: 4px 0;">Shipping: <strong>KSH ${(orderDetails.shipping / 100).toFixed(2)}</strong></p>
          <p style="margin: 12px 0 0 0; font-size: 18px; border-top: 2px solid #000; padding-top: 12px;">
            Total: <strong>KSH ${(orderDetails.total / 100).toFixed(2)}</strong>
          </p>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 32px;">
          You can track your order status in your account dashboard.
        </p>
      </div>
    `,
    });
}

export async function sendShippingUpdateEmail(
    email: string,
    orderDetails: {
        orderId: number;
        customerName: string;
        status: string;
        trackingNumber?: string;
    }
) {
    await sendEmail({
        to: email,
        subject: `Shipping Update: Order #${orderDetails.orderId} - Lumina Marketplace`,
        text: `Your order #${orderDetails.orderId} status: ${orderDetails.status}${orderDetails.trackingNumber ? `. Tracking: ${orderDetails.trackingNumber}` : ""}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Shipping Update</h1>
        <p>Hi ${orderDetails.customerName},</p>
        <p>Your order #${orderDetails.orderId} has been updated:</p>
        
        <div style="background: #f5f5f5; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 18px;"><strong>Status:</strong> ${orderDetails.status}</p>
          ${orderDetails.trackingNumber ? `<p style="margin: 8px 0 0 0;"><strong>Tracking Number:</strong> ${orderDetails.trackingNumber}</p>` : ""}
        </div>

        <p>Thank you for shopping with Lumina Marketplace!</p>
      </div>
    `,
    });
}
