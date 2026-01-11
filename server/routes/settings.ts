import { Router } from "express";
import { db } from "../db";
import { settings } from "@shared/schema";
import { settingsSchema, type Settings } from "@shared/settings-schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get all settings
router.get("/", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
    }

    try {
        const allSettings = await db.select().from(settings);

        // Convert to object format
        const settingsObj: Partial<Settings> = {
            store: {
                storeName: "",
                storeEmail: "",
                storePhone: "",
                storeAddress: "",
                storeCity: "",
                storeZipCode: "",
                storeCountry: "",
                storeCurrency: "",
                storeTimezone: ""
            },
            payment: {
                mpesaEnabled: false,
                stripeEnabled: false,
                paypalEnabled: false,
                codEnabled: false
            },
            shipping: {
                freeShippingThreshold: 0,
                standardShippingCost: 0,
                expressShippingCost: 0,
                standardShippingDays: "",
                expressShippingDays: "",
                allowPickup: false,
                pickupLocations: []
            },
            tax: {
                taxEnabled: false,
                taxRate: 0,
                taxName: "",
                pricesIncludeTax: false
            },
            email: {
                smtpSecure: false,
                orderConfirmationEnabled: false,
                orderShippedEnabled: false,
                orderDeliveredEnabled: false,
                newsletterEnabled: false
            },
            seo: {
                siteTitle: "",
                siteDescription: "",
                metaRobots: ""
            },
            security: {
                enableRateLimiting: false,
                maxLoginAttempts: 0,
                sessionTimeout: 0,
                requireEmailVerification: false,
                enableTwoFactor: false,
                allowGuestCheckout: false
            },
            loyalty: {
                loyaltyEnabled: false,
                pointsPerCurrency: 0,
                pointsValue: 0,
                minimumRedemption: 0
            },
            inventory: {
                lowStockThreshold: 0,
                trackInventory: false,
                allowBackorders: false,
                notifyLowStock: false
            },
        };

        allSettings.forEach((setting) => {
            const [category, key] = setting.key.split(".");
            // Verify category exists in the defined settings object before accessing
            if (category && category in settingsObj) {
                const section = settingsObj[category as keyof Settings];
                if (section) {
                    (section as Record<string, unknown>)[key] = setting.value;
                }
            }
        });

        res.json(settingsObj);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An error occurred";
        res.status(500).json({ message });
    }
});

// Update settings
router.put("/", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
    }

    try {
        const validatedSettings = settingsSchema.parse(req.body);

        // Flatten settings object
        const updates: Array<{ key: string; value: unknown }> = [];

        Object.entries(validatedSettings).forEach(([category, categorySettings]) => {
            Object.entries(categorySettings as object).forEach(([key, value]) => {
                updates.push({ key: `${category}.${key}`, value });
            });
        });

        // Update or insert each setting
        for (const update of updates) {
            const existing = await db
                .select()
                .from(settings)
                .where(eq(settings.key, update.key))
                .limit(1);

            if (existing.length > 0) {
                await db
                    .update(settings)
                    .set({ value: update.value, updatedAt: new Date() })
                    .where(eq(settings.key, update.key));
            } else {
                await db.insert(settings).values({
                    key: update.key,
                    value: update.value,
                });
            }
        }

        res.json({ message: "Settings updated successfully" });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An error occurred";
        res.status(400).json({ message });
    }
});

// Get specific setting category
router.get("/:category", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
    }

    try {
        const { category } = req.params;
        const categorySettings = await db
            .select()
            .from(settings)
            .where(eq(settings.key, `${category}.%`));

        const settingsObj: Record<string, unknown> = {};
        categorySettings.forEach((setting) => {
            const key = setting.key.split(".")[1];
            settingsObj[key] = setting.value;
        });

        res.json(settingsObj);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An error occurred";
        res.status(500).json({ message });
    }
});

export default router;
