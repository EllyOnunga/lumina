/**
 * Security Middleware
 * Implements various security best practices for production e-commerce
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * CSRF Protection Middleware
 * Generates and validates CSRF tokens for state-changing operations
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    // Skip CSRF for webhook endpoints (they use signature verification)
    if (req.path.includes("/webhook")) {
        return next();
    }

    const token = req.headers["x-csrf-token"] as string;
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
        return res.status(403).json({ error: "Invalid CSRF token" });
    }

    next();
}

/**
 * Generate CSRF token for session
 */
export function generateCsrfToken(req: Request, res: Response, next: NextFunction) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString("hex");
    }
    next();
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, "") // Remove < and >
        .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Fraud Detection Middleware
 * Basic fraud detection for suspicious orders
 */
export function fraudDetection(req: Request, res: Response, next: NextFunction) {
    // Check for suspicious patterns
    const suspiciousPatterns = {
        // Multiple orders from same IP in short time
        rapidOrders: false,
        // Unusually high order value
        highValue: false,
        // Mismatched shipping/billing info
        addressMismatch: false,
    };

    // Get order details
    const { total, items } = req.body;

    // Check for unusually high order value (>$10,000)
    if (total && total > 10000) {
        suspiciousPatterns.highValue = true;
        console.warn(`[FRAUD ALERT] High value order: $${total} from IP: ${req.ip}`);
    }

    // Check for large quantity of single item
    if (items && Array.isArray(items)) {
        const hasLargeQuantity = items.some((item: { quantity: number }) => item.quantity > 10);
        if (hasLargeQuantity) {
            console.warn(`[FRAUD ALERT] Large quantity order from IP: ${req.ip}`);
        }
    }

    // Log suspicious activity but don't block (manual review)
    if (Object.values(suspiciousPatterns).some(v => v)) {
        console.warn(`[FRAUD ALERT] Suspicious order detected from IP: ${req.ip}`, suspiciousPatterns);
        // In production, you might want to flag this order for manual review
        // or integrate with a fraud detection service like Stripe Radar
    }

    next();
}

/**
 * Request logging for security audit
 */
export function securityLogger(req: Request, res: Response, next: NextFunction) {
    const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        userId: req.user?.id || "anonymous",
    };

    // Log sensitive operations
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        console.log("[SECURITY]", JSON.stringify(logData));
    }

    next();
}

/**
 * PCI DSS Compliance helpers
 * Note: Never store full card numbers, CVV, or PINs
 */
export function maskCardNumber(cardNumber: string): string {
    // Only show last 4 digits
    return `****-****-****-${cardNumber.slice(-4)}`;
}

/**
 * Validate strong password
 */
export function isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
}

/**
 * Session security configuration
 */
export const sessionConfig = {
    name: "lumina.sid", // Custom session name (don't use default)
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        httpOnly: true, // Prevent XSS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "strict" as const, // CSRF protection
    },
};
