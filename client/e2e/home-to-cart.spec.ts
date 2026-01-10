import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
    test('should navigate from home to product detail and add to cart', async ({ page }) => {
        // 1. Register a fresh user to ensure we are authenticated
        const timestamp = Date.now();
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');
        await page.getByRole('tab', { name: /register/i }).click();
        await page.locator('#reg-username').fill(`user_${timestamp}`);
        await page.locator('#reg-email').fill(`user_${timestamp}@example.com`);
        await page.locator('#reg-password').fill('password123');
        await page.getByRole('button', { name: /create account/i }).click();
        await expect(page).toHaveURL('/');

        // 2. Click on a product card
        const firstProduct = page.locator('div.group.relative').first();
        await expect(firstProduct).toBeVisible();
        await firstProduct.click();

        // 3. Verify Product Detail page
        await expect(page).toHaveURL(/\/product\/\d+/);
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

        // 4. Add to cart
        const addToCartButton = page.getByRole('button', { name: /add to cart/i });
        await expect(addToCartButton).toBeVisible();
        await addToCartButton.click();

        // 5. Check toast notification
        await expect(page.getByText(/added to cart/i)).toBeVisible();

        // 6. Navigate to cart via UI for better reliability in SPAs
        await page.getByRole('button', { name: /shopping cart/i }).or(page.getByRole('link', { name: /shopping cart/i })).click();
        await expect(page).toHaveURL('/cart');

        // 7. Verify item is in cart
        await expect(page.getByRole('heading', { level: 1, name: /shopping cart/i })).toBeVisible();
        await expect(page.locator('div.flex.gap-6.py-6.border-b')).toBeVisible();

        // 8. Verify order summary
        await expect(page.getByText(/order summary/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /checkout/i })).toBeEnabled();
    });
});
