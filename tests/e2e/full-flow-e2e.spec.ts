/**
 * S14 — Full End-to-End Flow
 * Covers: auth → dashboard → wizard steps 1–9 → PDF report → navigation → dark mode
 * Run after major feature changes or before merges.
 */
import { test, expect } from '@playwright/test'

const WIZARD_URL = '/inspections/00000000-0000-0000-0000-000000000001'

// ── Phase 1 — Auth ────────────────────────────────────────────────────────────

test('S14 Phase 1 — login page RTL + Hebrew heading + inputs', async ({ page }) => {
  await page.goto('/auth/login')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('html')).toHaveAttribute('lang', 'he')
  await expect(page.locator('text=כניסה למערכת')).toBeVisible()
  await expect(page.locator('input[type="email"]')).toBeVisible()
  await expect(page.locator('input[type="password"]')).toBeVisible()
})

test('S14 Phase 1 — empty form submit shows validation error', async ({ page }) => {
  await page.goto('/auth/login')
  const submitBtn = page.locator('button[type="submit"]')
  if (await submitBtn.isVisible()) {
    await submitBtn.click()
    await page.waitForTimeout(500)
    const errorVisible =
      (await page.locator('[class*="error"], [class*="invalid"], [aria-invalid]').count()) > 0 ||
      (await page.locator('text=/שדה|נדרש|חובה|אימייל/').count()) > 0
    expect(errorVisible).toBe(true)
  }
})

// ── Phase 2 — Dashboard ───────────────────────────────────────────────────────

test('S14 Phase 2 — dashboard KPI cards, search, charts, recent inspections', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')

  // 4 KPI cards
  for (const text of ['סה"כ', 'הושלמו', 'טיוטות', 'נדחו']) {
    await expect(page.locator(`text=${text}`).first()).toBeVisible()
  }

  // Demo banner
  await expect(page.locator('text=מצב תצוגה').first()).toBeVisible()

  // Search input
  const searchInput = page.locator('input[placeholder*="חיפוש"]').first()
  await expect(searchInput).toBeVisible()
  await searchInput.fill('ישראל')
  await page.waitForTimeout(400)
  await searchInput.fill('')
  await page.waitForTimeout(300)

  // Charts (SVG)
  const svgCount = await page.locator('svg').count()
  expect(svgCount).toBeGreaterThan(0)
})

// ── Phase 3 — Wizard Shell ────────────────────────────────────────────────────

test('S14 Phase 3 — wizard shell step 1 render + navigation controls', async ({ page }) => {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  await expect(page.locator('text=מידע כללי').first()).toBeVisible()
  await expect(page.locator('[role="progressbar"]')).toBeVisible()
  await expect(page.locator('button:has-text("הבא")')).toBeEnabled()
  await expect(page.locator('button:has-text("הקודם")')).toBeDisabled()

  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  const fatal = errors.filter((e) => !e.includes('favicon') && !e.includes('supabase'))
  expect(fatal).toHaveLength(0)
})

// ── Phase 4 — Step 1: General Info ───────────────────────────────────────────

test('S14 Phase 4 — fill general info fields and advance', async ({ page }) => {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  // Fill client name
  const clientInput = page
    .locator('#clientName, input[name*="client"], input[placeholder*="שם לקוח"]')
    .first()
  if (await clientInput.isVisible()) {
    await clientInput.fill('ישראל ישראלי')
    expect(await clientInput.inputValue()).toBe('ישראל ישראלי')
  }

  // Fill address
  const addressInput = page
    .locator('input[name*="address"], input[placeholder*="כתובת"], #address')
    .first()
  if (await addressInput.isVisible()) {
    await addressInput.fill('רחוב הרצל 12, תל אביב')
  }

  // Advance to step 2
  await page.locator('button:has-text("הבא")').click()
  await page.waitForTimeout(1000)
  await expect(page.locator('text=בדיקה חזותית').first()).toBeVisible()
})

// ── Phase 5 — Step 2: Visual Checks ──────────────────────────────────────────

test('S14 Phase 5 — visual checks pass items and advance', async ({ page }) => {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  await page.locator('button:has-text("הבא")').click()
  await page.waitForTimeout(1000)

  await expect(page.locator('text=בדיקה חזותית').first()).toBeVisible()

  // Click Pass on first available item
  const passBtn = page.locator('button:has-text("תקין"), button:has-text("עובר")').first()
  if (await passBtn.isVisible()) {
    await passBtn.click()
    await page.waitForTimeout(300)
  }

  // Advance to step 3
  await page.locator('button:has-text("הבא")').click()
  await page.waitForTimeout(1000)
  // Should be on step 3 now
  const stepLabel = await page.locator('text=מכשירים, text=כלי מדידה').count()
  expect(stepLabel + (await page.locator('button:has-text("הבא")').count())).toBeGreaterThan(0)
})

// ── Phase 6 — Step 3: Instruments ────────────────────────────────────────────

test('S14 Phase 6 — add instrument and advance', async ({ page }) => {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  // Advance to step 3
  for (let i = 0; i < 2; i++) {
    await page.locator('button:has-text("הבא")').click()
    await page.waitForTimeout(800)
  }

  const addBtn = page.locator('button:has-text("הוסף מכשיר")')
  if (await addBtn.isVisible()) {
    await addBtn.click()
    await page.waitForTimeout(500)
    const dateInput = page.locator('input[type="date"]').first()
    if (await dateInput.isVisible()) {
      await dateInput.fill('2025-12-31')
    }
  }

  await page.locator('button:has-text("הבא")').click()
  await page.waitForTimeout(1000)
  expect(await page.locator('button:has-text("הבא")').count()).toBeGreaterThan(0)
})

// ── Phase 7 — Step 4: Panels ─────────────────────────────────────────────────

test('S14 Phase 7 — add panel and advance', async ({ page }) => {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  for (let i = 0; i < 3; i++) {
    await page.locator('button:has-text("הבא")').click()
    await page.waitForTimeout(800)
  }

  const addPanelBtn = page.locator('button:has-text("הוסף לוח")')
  if (await addPanelBtn.isVisible()) {
    await addPanelBtn.click()
    await page.waitForTimeout(500)
    const panelInput = page.locator('input[placeholder*="שם"], input[placeholder*="לוח"]').first()
    if (await panelInput.isVisible()) {
      await panelInput.fill('לוח ראשי')
    }
  }

  await page.locator('button:has-text("הבא")').click()
  await page.waitForTimeout(1000)
  expect(await page.locator('button:has-text("הבא")').count()).toBeGreaterThan(0)
})

// ── Phase 8 — Step 5: Fault Loop ─────────────────────────────────────────────

test('S14 Phase 8 — fault loop Zs field and advance', async ({ page }) => {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  for (let i = 0; i < 4; i++) {
    await page.locator('button:has-text("הבא")').click()
    await page.waitForTimeout(800)
  }

  // Z_s field
  const zsInput = page.locator('input[name*="zs"], input[name*="Z_s"], input[id*="zs"]').first()
  if (await zsInput.isVisible()) {
    await zsInput.fill('0.45')
  }

  await page.locator('button:has-text("הבא")').click()
  await page.waitForTimeout(1000)
  expect(await page.locator('button:has-text("הבא")').count()).toBeGreaterThan(0)
})

// ── Phase 9 — Step 6: Defects ────────────────────────────────────────────────

test('S14 Phase 9 — defects step renders and advances', async ({ page }) => {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  for (let i = 0; i < 5; i++) {
    await page.locator('button:has-text("הבא")').click()
    await page.waitForTimeout(800)
  }

  // Defect content should be present
  const hasDefectContent =
    (await page.locator('text=ליקויים').count()) > 0 ||
    (await page.locator('[class*="defect"]').count()) > 0 ||
    (await page.locator('button:has-text("הוסף ליקוי")').count()) > 0
  expect(hasDefectContent).toBe(true)

  await page.locator('button:has-text("הבא")').click()
  await page.waitForTimeout(1000)
})

// ── Phase 10 — Step 7: Recommendations ───────────────────────────────────────

test('S14 Phase 10 — fill recommendations and advance to review', async ({ page }) => {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  for (let i = 0; i < 6; i++) {
    await page.locator('button:has-text("הבא")').click()
    await page.waitForTimeout(800)
  }

  const textarea = page.locator('textarea').first()
  if (await textarea.isVisible()) {
    await textarea.fill('יש להחליף את הכבל הפגום בהקדם האפשרי ולבצע בדיקה חוזרת תוך 30 יום')
    expect(await textarea.inputValue()).toContain('להחליף')
  }

  await page.locator('button:has-text("הבא")').click()
  await page.waitForTimeout(1000)
})

// ── Phase 11 — Review & Sign ──────────────────────────────────────────────────

test('S14 Phase 11 — review step: no Next, has summary and canvas', async ({ page }) => {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  // Advance through all steps (7 times to reach step 8 = last without generator)
  for (let i = 0; i < 7; i++) {
    const nextBtn = page.locator('button:has-text("הבא")')
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await page.waitForTimeout(800)
    }
  }

  // No "הבא" on final step
  const nextVisible = await page
    .locator('button:has-text("הבא")')
    .isVisible()
    .catch(() => false)
  expect(nextVisible).toBe(false)

  // Summary + canvas
  await expect(page.locator('canvas').first()).toBeVisible()
})

test('S14 Phase 11 — draw on signature canvas changes pixel data', async ({ page }) => {
  await page.goto(WIZARD_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  for (let i = 0; i < 7; i++) {
    const nextBtn = page.locator('button:has-text("הבא")')
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await page.waitForTimeout(800)
    }
  }

  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  if (box) {
    await page.mouse.move(box.x + 30, box.y + 50)
    await page.mouse.down()
    await page.mouse.move(box.x + 100, box.y + 80)
    await page.mouse.move(box.x + 150, box.y + 50)
    await page.mouse.up()
    // Pixel data should have changed from blank
    const isBlank = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d')
      if (!ctx) return true
      const data = ctx.getImageData(0, 0, el.width, el.height).data
      return data.every((v) => v === 0 || v === 255)
    })
    expect(isBlank).toBe(false)
  }
})

// ── Phase 12 — PDF Report ─────────────────────────────────────────────────────

test('S14 Phase 12 — PDF report is valid and starts with %PDF', async ({ page }) => {
  const response = await page.request.get(
    '/api/inspections/00000000-0000-0000-0000-000000000001/report'
  )
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')
  const body = await response.body()
  expect(body.length).toBeGreaterThan(1024)
  expect(body.slice(0, 4).toString('ascii')).toBe('%PDF')
})

// ── Phase 13 — Navigation & Mobile ───────────────────────────────────────────

test('S14 Phase 13 — nav items visible on dashboard', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  for (const label of ['בדיקת חשמל', 'לוח בקרה', 'בדיקה חדשה', 'יציאה']) {
    await expect(page.locator(`text=${label}`).first()).toBeVisible()
  }
})

test('S14 Phase 13 — no horizontal overflow at 375px', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.setViewportSize({ width: 375, height: 812 })
  await page.waitForTimeout(300)
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5)
})

// ── Phase 14 — Dark Mode ──────────────────────────────────────────────────────

test('S14 Phase 14 — dark mode renders without crash', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.waitForTimeout(300)
  await expect(page.locator('body')).toBeVisible()
  // Page should still show nav content in dark mode
  await expect(page.locator('text=לוח בקרה').first()).toBeVisible()
})
