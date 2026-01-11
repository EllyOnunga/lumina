import { z } from "zod";

// Store Settings Schema
export const storeSettingsSchema = z.object({
    storeName: z.string().min(1, "Store name is required"),
    storeEmail: z.string().email("Invalid email"),
    storePhone: z.string().min(10, "Phone number must be at least 10 characters"),
    storeAddress: z.string().min(5, "Address is required"),
    storeCity: z.string().min(2, "City is required"),
    storeZipCode: z.string().min(3, "Zip code is required"),
    storeCountry: z.string().min(2, "Country is required"),
    storeCurrency: z.string().default("KES"),
    storeTimezone: z.string().default("Africa/Nairobi"),
    storeLogo: z.string().optional(),
    storeFavicon: z.string().optional(),
});

// Payment Settings Schema
export const paymentSettingsSchema = z.object({
    mpesaEnabled: z.boolean().default(true),
    mpesaConsumerKey: z.string().optional(),
    mpesaConsumerSecret: z.string().optional(),
    mpesaShortcode: z.string().optional(),
    mpesaPasskey: z.string().optional(),
    stripeEnabled: z.boolean().default(false),
    stripePublicKey: z.string().optional(),
    stripeSecretKey: z.string().optional(),
    paypalEnabled: z.boolean().default(false),
    paypalClientId: z.string().optional(),
    paypalClientSecret: z.string().optional(),
    codEnabled: z.boolean().default(true),
});

// Shipping Settings Schema
export const shippingSettingsSchema = z.object({
    freeShippingThreshold: z.number().min(0).default(0),
    standardShippingCost: z.number().min(0).default(500),
    expressShippingCost: z.number().min(0).default(1500),
    standardShippingDays: z.string().default("3-5 business days"),
    expressShippingDays: z.string().default("1-2 business days"),
    allowPickup: z.boolean().default(true),
    pickupLocations: z.array(z.string()).default([]),
});

// Tax Settings Schema
export const taxSettingsSchema = z.object({
    taxEnabled: z.boolean().default(true),
    taxRate: z.number().min(0).max(100).default(16),
    taxName: z.string().default("VAT"),
    pricesIncludeTax: z.boolean().default(false),
});

// Email Settings Schema
export const emailSettingsSchema = z.object({
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    smtpSecure: z.boolean().default(true),
    emailFrom: z.string().email().optional(),
    emailFromName: z.string().optional(),
    orderConfirmationEnabled: z.boolean().default(true),
    orderShippedEnabled: z.boolean().default(true),
    orderDeliveredEnabled: z.boolean().default(true),
    newsletterEnabled: z.boolean().default(true),
});

// SEO Settings Schema
export const seoSettingsSchema = z.object({
    siteTitle: z.string().min(1, "Site title is required"),
    siteDescription: z.string().min(10, "Description must be at least 10 characters"),
    siteKeywords: z.string().optional(),
    googleAnalyticsId: z.string().optional(),
    facebookPixelId: z.string().optional(),
    metaRobots: z.string().default("index, follow"),
});

// Security Settings Schema
export const securitySettingsSchema = z.object({
    enableRateLimiting: z.boolean().default(true),
    maxLoginAttempts: z.number().min(1).default(5),
    sessionTimeout: z.number().min(1).default(30),
    requireEmailVerification: z.boolean().default(true),
    enableTwoFactor: z.boolean().default(false),
    allowGuestCheckout: z.boolean().default(true),
});

// Loyalty Settings Schema
export const loyaltySettingsSchema = z.object({
    loyaltyEnabled: z.boolean().default(true),
    pointsPerCurrency: z.number().min(0).default(1),
    pointsValue: z.number().min(0).default(1),
    minimumRedemption: z.number().min(0).default(100),
});

// Inventory Settings Schema
export const inventorySettingsSchema = z.object({
    trackInventory: z.boolean().default(true),
    lowStockThreshold: z.number().min(0).default(5),
    allowBackorders: z.boolean().default(false),
    notifyLowStock: z.boolean().default(true),
    lowStockEmail: z.string().email().optional(),
});

// Combined Settings Schema
export const settingsSchema = z.object({
    store: storeSettingsSchema,
    payment: paymentSettingsSchema,
    shipping: shippingSettingsSchema,
    tax: taxSettingsSchema,
    email: emailSettingsSchema,
    seo: seoSettingsSchema,
    security: securitySettingsSchema,
    loyalty: loyaltySettingsSchema,
    inventory: inventorySettingsSchema,
});

export type StoreSettings = z.infer<typeof storeSettingsSchema>;
export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;
export type ShippingSettings = z.infer<typeof shippingSettingsSchema>;
export type TaxSettings = z.infer<typeof taxSettingsSchema>;
export type EmailSettings = z.infer<typeof emailSettingsSchema>;
export type SEOSettings = z.infer<typeof seoSettingsSchema>;
export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
export type LoyaltySettings = z.infer<typeof loyaltySettingsSchema>;
export type InventorySettings = z.infer<typeof inventorySettingsSchema>;
export type Settings = z.infer<typeof settingsSchema>;
