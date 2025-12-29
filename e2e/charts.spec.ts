import { test, expect } from '@playwright/test'

test.describe('Chart Rendering', () => {
  test('should render Recharts after simulation', async ({ page }) => {
    await page.goto('/')
    await page.locator('button:has-text("EN")').last().click()
    await page.locator('button:has-text("Run Comparison")').last().click()

    // Wait for Recharts surface
    const chart = page.locator('.recharts-surface')
    await expect(chart.first()).toBeVisible()

    // Check for legend
    await expect(page.locator('.recharts-legend-wrapper').first()).toBeVisible()
  })
})
