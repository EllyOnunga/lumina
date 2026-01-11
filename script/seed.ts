
import "dotenv/config";
import { db } from "../server/db";
import {
    products, categories, productCategories, reviews, questions,
    inventory, orderItems, cartItems, wishlists, bundleItems,
    productTags, tags, settings, currencies
} from "../shared/schema";

async function seed() {
    console.log("Starting database seed...");

    try {
        // 1. Clean up existing data (Order matters due to FK constraints)
        console.log("Cleaning up old data...");
        // Child tables first
        await db.delete(productCategories);
        await db.delete(productTags);
        await db.delete(reviews);
        await db.delete(questions);
        await db.delete(inventory);
        await db.delete(cartItems);
        await db.delete(orderItems);
        await db.delete(wishlists);
        await db.delete(bundleItems);

        // Parent tables
        await db.delete(products);
        await db.delete(tags);
        await db.delete(categories);
        await db.delete(settings);
        await db.delete(currencies);

        console.log("Cleanup complete.");

        // 2. Seed Settings
        console.log("Seeding settings...");
        const defaultSettings = [
            { key: "store.storeName", value: "Lumina Store" },
            { key: "store.storeEmail", value: "info@lumina.store" },
            { key: "store.storePhone", value: "+254700000000" },
            { key: "store.storeAddress", value: "123 Main Street" },
            { key: "store.storeCity", value: "Nairobi" },
            { key: "store.storeZipCode", value: "00100" },
            { key: "store.storeCountry", value: "Kenya" },
            { key: "store.storeCurrency", value: "KES" },
            { key: "store.storeTimezone", value: "Africa/Nairobi" },
            { key: "payment.mpesaEnabled", value: true },
            { key: "payment.stripeEnabled", value: false },
            { key: "payment.paypalEnabled", value: false },
            { key: "payment.codEnabled", value: true },
            { key: "shipping.freeShippingThreshold", value: 500000 },
            { key: "shipping.standardShippingCost", value: 50000 },
            { key: "shipping.expressShippingCost", value: 150000 },
            { key: "shipping.standardShippingDays", value: "3-5 business days" },
            { key: "shipping.expressShippingDays", value: "1-2 business days" },
            { key: "shipping.allowPickup", value: true },
            { key: "tax.taxEnabled", value: true },
            { key: "tax.taxRate", value: 16 },
            { key: "tax.taxName", value: "VAT" },
            { key: "tax.pricesIncludeTax", value: false },
            { key: "email.orderConfirmationEnabled", value: true },
            { key: "email.orderShippedEnabled", value: true },
            { key: "email.orderDeliveredEnabled", value: true },
            { key: "email.newsletterEnabled", value: true },
            { key: "seo.siteTitle", value: "Lumina - Premium E-commerce Platform" },
            { key: "seo.siteDescription", value: "Your one-stop shop for quality products" },
            { key: "seo.metaRobots", value: "index, follow" },
            { key: "security.enableRateLimiting", value: true },
            { key: "security.maxLoginAttempts", value: 5 },
            { key: "security.sessionTimeout", value: 30 },
            { key: "security.requireEmailVerification", value: true },
            { key: "security.allowGuestCheckout", value: true },
            { key: "loyalty.loyaltyEnabled", value: true },
            { key: "loyalty.pointsPerCurrency", value: 1 },
            { key: "loyalty.pointsValue", value: 1 },
            { key: "loyalty.minimumRedemption", value: 100 },
            { key: "inventory.trackInventory", value: true },
            { key: "inventory.lowStockThreshold", value: 5 },
            { key: "inventory.allowBackorders", value: false },
            { key: "inventory.notifyLowStock", value: true },
        ];
        await db.insert(settings).values(defaultSettings);

        // 3. Seed Currencies
        console.log("Seeding currencies...");
        await db.insert(currencies).values([
            { code: "KES", symbol: "KSH", exchangeRate: "1.0", isBase: true, isActive: true },
            { code: "USD", symbol: "$", exchangeRate: "0.0078", isBase: false, isActive: true },
            { code: "EUR", symbol: "€", exchangeRate: "0.0072", isBase: false, isActive: true },
            { code: "GBP", symbol: "£", exchangeRate: "0.0062", isBase: false, isActive: true },
        ]);

        // 4. Define Categories
        const categoriesData = [
            { name: "Men", slug: "men", description: "Modern styling for the contemporary man." },
            { name: "Women", slug: "women", description: "Elegant and trendy fashion for women." },
            { name: "Accessories", slug: "accessories", description: "The perfect additions to any outfit." },
            { name: "Footwear", slug: "footwear", description: "Comfort and style for every step." },
            { name: "Electronics", slug: "electronics", description: "Cutting-edge gadgets and tech essentials." },
            { name: "Home & Living", slug: "home-living", description: "Beautiful items for a comfortable home." },
            { name: "Beauty", slug: "beauty", description: "Premium skincare and cosmetic products." },
            { name: "Sports", slug: "sports", description: "Gear and apparel for the active lifestyle." },
            { name: "Kids", slug: "kids", description: "Quality toys and clothing for the little ones." }
        ];

        const categoryMap = new Map<string, number>();

        // 5. Insert Categories
        for (const cat of categoriesData) {
            const [newCat] = await db.insert(categories).values(cat).returning();
            categoryMap.set(cat.name, newCat.id);
            console.log(`Created category: ${cat.name}`);
        }

        // 6. Define Products (5 per category)
        const productsData = {
            "Men": [
                {
                    name: "Classic White Crew Neck",
                    description: "Essential organic cotton t-shirt with a perfect fit. Breathable, durable, and timeless.",
                    price: 2500,
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800",
                    stock: 45,
                    isFeatured: true,
                    attributes: { color: ["White", "Black", "Grey"], size: ["S", "M", "L", "XL"] }
                },
                {
                    name: "Vintage Denim Trucker",
                    description: "Rugged denim jacket with vintage wash. Featuring classic button closure and chest pockets.",
                    price: 8900,
                    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800",
                    stock: 20,
                    isNewArrival: true,
                    attributes: { size: ["M", "L", "XL"] }
                },
                {
                    name: "Urban Zip Hoodie",
                    description: "Heavyweight fleece hoodie for chilly evenings. Relaxed fit with durable zipper.",
                    price: 5500,
                    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800",
                    stock: 30,
                    attributes: { color: ["Black", "Navy", "Olive"], size: ["S", "M", "L", "XL"] }
                },
                {
                    name: "Smart Chino Shorts",
                    description: "Tailored shorts made from stretch cotton twill. Perfect for casual summer days.",
                    price: 4500,
                    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800",
                    stock: 50,
                    attributes: { color: ["Beige", "Navy"], size: ["30", "32", "34", "36"] }
                },
                {
                    name: "Oxford Button-Down",
                    description: "A versatile wardrobe staple. Crisp cotton fabric suitable for work or weekend.",
                    price: 6000,
                    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800",
                    stock: 40,
                    isFeatured: true,
                    attributes: { color: ["Blue", "White", "Pink"], size: ["S", "M", "L", "XL"] }
                }
            ],
            "Women": [
                {
                    name: "Floral Midi Summer Dress",
                    description: "Lightweight and airy floral dress with a flattering waist tie. Perfect for garden parties.",
                    price: 7500,
                    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800",
                    stock: 25,
                    isNewArrival: true,
                    attributes: { size: ["XS", "S", "M", "L"] }
                },
                {
                    name: "High-Waist Sculpt Jeans",
                    description: "Premium denim with stretch technology that lifts and shapes. Classic indigo wash.",
                    price: 6500,
                    image: "https://images.unsplash.com/photo-1541099649105-df69f21f7063?auto=format&fit=crop&w=800",
                    stock: 60,
                    attributes: { size: ["24", "25", "26", "27", "28", "29", "30"] }
                },
                {
                    name: "Soft Knit Sweater",
                    description: "Ultra-soft wool blend sweater in a relaxed silhouette. Cozy and chic.",
                    price: 5900,
                    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800",
                    stock: 35,
                    isFeatured: true,
                    attributes: { color: ["Cream", "Grey", "Camel"], size: ["S", "M", "L"] }
                },
                {
                    name: "Pleated Midi Skirt",
                    description: "Elegant pleated skirt with metallic finish. Elastic waistband for comfort.",
                    price: 5200,
                    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800",
                    stock: 20,
                    attributes: { color: ["Black", "Gold", "Silver"], size: ["S", "M", "L"] }
                },
                {
                    name: "Silk Blouse",
                    description: "Luxurious pure silk blouse with button details. Elevates any work outfit.",
                    price: 8500,
                    image: "https://images.unsplash.com/photo-1551163943-3f6a29e39454?auto=format&fit=crop&w=800",
                    stock: 15,
                    attributes: { color: ["White", "Blush", "Navy"], size: ["XS", "S", "M", "L"] }
                }
            ],
            "Accessories": [
                {
                    name: "Minimalist Leather Watch",
                    description: "Sleek analog watch with genuine leather strap and stainless steel case.",
                    price: 12000,
                    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800",
                    stock: 50,
                    isNewArrival: true,
                    attributes: { color: ["Black/Silver", "Brown/Gold"] }
                },
                {
                    name: "Retro Aviator Sunglasses",
                    description: "Classic wire-frame aviators with UV400 protection lenses.",
                    price: 3500,
                    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800",
                    stock: 100,
                    attributes: { color: ["Gold/Green", "Silver/Blue", "Black/Grey"] }
                },
                {
                    name: "Slim Bifold Wallet",
                    description: "Handcrafted full-grain leather wallet with RFID blocking technology.",
                    price: 4500,
                    image: "https://images.unsplash.com/photo-1627123424574-181ce5171c98?auto=format&fit=crop&w=800",
                    stock: 60,
                    attributes: { color: ["Tan", "Dark Brown", "Black"] }
                },
                {
                    name: "Urban Commuter Backpack",
                    description: "Water-resistant canvas backpack with laptop compartment and padded straps.",
                    price: 9500,
                    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800",
                    stock: 25,
                    isFeatured: true,
                    attributes: { color: ["Black", "Grey", "Navy"] }
                },
                {
                    name: "Organic Cotton Cap",
                    description: "Classic six-panel baseball cap made from 100% organic cotton canvas.",
                    price: 2500,
                    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800",
                    stock: 80,
                    attributes: { color: ["Mustard", "Navy", "Burgundy", "Black"] }
                }
            ],
            "Footwear": [
                {
                    name: "Performance Knit Runners",
                    description: "Lightweight running shoes with breathable knit upper and responsive cushioning.",
                    price: 11000,
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800",
                    stock: 40,
                    isNewArrival: true,
                    attributes: { size: ["7", "8", "9", "10", "11", "12"], color: ["Red", "Blue", "Black"] }
                },
                {
                    name: "Chelsea Leather Boots",
                    description: "Timeless Chelsea boots with elastic side panels and durable rubber sole.",
                    price: 13500,
                    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b69f?auto=format&fit=crop&w=800",
                    stock: 30,
                    isFeatured: true,
                    attributes: { size: ["7", "8", "9", "10", "11"], color: ["Tan", "Black"] }
                },
                {
                    name: "Daily Trainer Sneakers",
                    description: "Versatile sneakers perfect for gym workouts or casual streetwear.",
                    price: 8900,
                    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800",
                    stock: 45,
                    attributes: { size: ["7", "8", "9", "10", "11"], color: ["White/Grey", "Black/White"] }
                },
                {
                    name: "Classic Suede Heels",
                    description: "Elegant pointed-toe pumps in soft suede. 3-inch heel height.",
                    price: 9500,
                    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800",
                    stock: 25,
                    attributes: { size: ["5", "6", "7", "8", "9"], color: ["Red", "Nude", "Black"] }
                },
                {
                    name: "Canvas Slip-Ons",
                    description: "Easy-wearing slip-on shoes with cushioned insole for all-day comfort.",
                    price: 4500,
                    image: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?auto=format&fit=crop&w=800",
                    stock: 60,
                    attributes: { size: ["7", "8", "9", "10", "11"], color: ["Black", "White", "Navy"] }
                }
            ],
            "Electronics": [
                {
                    name: "Premium Wireless Headphones",
                    description: "Noise-cancelling over-ear headphones with superior sound quality and 30-hour battery life.",
                    price: 35000,
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800",
                    stock: 15,
                    isFeatured: true,
                    attributes: { color: ["Black", "Silver", "Midnight Blue"] }
                },
                {
                    name: "Smart Fitness Watch",
                    description: "Track your health and workouts with this sleek, water-resistant smartwatch. GPS included.",
                    price: 22000,
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800",
                    stock: 25,
                    isNewArrival: true,
                    attributes: { color: ["Black", "Space Grey", "Rose Gold"] }
                },
                {
                    name: "Portable Bluetooth Speaker",
                    description: "Rugged, waterproof speaker with 360-degree sound. Ideal for outdoor adventures.",
                    price: 12500,
                    image: "https://images.unsplash.com/photo-1608156639585-3405c4f7a93b?auto=format&fit=crop&w=800",
                    stock: 40,
                    attributes: { color: ["Black", "Red", "Blue", "Green"] }
                },
                {
                    name: "4K Ultra-Wide Monitor",
                    description: "Boost your productivity with this stunning 34-inch curved display. IPS panel for vivid colors.",
                    price: 85000,
                    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800",
                    stock: 10,
                    attributes: { refresh_rate: ["144Hz", "165Hz"] }
                },
                {
                    name: "Mechanical Gaming Keyboard",
                    description: "Tactile and responsive keys with customizable RGB lighting. Built for durability.",
                    price: 15900,
                    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800",
                    stock: 30,
                    attributes: { switch_type: ["Blue", "Red", "Brown"] }
                }
            ],
            "Home & Living": [
                {
                    name: "Minimalist Ceramic Vase",
                    description: "Handcrafted ceramic vase with a matte finish. Perfect for modern floral arrangements.",
                    price: 3500,
                    image: "https://images.unsplash.com/photo-1581783598307-5bbe6fbd2047?auto=format&fit=crop&w=800",
                    stock: 20,
                    attributes: { color: ["Cream", "Terracotta", "Stone"] }
                },
                {
                    name: "Luxury Scented Candle",
                    description: "Premium soy wax candle with notes of sandalwood and vanilla. Long-lasting fragrance.",
                    price: 2800,
                    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800",
                    stock: 50,
                    attributes: { scent: ["Sandalwood", "Lavender", "Sea Salt"] }
                },
                {
                    name: "Geometric Cotton Rug",
                    description: "Soft, hand-woven cotton rug with a contemporary geometric pattern. Easy to clean.",
                    price: 18500,
                    image: "https://images.unsplash.com/photo-1531651008558-ed1758732ba9?auto=format&fit=crop&w=800",
                    stock: 8,
                    isFeatured: true,
                    attributes: { size: ["4x6 ft", "5x8 ft", "8x10 ft"] }
                },
                {
                    name: "Ergonomic Desk Chair",
                    description: "Breathable mesh back with adjustable lumbar support and armrests for all-day comfort.",
                    price: 24900,
                    image: "https://images.unsplash.com/photo-1505843490701-515a00718600?auto=format&fit=crop&w=800",
                    stock: 12,
                    attributes: { color: ["Black", "White", "Grey"] }
                },
                {
                    name: "Natural Linen Bedding Set",
                    description: "High-quality linen sheets and duvet cover. Breathable and luxurious feel.",
                    price: 29000,
                    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800",
                    stock: 15,
                    isNewArrival: true,
                    attributes: { size: ["Queen", "King"], color: ["Mist", "Clay", "Sand"] }
                }
            ],
            "Beauty": [
                {
                    name: "Revitalizing Face Serum",
                    description: "Potent blend of vitamin C and hyaluronic acid for a brighter, hydrated complexion.",
                    price: 4500,
                    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800",
                    stock: 60,
                    isFeatured: true,
                    attributes: { volume: ["30ml", "50ml"] }
                },
                {
                    name: "Matte Liquid Lipstick",
                    description: "Long-wearing, velvet matte finish that won't dry out your lips. Highly pigmented.",
                    price: 1800,
                    image: "https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&w=800",
                    stock: 100,
                    attributes: { color: ["Crimson", "Nude", "Plum", "Berry"] }
                },
                {
                    name: "Hydrating Hair Mask",
                    description: "Deep conditioning treatment with argan oil for silky, manageable hair.",
                    price: 3200,
                    image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&w=800",
                    stock: 45,
                    attributes: { volume: ["200ml"] }
                },
                {
                    name: "Mineral Sunscreen SPF 50",
                    description: "Broad-spectrum protection with non-greasy, reef-safe ingredients. Suitable for sensitive skin.",
                    price: 2500,
                    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800",
                    stock: 80,
                    attributes: { volume: ["100ml"] }
                },
                {
                    name: "Botanical Cleansing Oil",
                    description: "Gently removes makeup and impurities while nourishing the skin with natural oils.",
                    price: 3800,
                    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800",
                    stock: 35,
                    isNewArrival: true,
                    attributes: { volume: ["150ml"] }
                }
            ],
            "Sports": [
                {
                    name: "Pro-Grip Yoga Mat",
                    description: "Extra thick, non-slip yoga mat with alignment lines. Eco-friendly material.",
                    price: 5500,
                    image: "https://images.unsplash.com/photo-1592432676556-2693881da4f0?auto=format&fit=crop&w=800",
                    stock: 30,
                    attributes: { color: ["Purple", "Forest Green", "Black"] }
                },
                {
                    name: "Adjustable Dumbbell Set",
                    description: "Space-saving design allows you to change weights quickly. Up to 25kg per dumbbell.",
                    price: 45000,
                    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800",
                    stock: 10,
                    isFeatured: true,
                },
                {
                    name: "High-Compression Leggings",
                    description: "Four-way stretch fabric with moisture-wicking technology. Squat-proof and breathable.",
                    price: 4900,
                    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800",
                    stock: 50,
                    attributes: { size: ["XS", "S", "M", "L", "XL"], color: ["Teal", "Burgundy", "Black"] }
                },
                {
                    name: "Insulated Sports Bottle",
                    description: "Double-walled stainless steel keeps drinks cold for 24 hours or hot for 12 hours.",
                    price: 3200,
                    image: "https://images.unsplash.com/photo-1602143303410-7199d121b7ce?auto=format&fit=crop&w=800",
                    stock: 100,
                    attributes: { volume: ["500ml", "750ml", "1L"] }
                },
                {
                    name: "Speed Jump Rope",
                    description: "Lightweight wire rope with ball bearings for smooth, fast spinning. Adjustable length.",
                    price: 1500,
                    image: "https://images.unsplash.com/photo-1517438476312-10d79c67750d?auto=format&fit=crop&w=800",
                    stock: 150,
                    isNewArrival: true,
                }
            ],
            "Kids": [
                {
                    name: "Educational Wooden Blocks",
                    description: "Set of 50 natural wood blocks in various shapes for creative building and learning.",
                    price: 3500,
                    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800",
                    stock: 30,
                    isNewArrival: true,
                },
                {
                    name: "Organic Cotton Onesie",
                    description: "Ultra-soft and breathable onesie with easy snap closures. Gentle on baby's skin.",
                    price: 1800,
                    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800",
                    stock: 60,
                    attributes: { color: ["Sky Blue", "Soft Pink", "Cloud White"], size: ["0-3m", "3-6m", "6-12m"] }
                },
                {
                    name: "Smart Kids Watch",
                    description: "Simple and durable watch with step counting and basic games. No internet required.",
                    price: 4500,
                    image: "https://images.unsplash.com/photo-1544117518-35805462da29?auto=format&fit=crop&w=800",
                    stock: 25,
                    attributes: { color: ["Blue", "Purple", "Green"] }
                },
                {
                    name: "Plush Teddy Bear",
                    description: "Large, huggable teddy bear made from recycled materials. The perfect companion.",
                    price: 2500,
                    image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800",
                    stock: 40,
                    isFeatured: true,
                },
                {
                    name: "Interactive Story Book",
                    description: "Beautifully illustrated book with touch-and-feel elements to engage young readers.",
                    price: 1200,
                    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800",
                    stock: 100,
                }
            ]
        };

        // 7. Insert Products
        for (const [catName, items] of Object.entries(productsData)) {
            const catId = categoryMap.get(catName);
            if (!catId) {
                console.warn(`Category ${catName} not found! Skipping items.`);
                continue;
            }

            for (const item of items) {
                // Insert product
                const [product] = await db.insert(products).values({
                    ...item,
                    category: catName, // Legacy string ID for backward compat if needed
                    type: "simple"
                }).returning();

                // Link to category
                await db.insert(productCategories).values({
                    productId: product.id,
                    categoryId: catId
                });

                console.log(`Created product: ${item.name} in ${catName}`);
            }
        }

        console.log("Seeding complete!");
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed().catch(console.error);
