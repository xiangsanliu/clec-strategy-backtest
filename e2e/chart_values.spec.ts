import { test, expect } from '@playwright/test'

test.describe('Chart Value Formatting', () => {
  test('should display correct formatting when strategy name contains %', async ({ page }) => {
    await page.goto('/')

    // Switch to English
    await page.locator('button:has-text("EN")').last().click()

    // 1. Rename strategy to include "%"
    // Click on the first profile card (it's a div with cursor-pointer)
    await page.locator('.group.relative.p-4.rounded-xl').first().click()

    // Fill the name input
    const nameInput = page.locator('#profile-name-input')
    await nameInput.fill('Mix 50%')

    // Click Done
    await page.locator('button:has-text("Done")').last().click()

    // 2. Run Comparison
    await page.locator('button:has-text("Run Comparison")').last().click()

    // 3. Verify Growth Chart (Currency)
    const growthChart = page.locator('#portfolio-growth-chart')
    await growthChart.scrollIntoViewIfNeeded()

    // Hover over the chart to trigger tooltip
    await growthChart
      .locator('svg.recharts-surface')
      .first()
      .hover({ position: { x: 200, y: 100 } })

    const growthTooltip = growthChart.locator('.recharts-tooltip-wrapper')
    await expect(growthTooltip).toBeVisible()

    // Growth chart should show "$" for "Mix 50%"
    const growthRow = growthTooltip.locator('text=Mix 50%').locator('..')
    const growthValue = growthRow.locator('.font-mono')
    await expect(growthValue).toContainText('$')
    await expect(growthValue).not.toContainText('%')

    // 4. Verify Drawdown Chart (Percent)
    const drawdownChart = page.locator('#drawdown-chart')
    await drawdownChart.scrollIntoViewIfNeeded()
    await drawdownChart
      .locator('svg.recharts-surface')
      .first()
      .hover({ position: { x: 200, y: 50 } })

    const drawdownTooltip = drawdownChart.locator('.recharts-tooltip-wrapper')
    await expect(drawdownTooltip).toBeVisible()

    const drawdownRow = drawdownTooltip.locator('text=Mix 50%').locator('..')
    const drawdownValue = drawdownRow.locator('.font-mono')
    await expect(drawdownValue).toContainText('%')

    // 5. Verify Beta Chart (Number)
    const betaChart = page.locator('#beta-chart')
    await betaChart.scrollIntoViewIfNeeded()
    await betaChart
      .locator('svg.recharts-surface')
      .first()
      .hover({ position: { x: 200, y: 50 } })

    const betaTooltip = betaChart.locator('.recharts-tooltip-wrapper')
    await expect(betaTooltip).toBeVisible()

    const betaRow = betaTooltip.locator('text=Mix 50% Beta').locator('..')
    const betaValue = betaRow.locator('.font-mono')
    // Beta should be a number, no $ or %
    const betaText = await betaValue.innerText()
    expect(betaText).not.toContain('$')
    expect(betaText).not.toContain('%')
    expect(parseFloat(betaText)).not.toBeNaN()
  })
})
