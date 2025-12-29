import { test, expect } from '@playwright/test'

test.describe('Calculation Flow', () => {
  test('should run simulation and display results', async ({ page }) => {
    await page.goto('/')

    // Ensure we are in English for easier selector matching
    await page.locator('button:has-text("EN")').last().click()

    // Click Run Comparison
    const runBtn = page.locator('button:has-text("Run Comparison")').last()
    await runBtn.click()

    // Verify Results Dashboard is visible
    await expect(page.locator('h2:has-text("Simulation Results")')).toBeVisible()

    // Check if we have cards with metrics
    const metrics = page.locator('.grid >> text=CAGR')
    await expect(metrics.first()).toBeVisible()
  })

  test('should allow editing a profile and re-running', async ({ page }) => {
    await page.goto('/')
    await page.locator('button:has-text("EN")').last().click()

    // Edit the first profile
    await page.click('text=Conservative')

    // Change Initial Capital (using a more robust placeholder or text-based selector)
    const capitalInput = page
      .locator('input[placeholder*="26,000"], input[placeholder*="22,000"], input[type="number"]')
      .first()
    await capitalInput.fill('50000')

    // Click Done
    await page.locator('button:has-text("Done")').last().click()

    // Run Simulation
    await page.locator('button:has-text("Run Comparison")').last().click()

    // Verify results reflect higher capital (indirectly by checking visibility of result)
    await expect(page.locator('text=Simulation Results')).toBeVisible()
  })
})
