import { Router } from "express";
import { storage } from "../storage";
import { sendPasswordResetEmail, sendVerificationEmail } from "../email";
import { randomBytes } from "crypto";
import { scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

export const authRouter = Router();

// Request password reset
authRouter.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send("Email is required");
        }

        const user = await storage.getUserByEmail(email);
        if (!user) {
            // Don't reveal if email exists
            return res.json({ message: "If that email exists, a reset link has been sent." });
        }

        // Generate reset token
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await storage.createPasswordResetToken(user.id, token, expiresAt);

        // Send email (non-blocking)
        sendPasswordResetEmail(email, token).catch(err =>
            console.error("Failed to send password reset email:", err)
        );

        res.json({ message: "If that email exists, a reset link has been sent." });
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).send("An error occurred");
    }
});

// Reset password with token
authRouter.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).send("Token and password are required");
        }

        const resetToken = await storage.getPasswordResetToken(token);
        if (!resetToken || resetToken.expiresAt < new Date()) {
            return res.status(400).send("Invalid or expired reset token");
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update user password
        await storage.updateUser(resetToken.userId, { password: hashedPassword });

        // Delete used token
        await storage.deletePasswordResetToken(token);

        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).send("An error occurred");
    }
});

// Request email verification
authRouter.post("/resend-verification", async (req, res) => {
    try {
        if (!req.isAuthenticated()) return res.sendStatus(401);

        const user = req.user!;
        if (user.isEmailVerified) {
            return res.status(400).send("Email already verified");
        }

        if (!user.email) {
            return res.status(400).send("No email associated with account");
        }

        // Generate verification token
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await storage.createEmailVerificationToken(user.id, token, expiresAt);

        // Send email (non-blocking)
        sendVerificationEmail(user.email, token).catch(err =>
            console.error("Failed to send verification email:", err)
        );

        res.json({ message: "Verification email sent" });
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).send("An error occurred");
    }
});

// Verify email with token
authRouter.post("/verify-email", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).send("Token is required");
        }

        const verificationToken = await storage.getEmailVerificationToken(token);
        if (!verificationToken || verificationToken.expiresAt < new Date()) {
            return res.status(400).send("Invalid or expired verification token");
        }

        // Update user email verification status
        await storage.updateUser(verificationToken.userId, { isEmailVerified: true });

        // Delete used token
        await storage.deleteEmailVerificationToken(token);

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).send("An error occurred");
    }
});
