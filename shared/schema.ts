import { pgTable, text, serial, integer, boolean, timestamp, jsonb, AnyPgColumn, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password"),
  googleId: text("google_id").unique(),
  githubId: text("github_id").unique(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  role: text("role").default("user").notNull(), // 'user', 'admin', 'manager', 'editor'
  preferences: text("preferences").array(), // Preferred categories e.g. ["Men", "Accessories"]
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id").references((): AnyPgColumn => categories.id),
  description: text("description"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Stored in cents (or smallest currency unit)
  image: text("image").notNull(),
  category: text("category").notNull(),
  brand: text("brand"),
  stock: integer("stock").notNull().default(0),
  images: text("images").array(), // For multiple product images
  specifications: text("specifications"), // Detailed product info
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isNewArrival: boolean("is_new_arrival").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  type: text("type").notNull().default("simple"), // simple, configurable, bundle, variant
  sku: text("sku").unique(),
  parentId: integer("parent_id").references((): AnyPgColumn => products.id),
  attributes: jsonb("attributes"), // e.g. { size: "L", color: "red" }
  videoUrl: text("video_url"),
  lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
  allowBackorder: boolean("allow_backorder").default(false).notNull(),
  sizeGuide: text("size_guide"), // Markdown or HTML for size chart
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
});

export const bundleItems = pgTable("bundle_items", {
  id: serial("id").primaryKey(),
  bundleId: integer("bundle_id").notNull().references(() => products.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
});

export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
  stock: integer("stock").notNull().default(0),
});

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  isOpen: boolean("is_open").notNull().default(true),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull().references(() => carts.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered
  total: integer("total").notNull(),
  customerFullName: text("customer_full_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingZipCode: text("shipping_zip_code").notNull(),
  phoneNumber: text("phone_number").notNull(),
  orderNotes: text("order_notes"),
  paymentMethod: text("payment_method").notNull().default("mpesa"), // mpesa, card, paypal
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed
  externalTransactionId: text("external_transaction_id"),
  subtotal: integer("subtotal").notNull().default(0),
  taxAmount: integer("tax_amount").notNull().default(0),
  shippingCost: integer("shipping_cost").notNull().default(0),
  shippingMethod: text("shipping_method").notNull().default("standard"), // standard, express, pickup, free
  pointsEarned: integer("points_earned").default(0).notNull(),
  pointsRedeemed: integer("points_redeemed").default(0).notNull(),
  giftCardAmount: integer("gift_card_amount").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // Snapshot of price at time of order
  isBackordered: boolean("is_backordered").default(false).notNull(),
});

export const productCategories = pgTable("product_categories", {
  productId: integer("product_id").notNull().references(() => products.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
});

export const productTags = pgTable("product_tags", {
  productId: integer("product_id").notNull().references(() => products.id),
  tagId: integer("tag_id").notNull().references(() => tags.id),
});

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
});

export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  fit: text("fit"), // 'small', 'true', 'large'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  question: text("question").notNull(),
  answer: text("answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fullName: text("full_name").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  zipCode: text("zip_code").notNull(),
  phoneNumber: text("phone_number").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
});

export const orderTracking = pgTable("order_tracking", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  status: text("status").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  authorId: integer("author_id").references(() => users.id),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // 'percentage' or 'fixed'
  discountValue: numeric("discount_value").notNull(),
  minOrderAmount: integer("min_order_amount").default(0),
  maxUses: integer("max_uses"),
  usesCount: integer("uses_count").default(0),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // 'page_view', 'add_to_cart', 'purchase', etc.
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plugins = pgTable("plugins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'ERP', 'CRM', 'Accounting', 'Marketing', 'Shipping'
  icon: text("icon"), // Lucide icon name or image URL
  config: jsonb("config").default({}), // Stores API keys, settings, webhook URLs
  status: text("status").notNull().default("inactive"), // 'active', 'inactive', 'not_configured'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const flashSales = pgTable("flash_sales", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const flashSaleProducts = pgTable("flash_sale_products", {
  id: serial("id").primaryKey(),
  flashSaleId: integer("flash_sale_id").notNull().references(() => flashSales.id),
  productId: integer("product_id").notNull().references(() => products.id),
  salePrice: integer("sale_price").notNull(),
  stockLimit: integer("stock_limit").notNull(),
  soldCount: integer("sold_count").default(0).notNull(),
});

export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g., 'USD', 'EUR', 'KES'
  symbol: text("symbol").notNull(), // e.g., '$', '€', 'KSH'
  exchangeRate: numeric("exchange_rate").notNull(), // Relative to KES (base)
  isBase: boolean("is_base").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const giftCards = pgTable("gift_cards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  initialValue: integer("initial_value").notNull(),
  remainingValue: integer("remaining_value").notNull(),
  senderId: integer("sender_id").references(() => users.id),
  recipientEmail: text("recipient_email").notNull(),
  message: text("message"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const cartsRelations = relations(carts, ({ one, many }) => ({
  items: many(cartItems),
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  items: many(orderItems),
  tracking: many(orderTracking),
  returns: many(returns),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  variants: many(products, { relationName: "variants" }),
  parent: one(products, {
    fields: [products.parentId],
    references: [products.id],
    relationName: "variants",
  }),
  bundleItems: many(bundleItems, { relationName: "bundleMain" }),
  reviews: many(reviews),
  questions: many(questions),
  inventory: many(inventory),
  productCategories: many(productCategories),
  productTags: many(productTags),
  wishlists: many(wishlists),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  addresses: many(addresses),
  wishlist: many(wishlists),
  reviews: many(reviews),
  questions: many(questions),
}));

export const orderTrackingRelations = relations(orderTracking, ({ one }) => ({
  order: one(orders, {
    fields: [orderTracking.orderId],
    references: [orders.id],
  }),
}));

export const returnsRelations = relations(returns, ({ one }) => ({
  order: one(orders, {
    fields: [returns.orderId],
    references: [orders.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "subcategories",
  }),
  children: many(categories, { relationName: "subcategories" }),
  productCategories: many(productCategories),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, {
    fields: [productCategories.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productCategories.categoryId],
    references: [categories.id],
  }),
}));

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tagId],
    references: [tags.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  productTags: many(productTags),
}));

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  inventory: many(inventory),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [inventory.warehouseId],
    references: [warehouses.id],
  }),
}));

export const bundleItemsRelations = relations(bundleItems, ({ one }) => ({
  bundle: one(products, {
    fields: [bundleItems.bundleId],
    references: [products.id],
    relationName: "bundleMain",
  }),
  product: one(products, {
    fields: [bundleItems.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  user: one(users, {
    fields: [questions.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [questions.productId],
    references: [products.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
}).extend({
  email: z.string().email("Invalid email address").optional(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
  answer: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  cartId: true,
});

export const insertOrderSchema = createInsertSchema(orders).extend({
  customerEmail: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  customerFullName: z.string().min(2, "Full name must be at least 2 characters"),
  shippingAddress: z.string().min(5, "Address must be at least 5 characters"),
  shippingCity: z.string().min(2, "City must be at least 2 characters"),
  shippingZipCode: z.string().min(3, "Zip code must be at least 3 characters"),
  paymentMethod: z.enum(["mpesa", "card", "paypal"]).default("mpesa"),
  shippingMethod: z.enum(["standard", "express", "pickup", "free"]).default("standard"),
}).omit({
  id: true,
  createdAt: true,
  status: true,
  userId: true,
  total: true,
  subtotal: true,
  taxAmount: true,
  shippingCost: true,
  paymentStatus: true,
  externalTransactionId: true,
  pointsEarned: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  userId: true,
});

export const insertReturnSchema = createInsertSchema(returns).omit({
  id: true,
  createdAt: true,
  status: true,
  adminNotes: true,
});


export const createOrderSchema = insertOrderSchema.extend({
  subtotal: z.number(),
  taxAmount: z.number(),
  shippingCost: z.number(),
  total: z.number(),
  pointsRedeemed: z.number().optional(),
  giftCardAmount: z.number().optional(),
  giftCardCode: z.string().optional(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    price: z.number(),
  })),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type Wishlist = typeof wishlists.$inferSelect;
export type BundleItem = typeof bundleItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Warehouse = typeof warehouses.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
export type ProductTag = typeof productTags.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type OrderTracking = typeof orderTracking.$inferSelect;
export type Return = typeof returns.$inferSelect;
export type InsertReturn = z.infer<typeof insertReturnSchema>;

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  authorId: true,
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertBlogPostInternal = typeof blogPosts.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  usesCount: true,
});
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type Plugin = typeof plugins.$inferSelect;
export const insertPluginSchema = createInsertSchema(plugins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlugin = z.infer<typeof insertPluginSchema>;

export const insertFlashSaleSchema = createInsertSchema(flashSales).omit({
  id: true,
  createdAt: true,
});
export type FlashSale = typeof flashSales.$inferSelect;
export type InsertFlashSale = z.infer<typeof insertFlashSaleSchema>;

export const insertFlashSaleProductSchema = createInsertSchema(flashSaleProducts).omit({
  id: true,
});
export type FlashSaleProduct = typeof flashSaleProducts.$inferSelect;
export type InsertFlashSaleProduct = z.infer<typeof insertFlashSaleProductSchema>;

export const insertCurrencySchema = createInsertSchema(currencies).omit({
  id: true,
});
export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;

export const insertGiftCardSchema = createInsertSchema(giftCards).omit({
  id: true,
  createdAt: true,
});
export type GiftCard = typeof giftCards.$inferSelect;
export type InsertGiftCard = z.infer<typeof insertGiftCardSchema>;
