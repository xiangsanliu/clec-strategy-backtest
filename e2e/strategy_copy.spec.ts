import { test, expect } from '@playwright/test'

test.describe('Strategy Copy Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should copy a strategy with the correct prefix and new color in English', async ({
    page,
  }) => {
    // 1. Ensure English
    await page.locator('button:has-text("EN")').last().click()

    // 2. Locate the first profile name
    const firstProfileName = await page
      .locator('.font-bold.text-slate-800.text-sm')
      .first()
      .textContent()

    // 3. Click the copy button of the first profile
    // The copy button has the title "Copy Profile"
    await page.getByTitle('Copy Profile').first().click()

    // 4. Verify it entered edit mode
    await expect(page.getByText('Edit Profile')).toBeVisible()

    // 5. Verify the new name is in the input field
    const newProfileName = `Copy- ${firstProfileName}`
    await expect(page.getByLabel('Profile Name')).toHaveValue(newProfileName)
  })

  test('should copy a strategy with the correct prefix in Simplified Chinese', async ({ page }) => {
    // 1. Switch to Simplified Chinese
    await page.locator('button:has-text("简")').last().click()

    // 2. Locate the first profile name
    const firstProfileName = await page
      .locator('.font-bold.text-slate-800.text-sm')
      .first()
      .textContent()

    // 3. Click the copy button (Localised title: "复制配置方案")
    await page.getByTitle('复制配置方案').first().click()

    // 4. Verify it entered edit mode
    await expect(page.getByText('编辑方案')).toBeVisible()

    // 5. Verify the new name is in the input field
    const expectedName = `复制-${firstProfileName}`
    await expect(page.getByLabel('方案名称')).toHaveValue(expectedName)
  })
})
