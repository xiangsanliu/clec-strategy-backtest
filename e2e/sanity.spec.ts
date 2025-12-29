import { test, expect } from '@playwright/test'

test.describe('Sanity Check', () => {
  test('should load the home page and show the app title', async ({ page }) => {
    await page.goto('/')
    const title = page.locator('h1').last()
    await expect(title).toBeVisible()
    // Default language is English (from i18n.tsx)
    await expect(title).toContainText('QQQ Backtester')
  })

  test('should switch language', async ({ page }) => {
    await page.goto('/')
    // Switch to English using the visible button (desktop is last in DOM)
    await page.locator('button:has-text("EN")').last().click()
    await expect(page.locator('h1').last()).toContainText('QQQ Backtester')
  })
})
