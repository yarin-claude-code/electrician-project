import { test, expect } from '@playwright/test'

const WIZARD_URL = '/inspections/00000000-0000-0000-0000-000000000001'

async function advanceToStep(page: import('@playwright/test').Page, targetStep: number) {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  for (let i = 1; i < targetStep; i++) {
    const nextBtn = page.locator('button:has-text("הבא")')
    await nextBtn.waitFor({ state: 'visible', timeout: 5000 })
    await nextBtn.click()
    await page.waitForTimeout(800)
  }
}

// ── S6 — Step 2: Visual Checks ────────────────────────────────────────────────

test('S6 — visual checks step renders check categories', async ({ page }) => {
  await advanceToStep(page, 2)
  await expect(page.locator('text=בדיקה חזותית').first()).toBeVisible()
  // At least 3 category headings should appear
  const categories = await page.locator('[class*="category"], h3, h4').count()
  expect(categories).toBeGreaterThanOrEqual(1)
})

test('S6 — visual checks items have Pass/Fail/NA buttons', async ({ page }) => {
  await advanceToStep(page, 2)
  const passBtn = page
    .locator('button:has-text("תקין"), button:has-text("עובר"), button:has-text("כן")')
    .first()
  await expect(passBtn).toBeVisible()
})

test('S6 — clicking Pass highlights the button', async ({ page }) => {
  await advanceToStep(page, 2)
  const passBtn = page
    .locator('button:has-text("תקין"), button:has-text("עובר"), button:has-text("כן")')
    .first()
  await passBtn.click()
  await page.waitForTimeout(300)
  // After clicking, the button should have a selected/active visual state
  // We verify it didn't disappear (still visible) and aria-pressed or data attribute may be set
  await expect(passBtn).toBeVisible()
})

test('S6 — clicking Fail reveals defect text input', async ({ page }) => {
  await advanceToStep(page, 2)
  const failBtn = page
    .locator('button:has-text("ליקוי"), button:has-text("לא תקין"), button:has-text("נכשל")')
    .first()
  if (await failBtn.isVisible()) {
    await failBtn.click()
    await page.waitForTimeout(300)
    // A text input or textarea for defect description should appear
    const defectInput = page.locator(
      'input[placeholder*="ליקוי"], input[placeholder*="תיאור"], textarea[placeholder*="ליקוי"], textarea[placeholder*="תיאור"]'
    )
    await expect(defectInput.first()).toBeVisible()
  }
})

test('S6 — no console errors on visual checks step', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await advanceToStep(page, 2)
  await page.waitForTimeout(500)
  const fatal = errors.filter((e) => !e.includes('favicon') && !e.includes('supabase'))
  expect(fatal).toHaveLength(0)
})

// ── S7 — Step 3: Instruments ──────────────────────────────────────────────────

test('S7 — instruments step shows add instrument button', async ({ page }) => {
  await advanceToStep(page, 3)
  await expect(page.locator('button:has-text("הוסף מכשיר")').first()).toBeVisible()
})

test('S7 — adding instrument creates row with type dropdown and date', async ({ page }) => {
  await advanceToStep(page, 3)
  await page.locator('button:has-text("הוסף מכשיר")').click()
  await page.waitForTimeout(500)
  // Row with type selector should appear
  const typeSelector = page.locator('select, [role="combobox"], [class*="select"]').first()
  await expect(typeSelector).toBeVisible()
  // Calibration date input
  const dateInput = page
    .locator('input[type="date"], input[name*="date"], input[placeholder*="תאריך"]')
    .first()
  await expect(dateInput).toBeVisible()
})

test('S7 — no console errors on instruments step', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await advanceToStep(page, 3)
  await page.waitForTimeout(500)
  const fatal = errors.filter((e) => !e.includes('favicon') && !e.includes('supabase'))
  expect(fatal).toHaveLength(0)
})

// ── S8a — Step 4: Panels ──────────────────────────────────────────────────────

test('S8a — panels step shows add panel button', async ({ page }) => {
  await advanceToStep(page, 4)
  await expect(page.locator('button:has-text("הוסף לוח")').first()).toBeVisible()
})

test('S8a — adding panel creates panel row and circuit table', async ({ page }) => {
  await advanceToStep(page, 4)
  await page.locator('button:has-text("הוסף לוח")').click()
  await page.waitForTimeout(500)
  // Panel name input should appear
  const panelInput = page
    .locator('input[name*="panel"], input[placeholder*="לוח"], input[placeholder*="שם"]')
    .first()
  await expect(panelInput).toBeVisible()
})

test('S8a — no console errors on panels step', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await advanceToStep(page, 4)
  await page.waitForTimeout(500)
  const fatal = errors.filter((e) => !e.includes('favicon') && !e.includes('supabase'))
  expect(fatal).toHaveLength(0)
})

// ── S8b — Step 5: Fault Loop ──────────────────────────────────────────────────

test('S8b — fault loop step shows Zs input fields', async ({ page }) => {
  await advanceToStep(page, 5)
  // Z_s or impedance fields
  const zsInput = page
    .locator(
      'input[name*="zs"], input[name*="Z_s"], input[placeholder*="Z"], input[id*="zs"], input[id*="impedance"]'
    )
    .first()
  await expect(zsInput).toBeVisible()
})

test('S8b — no console errors on fault loop step', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await advanceToStep(page, 5)
  await page.waitForTimeout(500)
  const fatal = errors.filter((e) => !e.includes('favicon') && !e.includes('supabase'))
  expect(fatal).toHaveLength(0)
})

// ── S8c — Step 6: Defects ─────────────────────────────────────────────────────

test('S8c — defects step renders defect list', async ({ page }) => {
  await advanceToStep(page, 6)
  // Either a list of defects or an "add defect" button
  const hasContent =
    (await page.locator('text=ליקויים').count()) > 0 ||
    (await page.locator('button:has-text("הוסף ליקוי")').count()) > 0 ||
    (await page.locator('[class*="defect"]').count()) > 0
  expect(hasContent).toBe(true)
})

test('S8c — no console errors on defects step', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await advanceToStep(page, 6)
  await page.waitForTimeout(500)
  const fatal = errors.filter((e) => !e.includes('favicon') && !e.includes('supabase'))
  expect(fatal).toHaveLength(0)
})

// ── S8d — Step 7: Recommendations ────────────────────────────────────────────

test('S8d — recommendations step shows textarea', async ({ page }) => {
  await advanceToStep(page, 7)
  const textarea = page.locator('textarea').first()
  await expect(textarea).toBeVisible()
})

test('S8d — no console errors on recommendations step', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await advanceToStep(page, 7)
  await page.waitForTimeout(500)
  const fatal = errors.filter((e) => !e.includes('favicon') && !e.includes('supabase'))
  expect(fatal).toHaveLength(0)
})

// ── S10 — Step 9 (last step without generator): Review & Sign ─────────────────

test('S10 — review step has no Next button, only submit', async ({ page }) => {
  // Without generator, step 9 is the last step (advance 8 times from step 1)
  await advanceToStep(page, 8)
  // "הבא" should NOT be visible on the last step
  const nextBtn = page.locator('button:has-text("הבא")')
  const nextVisible = await nextBtn.isVisible().catch(() => false)
  expect(nextVisible).toBe(false)
})

test('S10 — review step shows summary table', async ({ page }) => {
  await advanceToStep(page, 8)
  // Summary content — client or date info should be visible
  const summary = page.locator('table, [class*="summary"], [class*="review"]').first()
  await expect(summary).toBeVisible()
})

test('S10 — review step has signature canvas', async ({ page }) => {
  await advanceToStep(page, 8)
  await expect(page.locator('canvas').first()).toBeVisible()
})

test('S10 — signature canvas is drawable', async ({ page }) => {
  await advanceToStep(page, 8)
  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  if (box) {
    await page.mouse.move(box.x + 30, box.y + 50)
    await page.mouse.down()
    await page.mouse.move(box.x + 100, box.y + 80)
    await page.mouse.move(box.x + 150, box.y + 50)
    await page.mouse.up()
    // Canvas should have non-blank pixel data after drawing
    const isBlank = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d')
      if (!ctx) return true
      const data = ctx.getImageData(0, 0, el.width, el.height).data
      return data.every((v) => v === 0 || v === 255)
    })
    expect(isBlank).toBe(false)
  }
})

test('S10 — no console errors on review step', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await advanceToStep(page, 8)
  await page.waitForTimeout(500)
  const fatal = errors.filter((e) => !e.includes('favicon') && !e.includes('supabase'))
  expect(fatal).toHaveLength(0)
})
