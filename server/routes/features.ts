import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertFlashSaleSchema, insertFlashSaleProductSchema, insertGiftCardSchema, type InsertFlashSaleProduct } from "@shared/schema";

export const featuresRouter = Router();

// Loyalty Program
featuresRouter.get("/loyalty/points", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const points = await storage.getUserLoyaltyPoints(req.user!.id);
    res.json({ points });
});

// Flash Sales
featuresRouter.get("/flash-sales", async (req, res) => {
    const sales = await storage.getFlashSales(true); // Active only for public
    res.json(sales);
});

featuresRouter.get("/flash-sales/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid ID");
    const sale = await storage.getFlashSale(id);
    if (!sale) return res.status(404).send("Flash sale not found");
    res.json(sale);
});

// Multi-Currency
featuresRouter.get("/currencies", async (req, res) => {
    const currencies = await storage.getCurrencies();
    res.json(currencies);
});

// Gift Cards
featuresRouter.post("/gift-cards/verify", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).send("Code required");
    const card = await storage.getGiftCardByCode(code);
    if (!card) return res.status(404).send("Invalid or inactive gift card");

    if (card.expiresAt && new Date(card.expiresAt) < new Date()) {
        return res.status(400).send("Gift card has expired");
    }

    res.json(card);
});

// Smart Recommendations
featuresRouter.get("/products/:id/recommendations", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid ID");

    const [frequentlyBought, recommended] = await Promise.all([
        storage.getFrequentlyBoughtTogether(id),
        storage.getRecommendedProducts(req.user?.id || null)
    ]);

    res.json({
        frequentlyBought,
        recommended: recommended.filter(p => p.id !== id).slice(0, 4)
    });
});

featuresRouter.get("/recommendations/personal", async (req, res) => {
    const recommended = await storage.getRecommendedProducts(req.user?.id || null);
    res.json(recommended);
});

// ADMIN ROUTES
featuresRouter.get("/admin/flash-sales", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    const sales = await storage.getFlashSales(false);
    res.json(sales);
});

featuresRouter.post("/admin/flash-sales", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    const { sale, products } = req.body;

    const saleResult = insertFlashSaleSchema.safeParse(sale);
    if (!saleResult.success) return res.status(400).json(saleResult.error);

    if (!Array.isArray(products)) return res.status(400).send("Products array required");

    const productsResult = z.array(insertFlashSaleProductSchema.omit({ flashSaleId: true })).safeParse(products);
    if (!productsResult.success) return res.status(400).json(productsResult.error);

    const newSale = await storage.createFlashSale(saleResult.data, productsResult.data as unknown as InsertFlashSaleProduct[]);
    res.status(201).json(newSale);
});

featuresRouter.get("/admin/currencies", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    // We reuse storage.getCurrencies but maybe we want inactive ones too? 
    // For now let's just use what's there.
    const currenciesList = await storage.getCurrencies();
    res.json(currenciesList);
});

featuresRouter.post("/admin/gift-cards", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    const result = insertGiftCardSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    const card = await storage.createGiftCard({
        ...result.data,
        senderId: req.user!.id
    });
    res.status(201).json(card);
});
