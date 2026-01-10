import { test, expect } from '@playwright/test';

test.describe('Guest Checkout Flow', () => {
    test('should allow guest to add to cart and checkout without login', async ({ page }) => {
        test.setTimeout(120000);
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

        // 1. Navigate to home (no login)
        console.log("Navigating to home...");
        await page.goto('/', { waitUntil: 'commit' });
        console.log("Navigation committed. Waiting for body...");
        await page.waitForSelector('body');
        console.log("Body found. URL:", page.url());

        // 2. Wait for products to load
        console.log("Waiting for 'The Collection' text...");
        await expect(page.getByText('The Collection')).toBeVisible({ timeout: 30000 });
        console.log("'The Collection' found.");

        const products = page.locator('div.group.relative');
        // Wait for at least one product to be visible
        await products.first().waitFor({ state: 'visible', timeout: 30000 });
        const count = await products.count();
        let foundInStock = false;

        for (let i = 0; i < count; ++i) {
            await products.nth(i).click();
            await expect(page).toHaveURL(/\/product\/\d+/);

            // Check if available
            const addToCartBtn = page.getByRole('button', { name: /add to manifest/i });
            try {
                await addToCartBtn.waitFor({ state: 'visible', timeout: 5000 });
                foundInStock = true;
                break;
            } catch {
                // Product stuck or sold out, try next
            }

            // Go back and try next
            await page.goBack();
            await expect(page.getByText('The Collection')).toBeVisible();
        }

        expect(foundInStock, 'No in-stock products found').toBeTruthy();

        // 3. Verify Product Detail page
        await expect(page).toHaveURL(/\/product\/\d+/);

        // 4. Add to cart
        const addToCartButton = page.getByRole('button', { name: /add to manifest/i });
        await expect(addToCartButton).toBeVisible();
        await addToCartButton.click();

        // Verify localStorage updated
        const afterAdd = await page.evaluate(() => localStorage.getItem('guest_cart'));
        console.log('After add to cart, guest_cart:', afterAdd);

        // 5. Navigate to cart
        await page.goto('/cart', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL('/cart');
        // Verify cart page loaded
        await expect(page.getByRole('heading', { name: /your bag/i })).toBeVisible();

        // 6. Proceed to Checkout
        const checkoutButton = page.getByRole('button', { name: /continue to checkout/i });
        await expect(checkoutButton).toBeVisible();
        await checkoutButton.click();
        await expect(page).toHaveURL('/checkout');

        // 7. Fill out Guest Checkout Form
        await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible({ timeout: 30000 });

        // Verify Guest Login Option exists
        await expect(page.getByText('Have an account?')).toBeVisible();
        await expect(page.getByRole('button', { name: /login \/ register/i })).toBeVisible();

        await page.locator('input[name="customerFullName"]').fill('Guest Shopper');
        await page.locator('input[name="customerEmail"]').fill('guest@example.com');
        await page.locator('input[name="phoneNumber"]').fill('0712345678');
        await page.locator('input[name="shippingAddress"]').fill('123 Guest St');
        await page.locator('input[name="shippingCity"]').fill('Nairobi');
        await page.locator('input[name="shippingZipCode"]').fill('00100');

        // 8. Submit Order
        const confirmButton = page.getByRole('button', { name: /confirm order/i });
        await expect(confirmButton).toBeEnabled();
        await confirmButton.click();

        // 9. Verify Success
        await page.waitForSelector('text=Order Confirmed', { timeout: 15000 });
        await expect(page.getByText(/order confirmed/i)).toBeVisible();
        await expect(page.getByText(/thank you for your purchase/i)).toBeVisible();

        // 10. Verify "Return to Shop" button exists
        await expect(page.getByRole('button', { name: /return to shop/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /view my orders/i })).not.toBeVisible();
    });
});
