import { test, expect } from '@playwright/test'

test('drawing a button and copying ASCII puts text on the clipboard', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')

  // Pick the Button tool from the palette (templates click-places a shape at canvas center).
  await page.getByRole('button', { name: /^Button/ }).click()

  const canvasPre = page.locator('pre').first()
  await expect(canvasPre).toBeVisible()
  const box = await canvasPre.boundingBox()
  if (!box) throw new Error('canvas not found')

  // Click somewhere inside the canvas to place the button.
  await page.mouse.click(box.x + 60, box.y + 40)

  // Copy ASCII via the CTA button.
  await page.getByRole('button', { name: 'Copy ASCII' }).click()

  const text = await page.evaluate(() => navigator.clipboard.readText())
  expect(text).toMatch(/Button/)
})
