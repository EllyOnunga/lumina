import {
  type User, type InsertUser, type Product, type InsertProduct, type Cart, type CartItem, type Order,
  type Review, type InsertReview, type Question, type InsertQuestion,
  type Warehouse, type Inventory,
  type Category, type Tag, type BundleItem,
  users, products, carts, cartItems, orders, orderItems, wishlists, reviews, questions, warehouses, inventory, categories, tags, productCategories, productTags,
  addresses, orderTracking, returns, type Address, type InsertAddress, type Return, type InsertReturn, type OrderTracking,
  type BlogPost, type InsertBlogPost, type InsertBlogPostInternal, type Page, type Coupon, type InsertCoupon, type AnalyticsEvent, type NewsletterSubscriber,
  blogPosts, pages, coupons, analyticsEvents, newsletterSubscribers, plugins, type Plugin, type InsertPlugin,
  emailVerificationTokens, passwordResetTokens,
  flashSales, flashSaleProducts, currencies, giftCards,
  type FlashSale, type InsertFlashSale, type FlashSaleProduct, type InsertFlashSaleProduct,
  type Currency, type GiftCard, type InsertGiftCard
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, ilike, gte, lte, asc, desc, SQL, inArray, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);


export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser & { googleId?: string; githubId?: string; isEmailVerified?: boolean }): Promise<User>;
  updateUser(id: number, update: Partial<User>): Promise<User>;
  getUsers(): Promise<User[]>;
  toggleAdminStatus(id: number, isAdmin: boolean): Promise<User>;
  updateUserRole(id: number, role: string): Promise<User>;
  updateUserPreferences(id: number, preferences: string[]): Promise<User>;

  getProducts(filters?: {
    search?: string;
    category?: string | string[];
    brand?: string | string[];
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    tags?: string[];
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getSearchSuggestions(query: string): Promise<Product[]>;
  getSearchFacets(filters?: { category?: string }): Promise<{
    categories: { name: string; count: number }[];
    brands: { name: string; count: number }[];
    priceRange: { min: number; max: number };
    attributes: { name: string; values: string[] }[];
  }>;

  getCart(userId: number): Promise<(Cart & { items: (CartItem & { product: Product })[] }) | undefined>;
  addToCart(userId: number, productId: number, quantity: number): Promise<void>;
  removeFromCart(userId: number, productId: number): Promise<void>;
  updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  mergeCart(userId: number, items: { productId: number; quantity: number }[]): Promise<void>;

  createOrder(userId: number | null, subtotal: number, taxAmount: number, shippingCost: number, total: number, items: { productId: number; quantity: number; price: number }[], details: { customerFullName: string; customerEmail: string; shippingAddress: string; shippingCity: string; shippingZipCode: string; phoneNumber: string; orderNotes?: string | null; shippingMethod: string; pointsRedeemed?: number; giftCardAmount?: number; giftCardCode?: string }): Promise<Order>;
  getUserOrders(userId: number): Promise<(Order & { items: (typeof orderItems.$inferSelect & { product: Product })[] })[]>;
  getAllOrders(): Promise<(Order & { items: (typeof orderItems.$inferSelect & { product: Product })[], user: User | null })[]>;
  getOrder(id: number): Promise<(Order & { items: (typeof orderItems.$inferSelect & { product: Product })[], user: User | null, tracking: OrderTracking[], returns: Return[] }) | undefined>;
  updateOrderStatus(id: number, status: string, description?: string): Promise<Order>;
  updateOrderPaymentStatus(id: number, status: string, transactionId?: string): Promise<Order>;

  getAddresses(userId: number): Promise<Address[]>;
  createAddress(userId: number, address: InsertAddress): Promise<Address>;
  updateAddress(id: number, userId: number, update: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: number, userId: number): Promise<void>;

  getOrderTracking(orderId: number): Promise<OrderTracking[]>;
  addOrderTracking(orderId: number, tracking: { status: string; description: string; location?: string }): Promise<OrderTracking>;

  createReturn(ret: InsertReturn): Promise<Return>;
  getReturns(): Promise<(Return & { order: Order })[]>;
  updateReturnStatus(id: number, status: string, adminNotes?: string): Promise<Return>;

  searchUsers(query: string): Promise<User[]>;

  getWishlist(userId: number): Promise<Product[]>;
  addToWishlist(userId: number, productId: number): Promise<void>;
  removeFromWishlist(userId: number, productId: number): Promise<void>;

  getProductWithDetails(id: number): Promise<Product & { variants?: Product[], bundleItems?: (BundleItem & { product: Product })[], reviews?: (Review & { user: User })[], questions?: (Question & { user: User })[] } | undefined>;
  bulkImportProducts(products: InsertProduct[]): Promise<void>;
  bulkExportProducts(): Promise<Product[]>;

  getReviews(productId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;

  getQuestions(productId: number): Promise<(Question & { user: User })[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  answerQuestion(id: number, answer: string): Promise<Question>;

  getWarehouses(): Promise<Warehouse[]>;
  createWarehouse(warehouse: { name: string; location: string }): Promise<Warehouse>;
  getInventory(productId: number): Promise<Inventory[]>;
  updateInventory(productId: number, warehouseId: number, stock: number): Promise<Inventory>;
  getLowStockAlerts(): Promise<(Product & { totalStock: number })[]>;

  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoriesWithProducts(): Promise<(Category & { products: Product[] })[]>;
  createCategory(category: { name: string; slug: string; parentId?: number | null; description?: string }): Promise<Category>;
  getTags(): Promise<Tag[]>;
  createTag(tag: { name: string; slug: string }): Promise<Tag>;
  setProductTaxonomy(productId: number, categoryIds: number[], tagIds: number[]): Promise<void>;
  getProductTaxonomy(productId: number): Promise<{ categoryIds: number[]; tagIds: number[] }>;

  // CMS
  getBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPostInternal): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;

  getPages(publishedOnly?: boolean): Promise<Page[]>;
  getPage(slug: string): Promise<Page | undefined>;
  createPage(page: { title: string; slug: string; content: string; isPublished?: boolean; metaTitle?: string; metaDescription?: string }): Promise<Page>;
  updatePage(id: number, page: Partial<Page>): Promise<Page>;

  // Promotions
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  getCoupons(): Promise<Coupon[]>;
  incrementCouponUsage(id: number): Promise<void>;

  // Analytics
  createAnalyticsEvent(event: { eventType: string; userId?: number; sessionId?: string; metadata?: Record<string, unknown> }): Promise<AnalyticsEvent>;

  // Newsletter
  subscribeToNewsletter(email: string): Promise<NewsletterSubscriber>;
  unsubscribeNewsletter(email: string): Promise<void>;

  // Token Management
  createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ userId: number; expiresAt: Date } | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  createEmailVerificationToken(userId: number, token: string, expiresAt: Date): Promise<void>;
  getEmailVerificationToken(token: string): Promise<{ userId: number; expiresAt: Date } | undefined>;
  deleteEmailVerificationToken(token: string): Promise<void>;

  // Loyalty Program
  getUserLoyaltyPoints(userId: number): Promise<number>;
  updateUserLoyaltyPoints(userId: number, points: number): Promise<void>;

  // Flash Sales
  getFlashSales(activeOnly?: boolean): Promise<FlashSale[]>;
  getFlashSale(id: number): Promise<(FlashSale & { products: (FlashSaleProduct & { product: Product })[] }) | undefined>;
  createFlashSale(sale: InsertFlashSale, products: InsertFlashSaleProduct[]): Promise<FlashSale>;

  // Multi-Currency
  getCurrencies(): Promise<Currency[]>;
  getCurrencyByCode(code: string): Promise<Currency | undefined>;

  // Gift Cards
  getGiftCardByCode(code: string): Promise<GiftCard | undefined>;
  createGiftCard(card: InsertGiftCard): Promise<GiftCard>;
  updateGiftCardBalance(id: number, amount: number): Promise<void>;

  // Smart Recommendations
  getFrequentlyBoughtTogether(productId: number): Promise<Product[]>;
  getRecommendedProducts(userId: number | null): Promise<Product[]>;
  sessionStore: session.Store;
}


export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
    return user;
  }

  async createUser(insertUser: InsertUser & { googleId?: string; githubId?: string; isEmailVerified?: boolean }): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async toggleAdminStatus(id: number, isAdmin: boolean): Promise<User> {
    const [user] = await db.update(users)
      .set({ isAdmin, role: isAdmin ? 'admin' : 'user' })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ role, isAdmin: role === 'admin' })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPreferences(id: number, preferences: string[]): Promise<User> {
    const [user] = await db.update(users)
      .set({ preferences })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getProducts(filters?: {
    search?: string;
    category?: string | string[];
    brand?: string | string[];
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    attributes?: Record<string, string[]>;
    tags?: string[];
  }): Promise<Product[]> {
    const { search, category, brand, minPrice, maxPrice, sort, isFeatured, isNewArrival, attributes } = filters || {};

    let query = db.select().from(products).$dynamic();
    const conditions: SQL[] = [];

    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }
    if (category) {
      if (Array.isArray(category)) {
        if (category.length > 0) {
          // Join with product_categories to support multiple
          const pc = await db.select({ productId: productCategories.productId })
            .from(productCategories)
            .where(inArray(productCategories.categoryId, category.map(c => typeof c === 'string' ? parseInt(c) : c)));

          if (pc.length > 0) {
            conditions.push(inArray(products.id, pc.map(x => x.productId)));
          } else {
            // No products match these categories
            return [];
          }
        }
      } else if (category !== "all") {
        // Simple string match against old column for legacy support, or ID check
        if (!isNaN(parseInt(category))) {
          const pcArr = await db.select({ productId: productCategories.productId })
            .from(productCategories)
            .where(eq(productCategories.categoryId, parseInt(category)));
          if (pcArr.length > 0) {
            conditions.push(inArray(products.id, pcArr.map(x => x.productId)));
          } else return [];
        } else {
          conditions.push(eq(products.category, category));
        }
      }
    }

    // Tag filtering
    const tagsArr = filters?.tags;
    if (tagsArr && tagsArr.length > 0) {
      const ptArr = await db.select({ productId: productTags.productId })
        .from(productTags)
        .where(inArray(productTags.tagId, tagsArr.map(t => parseInt(t))));
      if (ptArr.length > 0) {
        conditions.push(inArray(products.id, ptArr.map(x => x.productId)));
      } else return [];
    }
    if (brand) {
      if (Array.isArray(brand)) {
        if (brand.length > 0) {
          conditions.push(inArray(products.brand, brand));
        }
      } else {
        conditions.push(eq(products.brand, brand));
      }
    }
    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice));
    }
    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice));
    }
    if (isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, isFeatured));
    }
    if (isNewArrival !== undefined) {
      conditions.push(eq(products.isNewArrival, isNewArrival));
    }

    // Dynamic attribute filtering (JSONB)
    if (attributes) {
      for (const [key, values] of Object.entries(attributes)) {
        if (values.length > 0) {
          conditions.push(sql`${products.attributes}->>${key} IN (${sql.join(values.map(v => sql`${v}`), sql`, `)})`);
        }
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    } else {
      // By default, don't show individual variants in the main listing
      query = query.where(inArray(products.type, ["simple", "configurable", "bundle"]));
    }

    if (sort) {
      switch (sort) {
        case "price_asc":
          query = query.orderBy(asc(products.price));
          break;
        case "price_desc":
          query = query.orderBy(desc(products.price));
          break;
        case "rating_desc":
          query = query.orderBy(desc(products.rating));
          break;
        case "newest":
          query = query.orderBy(desc(products.createdAt));
          break;
        default:
          query = query.orderBy(desc(products.createdAt));
      }
    } else {
      query = query.orderBy(desc(products.createdAt));
    }

    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductWithDetails(id: number): Promise<Product & { variants?: Product[], bundleItems?: (BundleItem & { product: Product })[], reviews?: (Review & { user: User })[], questions?: (Question & { user: User })[] } | undefined> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        variants: true,
        bundleItems: {
          with: {
            product: true
          }
        },
        reviews: {
          with: {
            user: true
          },
          orderBy: (reviews, { desc }) => [desc(reviews.createdAt)]
        },
        questions: {
          with: {
            user: true
          },
          orderBy: (questions, { desc }) => [desc(questions.createdAt)]
        }
      }
    });

    if (!product) return undefined;

    return product as Product & {
      variants?: Product[],
      bundleItems?: (BundleItem & { product: Product })[],
      reviews?: (Review & { user: User })[],
      questions?: (Question & { user: User })[]
    };
  }

  async bulkImportProducts(items: InsertProduct[]): Promise<void> {
    if (items.length === 0) return;
    await db.insert(products).values(items).onConflictDoUpdate({
      target: [products.sku],
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        price: sql`excluded.price`,
        image: sql`excluded.image`,
        category: sql`excluded.category`,
        stock: sql`excluded.stock`,
        type: sql`excluded.type`,
        attributes: sql`excluded.attributes`,
      }
    });
  }

  async bulkExportProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products)
      .set(update)
      .where(eq(products.id, id))
      .returning();
    if (!product) throw new Error("Product not found");
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    // Delete related cart items and wishlists first to avoid foreign key constraints
    await db.delete(cartItems).where(eq(cartItems.productId, id));
    await db.delete(wishlists).where(eq(wishlists.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }

  async getSearchSuggestions(query: string): Promise<Product[]> {
    return await db.select()
      .from(products)
      .where(ilike(products.name, `%${query}%`))
      .limit(8);
  }

  async getSearchFacets(_filters?: { category?: string }): Promise<{
    categories: { id: number; name: string; count: number }[];
    brands: { name: string; count: number }[];
    priceRange: { min: number; max: number };
    attributes: { name: string; values: string[] }[];
  }> {
    const allProducts = await db.select().from(products);

    // Get all categories and their counts via productCategories junction
    const catsWithCounts = await db.select({
      id: categories.id,
      name: categories.name,
      count: sql<number>`count(${productCategories.productId})`
    })
      .from(categories)
      .leftJoin(productCategories, eq(categories.id, productCategories.categoryId))
      .groupBy(categories.id, categories.name);

    const brandsMap = new Map<string, number>();
    const attributesMap = new Map<string, Set<string>>();
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const p of allProducts) {
      if (p.brand) {
        brandsMap.set(p.brand, (brandsMap.get(p.brand) || 0) + 1);
      }

      if (p.price < minPrice) minPrice = p.price;
      if (p.price > maxPrice) maxPrice = p.price;

      if (p.attributes && typeof p.attributes === 'object') {
        for (const [key, value] of Object.entries(p.attributes as Record<string, unknown>)) {
          if (!attributesMap.has(key)) attributesMap.set(key, new Set());
          if (typeof value === 'string') attributesMap.get(key)!.add(value);
        }
      }
    }

    return {
      categories: catsWithCounts.map(c => ({ id: c.id, name: c.name, count: Number(c.count) })),
      brands: Array.from(brandsMap.entries()).map(([name, count]) => ({ name, count })),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice === -Infinity ? 0 : maxPrice
      },
      attributes: Array.from(attributesMap.entries()).map(([name, values]) => ({
        name,
        values: Array.from(values)
      }))
    };
  }

  async getCart(userId: number): Promise<(Cart & { items: (CartItem & { product: Product })[] }) | undefined> {
    let [cart] = await db.select().from(carts).where(and(eq(carts.userId, userId), eq(carts.isOpen, true)));

    if (!cart) {
      [cart] = await db.insert(carts).values({ userId, isOpen: true }).returning();
    }

    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
      with: {
        product: true
      }
    });

    return { ...cart, items };
  }

  async addToCart(userId: number, productId: number, quantity: number): Promise<void> {
    // Check stock before adding to cart
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) throw new Error("Product not found");
    // We don't strictly block adding more than stock to cart yet, 
    // but we could. For now, we'll let it happen and check at checkout.

    // Ensure cart exists
    let [cart] = await db.select().from(carts).where(and(eq(carts.userId, userId), eq(carts.isOpen, true)));
    if (!cart) {
      [cart] = await db.insert(carts).values({ userId, isOpen: true }).returning();
    }

    // Check if item exists in cart
    const [existingItem] = await db.select().from(cartItems).where(
      and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productId, productId)
      )
    );

    if (existingItem) {
      await db.update(cartItems)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId,
        quantity
      });
    }
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    const [cart] = await db.select().from(carts).where(and(eq(carts.userId, userId), eq(carts.isOpen, true)));
    if (!cart) return;

    await db.delete(cartItems).where(
      and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productId, productId)
      )
    );
  }

  async updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<void> {
    const [cart] = await db.select().from(carts).where(and(eq(carts.userId, userId), eq(carts.isOpen, true)));
    if (!cart) return;

    await db.update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId)
        )
      );
  }

  async clearCart(userId: number): Promise<void> {
    const [cart] = await db.select().from(carts).where(and(eq(carts.userId, userId), eq(carts.isOpen, true)));
    if (!cart) return;

    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  }

  async mergeCart(userId: number, items: { productId: number; quantity: number }[]): Promise<void> {
    // Ensure cart exists
    let [cart] = await db.select().from(carts).where(and(eq(carts.userId, userId), eq(carts.isOpen, true)));
    if (!cart) {
      [cart] = await db.insert(carts).values({ userId, isOpen: true }).returning();
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!product) continue; // Skip invalid products

        const [existingItem] = await tx.select().from(cartItems).where(
          and(
            eq(cartItems.cartId, cart.id),
            eq(cartItems.productId, item.productId)
          )
        );

        if (existingItem) {
          await tx.update(cartItems)
            .set({ quantity: existingItem.quantity + item.quantity })
            .where(eq(cartItems.id, existingItem.id));
        } else {
          await tx.insert(cartItems).values({
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity
          });
        }
      }
    });
  }

  async createOrder(
    userId: number | null,
    subtotal: number,
    taxAmount: number,
    shippingCost: number,
    total: number,
    items: { productId: number; quantity: number; price: number }[],
    details: {
      customerFullName: string;
      customerEmail: string;
      shippingAddress: string;
      shippingCity: string;
      shippingZipCode: string;
      phoneNumber: string;
      orderNotes?: string | null;
      shippingMethod: string;
      pointsRedeemed?: number;
      giftCardAmount?: number;
      giftCardCode?: string;
    }
  ): Promise<Order> {
    return await db.transaction(async (tx) => {
      const { pointsRedeemed = 0, giftCardAmount = 0, giftCardCode, ...orderData } = details;

      // Calculate points earned (1 point per 100 base units of currency, e.g., 1 KSH per 100 KSH)
      const pointsEarned = Math.floor(subtotal / 10000); // Assuming subtotal is in cents, 10000 cents = 100 KES

      // 1. Create Order
      const [order] = await tx.insert(orders).values({
        userId,
        subtotal,
        taxAmount,
        shippingCost,
        total,
        status: "pending",
        pointsEarned,
        pointsRedeemed,
        giftCardAmount,
        ...orderData
      }).returning();

      // 2. Process items
      for (const item of items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!product) throw new Error(`Product not found: ${item.productId}`);

        let remainingToAllocate = item.quantity;

        // Find stock in warehouses
        const warehouseStock = await tx.select()
          .from(inventory)
          .where(eq(inventory.productId, item.productId))
          .orderBy(desc(inventory.stock));

        for (const stockRecord of warehouseStock) {
          if (remainingToAllocate <= 0) break;

          const toTake = Math.min(remainingToAllocate, stockRecord.stock);
          if (toTake > 0) {
            await tx.insert(orderItems).values({
              orderId: order.id,
              productId: item.productId,
              warehouseId: stockRecord.warehouseId,
              quantity: toTake,
              price: item.price,
              isBackordered: false,
            });

            await tx.update(inventory)
              .set({ stock: stockRecord.stock - toTake })
              .where(eq(inventory.id, stockRecord.id));

            remainingToAllocate -= toTake;
          }
        }

        // Handle backorder if any remaining
        if (remainingToAllocate > 0) {
          if (!product.allowBackorder) {
            throw new Error(`Insufficient stock for product: ${product.name}. Backordering not allowed.`);
          }

          await tx.insert(orderItems).values({
            orderId: order.id,
            productId: item.productId,
            warehouseId: null, // Backorders aren't assigned to a warehouse yet
            quantity: remainingToAllocate,
            price: item.price,
            isBackordered: true,
          });
        }

        // Update global product stock cache
        const currentTotalStock = product.stock - item.quantity;
        await tx.update(products)
          .set({ stock: Math.max(0, currentTotalStock) })
          .where(eq(products.id, item.productId));
      }

      // 3. Close current cart (if user logged in)
      if (userId) {
        await tx.update(carts).set({ isOpen: false }).where(and(eq(carts.userId, userId), eq(carts.isOpen, true)));
        await tx.insert(carts).values({ userId, isOpen: true });

        // Update user loyalty points
        const [user] = await tx.select().from(users).where(eq(users.id, userId));
        if (user) {
          await tx.update(users)
            .set({ loyaltyPoints: user.loyaltyPoints + pointsEarned - pointsRedeemed })
            .where(eq(users.id, userId));
        }
      }

      // 4. Update Gift Card balance if used
      if (giftCardCode && giftCardAmount > 0) {
        const [card] = await tx.select().from(giftCards).where(eq(giftCards.code, giftCardCode));
        if (card) {
          await tx.update(giftCards)
            .set({ remainingValue: Math.max(0, card.remainingValue - giftCardAmount) })
            .where(eq(giftCards.id, card.id));
        }
      }

      // 5. Record initial tracking
      await tx.insert(orderTracking).values({
        orderId: order.id,
        status: "pending",
        description: "Order placed successfully."
      });

      return order;
    });
  }

  async getUserOrders(userId: number): Promise<(Order & { items: (typeof orderItems.$inferSelect & { product: Product })[] })[]> {
    return await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: {
        items: {
          with: {
            product: true
          }
        },
        tracking: true
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)]
    });
  }

  async getAllOrders(): Promise<(Order & { items: (typeof orderItems.$inferSelect & { product: Product })[], user: User | null })[]> {
    return await db.query.orders.findMany({
      with: {
        items: {
          with: {
            product: true
          }
        },
        user: true,
        tracking: true
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)]
    });
  }

  async getOrder(id: number): Promise<(Order & { items: (typeof orderItems.$inferSelect & { product: Product })[], user: User | null, tracking: OrderTracking[], returns: Return[] }) | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        items: {
          with: {
            product: true
          }
        },
        user: true,
        tracking: {
          orderBy: (tracking, { desc }) => [desc(tracking.createdAt)]
        },
        returns: true
      }
    });

    return order as (Order & { items: (typeof orderItems.$inferSelect & { product: Product })[], user: User | null, tracking: OrderTracking[], returns: Return[] }) | undefined;
  }

  async updateOrderStatus(id: number, status: string, description?: string): Promise<Order> {
    const [order] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    if (!order) throw new Error("Order not found");

    // Log tracking change
    await db.insert(orderTracking).values({
      orderId: id,
      status,
      description: description || `Order status updated to ${status}.`
    });

    return order;
  }

  async updateOrderPaymentStatus(id: number, status: string, transactionId?: string): Promise<Order> {
    const update: Partial<Order> = { paymentStatus: status };
    if (transactionId) {
      update.externalTransactionId = transactionId;
    }
    const [order] = await db.update(orders)
      .set(update)
      .where(eq(orders.id, id))
      .returning();
    if (!order) throw new Error("Order not found");
    return order;
  }

  async getWishlist(userId: number): Promise<Product[]> {
    const items = await db.select({
      product: products
    })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId));

    return items.map(item => item.product);
  }

  async addToWishlist(userId: number, productId: number): Promise<void> {
    const [existing] = await db.select().from(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    if (!existing) {
      await db.insert(wishlists).values({ userId, productId });
    }
  }

  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    await db.delete(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
  }

  async getReviews(productId: number): Promise<(Review & { user: User })[]> {
    return await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      with: {
        user: true
      },
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)]
    });
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [inserted] = await db.insert(reviews).values(review).returning();

    // Update product rating and review count
    const productReviews = await db.select().from(reviews).where(eq(reviews.productId, review.productId));
    const count = productReviews.length;
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / count;

    await db.update(products)
      .set({ rating: Math.round(avgRating), reviewCount: count })
      .where(eq(products.id, review.productId));

    return inserted;
  }

  async getQuestions(productId: number): Promise<(Question & { user: User })[]> {
    return await db.query.questions.findMany({
      where: eq(questions.productId, productId),
      with: {
        user: true
      },
      orderBy: (questions, { desc }) => [desc(questions.createdAt)]
    });
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [inserted] = await db.insert(questions).values(question).returning();
    return inserted;
  }

  async answerQuestion(id: number, answer: string): Promise<Question> {
    const [updated] = await db.update(questions)
      .set({ answer })
      .where(eq(questions.id, id))
      .returning();
    return updated;
  }

  async getWarehouses(): Promise<Warehouse[]> {
    return await db.select().from(warehouses);
  }

  async createWarehouse(insertWarehouse: { name: string; location: string }): Promise<Warehouse> {
    const [warehouse] = await db.insert(warehouses).values(insertWarehouse).returning();
    return warehouse;
  }

  async getInventory(productId: number): Promise<Inventory[]> {
    return await db.select().from(inventory).where(eq(inventory.productId, productId));
  }

  async updateInventory(productId: number, warehouseId: number, stock: number): Promise<Inventory> {
    const [existing] = await db.select()
      .from(inventory)
      .where(and(eq(inventory.productId, productId), eq(inventory.warehouseId, warehouseId)));

    let record: Inventory;
    if (existing) {
      [record] = await db.update(inventory)
        .set({ stock })
        .where(eq(inventory.id, existing.id))
        .returning();
    } else {
      [record] = await db.insert(inventory)
        .values({ productId, warehouseId, stock })
        .returning();
    }

    // Update global stock
    const allInventory = await db.select().from(inventory).where(eq(inventory.productId, productId));
    const totalStock = allInventory.reduce((sum, inv) => sum + inv.stock, 0);
    await db.update(products).set({ stock: totalStock }).where(eq(products.id, productId));

    return record;
  }

  async getLowStockAlerts(): Promise<(Product & { totalStock: number })[]> {
    const allProducts = await db.select().from(products);
    const results = [];

    for (const product of allProducts) {
      if (product.stock <= product.lowStockThreshold) {
        results.push({ ...product, totalStock: product.stock });
      }
    }
    return results;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoriesWithProducts(): Promise<(Category & { products: Product[] })[]> {
    const allCategories = await db.select().from(categories);
    const results = [];

    for (const cat of allCategories) {
      const pc = await db.select({ productId: productCategories.productId })
        .from(productCategories)
        .where(eq(productCategories.categoryId, cat.id))
        .limit(4);

      if (pc.length > 0) {
        const catProducts = await db.select()
          .from(products)
          .where(inArray(products.id, pc.map(x => x.productId)));
        results.push({ ...cat, products: catProducts });
      }
    }
    return results;
  }

  async createCategory(insertCategory: { name: string; slug: string; parentId?: number | null; description?: string }): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async getTags(): Promise<Tag[]> {
    return await db.select().from(tags);
  }

  async createTag(insertTag: { name: string; slug: string }): Promise<Tag> {
    const [tag] = await db.insert(tags).values(insertTag).returning();
    return tag;
  }

  async setProductTaxonomy(productId: number, categoryIds: number[], tagIds: number[]): Promise<void> {
    await db.transaction(async (tx) => {
      // Products can be in multiple categories
      await tx.delete(productCategories).where(eq(productCategories.productId, productId));
      if (categoryIds.length > 0) {
        await tx.insert(productCategories).values(categoryIds.map(categoryId => ({ productId, categoryId })));
      }

      // Products can have multiple tags
      await tx.delete(productTags).where(eq(productTags.productId, productId));
      if (tagIds.length > 0) {
        await tx.insert(productTags).values(tagIds.map(tagId => ({ productId, tagId })));
      }
    });
  }

  async getProductTaxonomy(productId: number): Promise<{ categoryIds: number[]; tagIds: number[] }> {
    const cats = await db.select({ id: productCategories.categoryId })
      .from(productCategories)
      .where(eq(productCategories.productId, productId));

    const tgs = await db.select({ id: productTags.tagId })
      .from(productTags)
      .where(eq(productTags.productId, productId));

    return {
      categoryIds: cats.map(c => c.id),
      tagIds: tgs.map(t => t.id)
    };
  }

  async getAddresses(userId: number): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(userId: number, address: InsertAddress): Promise<Address> {
    const [inserted] = await db.insert(addresses).values({ ...address, userId }).returning();
    return inserted;
  }

  async updateAddress(id: number, userId: number, update: Partial<InsertAddress>): Promise<Address> {
    const [updated] = await db.update(addresses)
      .set(update)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .returning();
    if (!updated) throw new Error("Address not found");
    return updated;
  }

  async deleteAddress(id: number, userId: number): Promise<void> {
    await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
  }

  async getOrderTracking(orderId: number): Promise<OrderTracking[]> {
    return await db.select().from(orderTracking)
      .where(eq(orderTracking.orderId, orderId))
      .orderBy(desc(orderTracking.createdAt));
  }

  async addOrderTracking(orderId: number, tracking: { status: string; description: string; location?: string }): Promise<OrderTracking> {
    const [inserted] = await db.insert(orderTracking).values({ ...tracking, orderId }).returning();
    return inserted;
  }

  async createReturn(insertReturn: InsertReturn): Promise<Return> {
    const [inserted] = await db.insert(returns).values(insertReturn).returning();
    return inserted;
  }

  async getReturns(): Promise<(Return & { order: Order })[]> {
    const results = await db.query.returns.findMany({
      with: {
        order: true
      },
      orderBy: (returns, { desc }) => [desc(returns.createdAt)]
    });
    return results as (Return & { order: Order })[];
  }

  async updateReturnStatus(id: number, status: string, adminNotes?: string): Promise<Return> {
    const update: Partial<Return> = { status };
    if (adminNotes) update.adminNotes = adminNotes;

    const [updated] = await db.update(returns)
      .set(update)
      .where(eq(returns.id, id))
      .returning();
    if (!updated) throw new Error("Return not found");
    return updated;
  }

  async searchUsers(query: string): Promise<User[]> {
    return await db.select().from(users).where(ilike(users.username, `%${query}%`));
  }

  async getBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]> {
    if (publishedOnly) {
      return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.createdAt));
    }
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async createBlogPost(post: InsertBlogPostInternal): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: number, update: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updated] = await db.update(blogPosts).set(update).where(eq(blogPosts.id, id)).returning();
    if (!updated) throw new Error("Blog post not found");
    return updated;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getPages(publishedOnly?: boolean): Promise<Page[]> {
    if (publishedOnly) {
      return await db.select().from(pages).where(eq(pages.isPublished, true));
    }
    return await db.select().from(pages);
  }

  async getPage(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async createPage(page: { title: string; slug: string; content: string; isPublished?: boolean }): Promise<Page> {
    const [newPage] = await db.insert(pages).values(page).returning();
    return newPage;
  }

  async updatePage(id: number, update: Partial<Page>): Promise<Page> {
    const [updated] = await db.update(pages).set(update).where(eq(pages.id, id)).returning();
    return updated;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }

  async getCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async incrementCouponUsage(id: number): Promise<void> {
    const coupon = await db.query.coupons.findFirst({ where: eq(coupons.id, id) });
    if (coupon) {
      await db.update(coupons).set({ usesCount: (coupon.usesCount || 0) + 1 }).where(eq(coupons.id, id));
    }
  }

  async createAnalyticsEvent(event: { eventType: string; userId?: number; sessionId?: string; metadata?: Record<string, unknown> }): Promise<AnalyticsEvent> {
    const [evt] = await db.insert(analyticsEvents).values(event).returning();
    return evt;
  }

  async subscribeToNewsletter(email: string): Promise<NewsletterSubscriber> {
    const [existing] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    if (existing) {
      await db.update(newsletterSubscribers).set({ isActive: true }).where(eq(newsletterSubscribers.id, existing.id));
      return { ...existing, isActive: true };
    }
    const [sub] = await db.insert(newsletterSubscribers).values({ email }).returning();
    return sub;
  }

  async unsubscribeNewsletter(email: string): Promise<void> {
    await db.update(newsletterSubscribers).set({ isActive: false }).where(eq(newsletterSubscribers.email, email));
  }

  // Plugins / Ecosystem integration
  async getPlugins(): Promise<Plugin[]> {
    return await db.select().from(plugins).orderBy(desc(plugins.createdAt));
  }

  async getPlugin(slug: string): Promise<Plugin | undefined> {
    const [plugin] = await db.select().from(plugins).where(eq(plugins.slug, slug));
    return plugin;
  }

  async createPlugin(plugin: InsertPlugin): Promise<Plugin> {
    const [newPlugin] = await db.insert(plugins).values(plugin).returning();
    return newPlugin;
  }

  async updatePluginStatus(id: number, status: string, config?: Record<string, unknown>): Promise<Plugin> {
    const update: Partial<Plugin> = { status, updatedAt: new Date() };
    if (config) update.config = config;
    const [updated] = await db.update(plugins).set(update).where(eq(plugins.id, id)).returning();
    return updated;
  }

  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  // Token Management
  async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResetTokens).values({ userId, token, expiresAt });
  }

  async getPasswordResetToken(token: string): Promise<{ userId: number; expiresAt: Date } | undefined> {
    const [t] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    if (!t) return undefined;
    return { userId: t.userId, expiresAt: t.expiresAt };
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async createEmailVerificationToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    await db.insert(emailVerificationTokens).values({ userId, token, expiresAt });
  }

  async getEmailVerificationToken(token: string): Promise<{ userId: number; expiresAt: Date } | undefined> {
    const [t] = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
    if (!t) return undefined;
    return { userId: t.userId, expiresAt: t.expiresAt };
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
  }

  // Loyalty Program Implementation
  async getUserLoyaltyPoints(userId: number): Promise<number> {
    const [user] = await db.select({ points: users.loyaltyPoints }).from(users).where(eq(users.id, userId));
    return user?.points || 0;
  }

  async updateUserLoyaltyPoints(userId: number, points: number): Promise<void> {
    await db.update(users).set({ loyaltyPoints: points }).where(eq(users.id, userId));
  }

  // Flash Sales Implementation
  async getFlashSales(activeOnly = false): Promise<FlashSale[]> {
    const now = new Date();
    if (activeOnly) {
      return await db.select().from(flashSales).where(
        and(
          eq(flashSales.isActive, true),
          lte(flashSales.startTime, now),
          gte(flashSales.endTime, now)
        )
      );
    }
    return await db.select().from(flashSales);
  }

  async getFlashSale(id: number): Promise<(FlashSale & { products: (FlashSaleProduct & { product: Product })[] }) | undefined> {
    const [sale] = await db.select().from(flashSales).where(eq(flashSales.id, id));
    if (!sale) return undefined;

    const saleProducts = await db.query.flashSaleProducts.findMany({
      where: eq(flashSaleProducts.flashSaleId, id),
      with: { product: true }
    });

    return { ...sale, products: saleProducts };
  }

  async createFlashSale(sale: InsertFlashSale, items: InsertFlashSaleProduct[]): Promise<FlashSale> {
    return await db.transaction(async (tx) => {
      const [newSale] = await tx.insert(flashSales).values(sale).returning();
      if (items.length > 0) {
        await tx.insert(flashSaleProducts).values(
          items.map(item => ({ ...item, flashSaleId: newSale.id }))
        );
      }
      return newSale;
    });
  }

  // Multi-Currency Implementation
  async getCurrencies(): Promise<Currency[]> {
    return await db.select().from(currencies).where(eq(currencies.isActive, true));
  }

  async getCurrencyByCode(code: string): Promise<Currency | undefined> {
    const [currency] = await db.select().from(currencies).where(eq(currencies.code, code));
    return currency;
  }

  // Gift Cards Implementation
  async getGiftCardByCode(code: string): Promise<GiftCard | undefined> {
    const [card] = await db.select().from(giftCards).where(
      and(eq(giftCards.code, code), eq(giftCards.isActive, true))
    );
    return card;
  }

  async createGiftCard(card: InsertGiftCard): Promise<GiftCard> {
    const [newCard] = await db.insert(giftCards).values(card).returning();
    return newCard;
  }

  async updateGiftCardBalance(id: number, amount: number): Promise<void> {
    await db.update(giftCards).set({ remainingValue: amount }).where(eq(giftCards.id, id));
  }

  // Smart Recommendations Implementation
  async getFrequentlyBoughtTogether(productId: number): Promise<Product[]> {
    const orderIdsResult = await db.select({ orderId: orderItems.orderId })
      .from(orderItems)
      .where(eq(orderItems.productId, productId))
      .limit(50);

    const orderIds = orderIdsResult.map(o => o.orderId);
    if (orderIds.length === 0) return [];

    const otherProductsResult = await db.select({
      productId: orderItems.productId,
      count: sql<number>`count(*)`
    })
      .from(orderItems)
      .where(and(
        inArray(orderItems.orderId, orderIds),
        sql`${orderItems.productId} != ${productId}`
      ))
      .groupBy(orderItems.productId)
      .orderBy(desc(sql`count(*)`))
      .limit(4);

    const otherProductIds = otherProductsResult.map(p => p.productId);
    if (otherProductIds.length === 0) return [];

    return await db.select().from(products).where(inArray(products.id, otherProductIds));
  }

  async getRecommendedProducts(userId: number | null): Promise<Product[]> {
    if (!userId) {
      return await db.select().from(products).where(eq(products.isFeatured, true)).limit(8);
    }

    const user = await this.getUser(userId);
    const prefs = user?.preferences || [];

    if (prefs.length > 0) {
      return await db.select().from(products)
        .where(inArray(products.category, prefs))
        .limit(8);
    }

    return await db.select().from(products).where(eq(products.isFeatured, true)).limit(8);
  }


}

export const storage = new DatabaseStorage();


