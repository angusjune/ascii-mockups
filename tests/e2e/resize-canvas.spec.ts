import { test, expect } from '@playwright/test'

async function shrinkCanvas(page: import('@playwright/test').Page, w: number, h: number) {
  const widthInput = page.getByRole('spinbutton', { name: 'W' })
  const heightInput = page.getByRole('spinbutton', { name: 'H' })
  await widthInput.fill(String(w))
  await widthInput.blur()
  await heightInput.fill(String(h))
  await heightInput.blur()
  await expect(widthInput).toHaveValue(String(w))
  await expect(heightInput).toHaveValue(String(h))
}

test('dragging the corner handle resizes width and height', async ({ page }) => {
  await page.goto('/')
  await shrinkCanvas(page, 30, 15)

  const canvasPre = page.locator('main pre')
  await expect(canvasPre).toBeVisible()
  const box = await canvasPre.boundingBox()
  if (!box) throw new Error('canvas not found')

  // Drag SE corner outward by a known amount measured in cells.
  const charW = box.width / 30
  const charH = box.height / 15
  const dxCells = 8
  const dyCells = 4

  const startX = box.x + box.width
  const startY = box.y + box.height
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + dxCells * charW, startY + dyCells * charH, { steps: 10 })
  await page.mouse.up()

  const widthInput = page.getByRole('spinbutton', { name: 'W' })
  const heightInput = page.getByRole('spinbutton', { name: 'H' })
  await expect(widthInput).toHaveValue(String(30 + dxCells))
  await expect(heightInput).toHaveValue(String(15 + dyCells))
})

test('dragging the right edge handle resizes only width', async ({ page }) => {
  await page.goto('/')
  await shrinkCanvas(page, 30, 15)

  const canvasPre = page.locator('main pre')
  const box = await canvasPre.boundingBox()
  if (!box) throw new Error('canvas not found')

  const charW = box.width / 30
  const dxCells = -10

  // Vertical midpoint to avoid hitting the corner handle.
  const startX = box.x + box.width
  const startY = box.y + box.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + dxCells * charW, startY, { steps: 8 })
  await page.mouse.up()

  const widthInput = page.getByRole('spinbutton', { name: 'W' })
  const heightInput = page.getByRole('spinbutton', { name: 'H' })
  await expect(widthInput).toHaveValue(String(30 + dxCells))
  await expect(heightInput).toHaveValue('15')
})

test('dragging the bottom edge handle resizes only height', async ({ page }) => {
  await page.goto('/')
  await shrinkCanvas(page, 30, 15)

  const canvasPre = page.locator('main pre')
  const box = await canvasPre.boundingBox()
  if (!box) throw new Error('canvas not found')

  const charH = box.height / 15
  const dyCells = 6

  const startX = box.x + box.width / 2
  const startY = box.y + box.height
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX, startY + dyCells * charH, { steps: 8 })
  await page.mouse.up()

  const widthInput = page.getByRole('spinbutton', { name: 'W' })
  const heightInput = page.getByRole('spinbutton', { name: 'H' })
  await expect(widthInput).toHaveValue('30')
  await expect(heightInput).toHaveValue(String(15 + dyCells))
})

test('resize is one history entry: undo restores the original size', async ({ page }) => {
  await page.goto('/')
  await shrinkCanvas(page, 30, 15)

  const canvasPre = page.locator('main pre')
  const box = await canvasPre.boundingBox()
  if (!box) throw new Error('canvas not found')

  const charW = box.width / 30
  const charH = box.height / 15
  const startX = box.x + box.width
  const startY = box.y + box.height
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  // Multiple intermediate move events — should still coalesce to one history entry.
  await page.mouse.move(startX + 2 * charW, startY + 2 * charH, { steps: 4 })
  await page.mouse.move(startX + 5 * charW, startY + 5 * charH, { steps: 4 })
  await page.mouse.move(startX + 8 * charW, startY + 4 * charH, { steps: 4 })
  await page.mouse.up()

  const widthInput = page.getByRole('spinbutton', { name: 'W' })
  const heightInput = page.getByRole('spinbutton', { name: 'H' })
  await expect(widthInput).toHaveValue('38')
  await expect(heightInput).toHaveValue('19')

  // One undo should restore to the pre-drag size, not just one move step.
  await page.locator('body').click({ position: { x: box.x + 5, y: box.y + 5 } })
  await page.keyboard.press('Meta+z')
  await expect(widthInput).toHaveValue('30')
  await expect(heightInput).toHaveValue('15')
})
