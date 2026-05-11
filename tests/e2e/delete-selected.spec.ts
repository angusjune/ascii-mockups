import { test, expect } from '@playwright/test'

async function placeButton(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'New' }).click()
  await page.getByRole('button', { name: /^Button/ }).click()
  const canvasPre = page.locator('main pre')
  const box = await canvasPre.boundingBox()
  if (!box) throw new Error('canvas not found')
  await page.mouse.click(box.x + 60, box.y + 40)
  await expect(page.getByText('button', { exact: true }).first()).toBeVisible()
}

test('Backspace deletes the selected shape', async ({ page }) => {
  await page.goto('/')
  await placeButton(page)
  await page.keyboard.press('Backspace')
  await expect(page.getByText('No layers.')).toBeVisible()
})

test('Delete deletes the selected shape', async ({ page }) => {
  await page.goto('/')
  await placeButton(page)
  await page.keyboard.press('Delete')
  await expect(page.getByText('No layers.')).toBeVisible()
})

test('Backspace still deletes shape even if name input had focus before canvas click', async ({
  page,
}) => {
  await page.goto('/')
  await placeButton(page)

  // Focus the name input first — this is the scenario that used to fail.
  const nameInput = page.getByRole('textbox', { name: 'Mockup name' })
  await nameInput.focus()
  await expect(nameInput).toBeFocused()

  // Click the button shape in the canvas to re-select it (and blur the input).
  const canvasPre = page.locator('main pre')
  const box = await canvasPre.boundingBox()
  if (!box) throw new Error('canvas not found')
  await page.mouse.click(box.x + 60, box.y + 40)

  await page.keyboard.press('Backspace')
  await expect(page.getByText('No layers.')).toBeVisible()
})
