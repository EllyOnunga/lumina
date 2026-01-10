# Lumina E-Commerce API Documentation

## Overview

This is a headless, API-first e-commerce platform built with Express.js, PostgreSQL, and Drizzle ORM. The API follows REST principles and returns JSON responses.

**Base URL**: `https://your-domain.com/api`

**Authentication**: Session-based authentication with secure cookies

---

## Security Features

### 🔒 Implemented Security Measures

1. **HTTPS Enforcement** - All traffic encrypted with SSL/TLS
2. **Helmet.js** - Security headers (CSP, HSTS, X-Frame-Options, etc.)
3. **Rate Limiting** - Prevents brute force and DDoS attacks
4. **CORS** - Configured allowed origins
5. **HPP** - HTTP Parameter Pollution protection
6. **CSRF Protection** - Token-based CSRF validation
7. **Input Sanitization** - XSS prevention
8. **Fraud Detection** - Basic fraud pattern detection
9. **PCI DSS Compliance** - Tokenized payments (no card storage)
10. **Session Security** - Secure, httpOnly cookies with SameSite

### Rate Limits

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Checkout/Payment**: 10 requests per hour

---

## Performance Optimizations

### ⚡ Implemented Optimizations

1. **Compression** - Gzip/Deflate for all responses
2. **Code Splitting** - Vendor chunks for better caching
3. **Minification** - Terser for production builds
4. **Asset Optimization** - Hashed filenames, CDN-ready
5. **Database Indexing** - Optimized queries
6. **Caching Strategy** - Static assets cached for 1 year
7. **PWA Support** - Offline functionality, installable app
8. **Service Worker** - Network-first for API, cache-first for assets

---

## API Endpoints

### Authentication

#### POST `/api/register`

Register a new user account.

**Request Body**:

```json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

**Response**: `201 Created`

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "isAdmin": false
}
```

#### POST `/api/login`

Login with credentials.

**Request Body**:

```json
{
  "username": "string",
  "password": "string"
}
```

**Response**: `200 OK`

#### POST `/api/logout`

Logout current user.

**Response**: `200 OK`

---

### Products

#### GET `/api/products`

Get all products with optional filters.

**Query Parameters**:

- `search` - Search term
- `category` - Filter by category
- `brand` - Filter by brand
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sort` - Sort order (price-asc, price-desc, name, newest)
- `isFeatured` - Filter featured products
- `isNewArrival` - Filter new arrivals

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "image": "url",
    "category": "Category",
    "stock": 10,
    "sku": "SKU123"
  }
]
```

#### GET `/api/products/:id`

Get single product with details.

**Response**: `200 OK`

#### POST `/api/products` (Admin)

Create a new product.

#### PATCH `/api/products/:id` (Admin)

Update a product.

#### DELETE `/api/products/:id` (Admin)

Delete a product.

---

### Cart

#### GET `/api/cart`

Get current user's cart.

**Response**: `200 OK`

```json
{
  "id": 1,
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "product": { /* product details */ }
    }
  ]
}
```

#### POST `/api/cart`

Add item to cart.

**Request Body**:

```json
{
  "productId": 1,
  "quantity": 1
}
```

#### PATCH `/api/cart/:productId`

Update item quantity.

#### DELETE `/api/cart/:productId`

Remove item from cart.

#### DELETE `/api/cart`

Clear entire cart.

---

### Orders

#### POST `/api/orders`

Create a new order.

**Request Body**:

```json
{
  "subtotal": 100.00,
  "taxAmount": 8.00,
  "shippingCost": 10.00,
  "total": 118.00,
  "shippingMethod": "standard",
  "customerFullName": "John Doe",
  "customerEmail": "john@example.com",
  "shippingAddress": "123 Main St",
  "shippingCity": "Nairobi",
  "shippingZipCode": "00100",
  "phoneNumber": "+254700000000",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 50.00
    }
  ]
}
```

**Response**: `201 Created`

#### GET `/api/orders`

Get user's order history.

#### GET `/api/admin/orders` (Admin)

Get all orders.

#### PATCH `/api/admin/orders/:id/status` (Admin)

Update order status.

---

### Payment

#### POST `/api/payment/stripe/create-payment-intent`

Create Stripe payment intent.

#### POST `/api/payment/stripe/webhook`

Stripe webhook handler.

#### POST `/api/payment/mpesa/initiate`

Initiate M-PESA payment.

#### POST `/api/payment/mpesa/callback`

M-PESA callback handler.

#### POST `/api/payment/paypal/create-order`

Create PayPal order.

#### POST `/api/payment/paypal/capture`

Capture PayPal payment.

---

### Returns

#### POST `/api/returns`

Create a return request.

**Request Body**:

```json
{
  "orderId": 1,
  "reason": "Defective product",
  "description": "Item arrived damaged"
}
```

#### GET `/api/admin/returns` (Admin)

Get all return requests.

#### PATCH `/api/admin/returns/:id` (Admin)

Update return status.

---

### User Management

#### GET `/api/user/addresses`

Get user's saved addresses.

#### POST `/api/user/addresses`

Add new address.

#### PATCH `/api/user/addresses/:id`

Update address.

#### DELETE `/api/user/addresses/:id`

Delete address.

#### PATCH `/api/user/preferences`

Update user preferences.

---

### Admin Endpoints

#### GET `/api/admin/users`

Get all users.

#### PATCH `/api/admin/users/:id`

Update user (toggle admin status).

#### GET `/api/admin/customers/search`

Search customers.

#### POST `/api/admin/bootstrap`

Bootstrap first admin (only works if no admin exists).

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

**Common Status Codes**:

- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Progressive Web App (PWA)

The application is installable as a PWA with:

- **Offline Support** - Service worker caching
- **Push Notifications** - Order updates
- **Background Sync** - Offline order queue
- **App-like Experience** - Standalone display mode

---

## Scalability Considerations

### Current Implementation

1. **Stateless API** - Horizontal scaling ready
2. **Database Connection Pooling** - Efficient resource usage
3. **Session Store** - PostgreSQL-backed sessions
4. **Compression** - Reduced bandwidth usage

### Recommended for Production

1. **Load Balancer** - Nginx or AWS ALB
2. **CDN** - CloudFlare, AWS CloudFront
3. **Database Replication** - Read replicas
4. **Redis Cache** - Session and data caching
5. **Message Queue** - RabbitMQ or AWS SQS for async tasks
6. **Monitoring** - New Relic, DataDog, or Sentry
7. **Auto-scaling** - Kubernetes or AWS ECS

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Session
SESSION_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# M-PESA
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Environment
NODE_ENV=production
PORT=5000
```

---

## Testing

Run tests with:

```bash
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
```

---

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL certificate
- [ ] Set strong `SESSION_SECRET`
- [ ] Configure `ALLOWED_ORIGINS`
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Configure CDN for static assets
- [ ] Test payment webhooks
- [ ] Enable database connection pooling
- [ ] Set up log aggregation
- [ ] Configure auto-scaling
- [ ] Test disaster recovery

---

## Support

For API support, contact: <support@lumina.com>

**API Version**: 1.0.0  
**Last Updated**: 2026-01-10
