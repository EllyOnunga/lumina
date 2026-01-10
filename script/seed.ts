
import "dotenv/config";
import { db } from "../server/db";
import { products } from "../shared/schema";

async function seed() {
    console.log("Seeding products...");

    const initialProducts = [
        {
            name: "Nairobi Vibe T-Shirt",
            description: "Premium cotton t-shirt with modern Nairobi creative art print. Designed for comfort and style in the city.",
            price: 150000,
            image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
            images: [
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
            ],
            category: "Men",
            stock: 45,
            specifications: "• 100% Organic Cotton\n• Screen-printed logo\n• Regular fit\n• Machine wash cold",
            rating: 5,
            isFeatured: true,
            isNewArrival: true
        },
        {
            name: "Savannah Silk Scarf",
            description: "Luxurious pure silk scarf featuring hand-painted savannah flora and fauna patterns.",
            price: 280000,
            image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80",
            category: "Accessories",
            stock: 12,
            specifications: "• 100% Mulberry Silk\n• 90x90cm\n• Rolled edges\n• Dry clean only",
            rating: 4,
            isFeatured: true
        },
        {
            name: "Maasai Pattern Bomber Jacket",
            description: "Stylish bomber jacket inspired by traditional Maasai shuka patterns. A perfect blend of heritage and modern streetwear.",
            price: 450000,
            image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
            images: [
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
                "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80"
            ],
            category: "Women",
            stock: 8,
            specifications: "• Satin lining\n• Ribbed cuffs and hem\n• Internal pocket\n• Heritage series",
            rating: 5,
            isFeatured: true,
            isNewArrival: true
        },
        {
            name: "Urban Cargo Pants",
            description: "Functional and trendy cargo pants for the modern explorer. Multiple pockets for all your essentials.",
            price: 320000,
            image: "https://images.unsplash.com/photo-1517445312882-68392147325e?w=800&q=80",
            category: "Men",
            stock: 25,
            specifications: "• 98% Cotton, 2% Elastane\n• Slim-tapered fit\n• Reinforced seams\n• Utility pockets",
            rating: 4
        },
        {
            name: "Infinity Leather Sneakers",
            description: "Minimalist high-top sneakers handcrafted from premium Kenyan leather. Engineered for everyday durability.",
            price: 550000,
            image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
            images: [
                "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
                "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80"
            ],
            category: "Footwear",
            stock: 15,
            specifications: "• Full-grain leather\n• OrthoLite® insole\n• Recycled rubber sole\n• Contrast stitching",
            rating: 5,
            isNewArrival: true
        },
        {
            name: "Lumina Signature Hoodie",
            description: "Comfortable heavyweight hoodie with embroidered Lumina logo. The ultimate luxury lounge piece.",
            price: 380000,
            image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
            category: "Women",
            stock: 30,
            specifications: "• 450GSM Fleece\n• Oversized fit\n• Dropped shoulders\n• Unisex sizing",
            rating: 4
        },
        {
            name: "Sahara Linen Blazer",
            description: "Breathable linen blazer in a classic desert sand hue. Perfect for formal events in warmer climates.",
            price: 720000,
            image: "https://images.unsplash.com/photo-1507679799987-c7377ec48696?w=800&q=80",
            category: "Men",
            stock: 4,
            specifications: "• 100% European Linen\n• Unlined torso\n• Patch pockets\n• Standard 2-button closure",
            rating: 5
        },
        {
            name: "Amber Sunset Jumpsuit",
            description: "Flowing wide-leg jumpsuit with an adjustable waist. Radiate elegance from day to night.",
            price: 490000,
            image: "https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?w=800&q=80",
            category: "Women",
            stock: 20,
            specifications: "• Viscose blend\n• Hidden back zipper\n• Pockets included\n• Sustainably sourced fabric",
            rating: 4
        },
        {
            name: "Nomad Woolen Beanie",
            description: "Warm and cozy ribbed beanie made from ethically sourced merino wool.",
            price: 180000,
            image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80",
            category: "Accessories",
            stock: 50,
            specifications: "• 100% Merino Wool\n• One size fits all\n• Fold-over cuff\n• Odor resistant",
            rating: 3
        },
        {
            name: "Rift Valley Denim",
            description: "Classic straight-leg denim jeans with a vintage fade. A timeless addition to any wardrobe.",
            price: 420000,
            image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
            category: "Men",
            stock: 18,
            specifications: "• 14oz Selvedge Denim\n• Button fly\n• Brass hardware\n• Gets better with age",
            rating: 5
        }
    ];

    await db.insert(products).values(initialProducts);

    console.log("Seeding complete!");
}

seed().catch(console.error);
