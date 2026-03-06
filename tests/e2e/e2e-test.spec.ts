import { test, expect, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const BASE_URL = 'http://localhost:3000'
const SCREENSHOT_DIR = path.join(__dirname, 'e2e-screenshots')

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: true })
}

// ── S11: Visual Theme ──────────────────────────────────────────────────────────
test('S11 — Visual Theme', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto(`${BASE_URL}/dashboard`)
  await page.waitForLoadState('networkidle')
  await screenshot(page, 'S11-dashboard-full')

  // Check for purple/indigo color (not hardcoded blue-900)
  const bodyStyle = await page.evaluate(() => {
    const el = document.querySelector('[class*="primary"], button, a') as HTMLElement | null
    return el ? window.getComputedStyle(el).backgroundColor : null
  })

  // Check rounded-full buttons
  const buttons = await page.locator('button, a[role="button"]').all()
  let hasRoundedButtons = false
  for (const btn of buttons.slice(0, 5)) {
    const radius = await btn.evaluate((el) => window.getComputedStyle(el).borderRadius)
    // rounded-full = 9999px
    if (radius && parseInt(radius) >= 20) {
      hasRoundedButtons = true
      break
    }
  }

  // Check card border-radius
  const cards = await page.locator('[class*="card"], [class*="Card"]').all()
  let hasLargeCardRadius = false
  for (const card of cards.slice(0, 3)) {
    const radius = await card.evaluate((el) => window.getComputedStyle(el).borderRadius)
    if (radius && parseInt(radius) >= 8) {
      hasLargeCardRadius = true
      break
    }
  }

  // Resize to 375px
  await page.setViewportSize({ width: 375, height: 812 })
  await page.waitForTimeout(500)
  await screenshot(page, 'S11-mobile-375px')

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  const noHorizontalOverflow = scrollWidth <= clientWidth + 5 // 5px tolerance

  console.log(`S11 Results:`)
  console.log(`  Rounded buttons found: ${hasRoundedButtons}`)
  console.log(`  Large card radius: ${hasLargeCardRadius}`)
  console.log(
    `  No horizontal overflow at 375px: ${noHorizontalOverflow} (scrollWidth=${scrollWidth}, clientWidth=${clientWidth})`
  )
  console.log(`  Console errors: ${errors.join(', ') || 'none'}`)

  expect(noHorizontalOverflow).toBe(true)
})

// ── S3: Dashboard ──────────────────────────────────────────────────────────────
test('S3 — Dashboard', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto(`${BASE_URL}/dashboard`)
  await page.waitForLoadState('networkidle')

  // 4 KPI cards
  // Look for cards containing total/completed/drafts/rejected
  const kpiTexts = ['סה"כ', 'הושלמו', 'טיוטות', 'נדחו']
  let kpiFound = 0
  for (const text of kpiTexts) {
    const count = await page.locator(`text=${text}`).count()
    if (count > 0) kpiFound++
  }
  console.log(`S3: KPI cards found: ${kpiFound}/4`)

  // Demo banner
  const demoBanner = await page.locator('text=מצב תצוגה').count()
  console.log(`S3: Demo banner found: ${demoBanner > 0}`)

  // Search input
  const searchInput = await page.locator('input[placeholder*="חיפוש"]').count()
  console.log(`S3: Search input found: ${searchInput > 0}`)

  // Type in search
  if (searchInput > 0) {
    await page.locator('input[placeholder*="חיפוש"]').fill('ישראל')
    await page.waitForTimeout(500)
    const filtered = await page.locator('input[placeholder*="חיפוש"]').inputValue()
    console.log(`S3: Search typed value: "${filtered}"`)

    // Clear search
    await page.locator('input[placeholder*="חיפוש"]').fill('')
    await page.waitForTimeout(300)
  }

  // Charts - look for SVG elements (Recharts renders SVGs)
  const svgCount = await page.locator('svg').count()
  console.log(`S3: SVG (charts) count: ${svgCount}`)

  // Recent inspections rows
  const rows = await page.locator('tbody tr, [class*="row"], [class*="inspection-item"]').count()
  console.log(`S3: Inspection rows found: ${rows}`)

  await screenshot(page, 'S3-dashboard')
  console.log(`S3: Console errors: ${errors.join(', ') || 'none'}`)
})

// ── S1: Auth ───────────────────────────────────────────────────────────────────
test('S1 — Auth', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  // Navigate directly to login page (demo mode may skip redirect from /)
  await page.goto(`${BASE_URL}/auth/login`)
  await page.waitForLoadState('networkidle')
  const url = page.url()
  console.log(`S1: URL: ${url}`)

  await screenshot(page, 'S1-login')

  // Check RTL layout
  const dir = await page.evaluate(() => document.documentElement.dir)
  console.log(`S1: dir="${dir}"`)
  expect(dir).toBe('rtl')

  // Email + password fields
  const emailField = await page.locator('input[type="email"]').count()
  const passwordField = await page.locator('input[type="password"]').count()
  console.log(`S1: Email field: ${emailField > 0}, Password field: ${passwordField > 0}`)
  expect(emailField).toBeGreaterThan(0)
  expect(passwordField).toBeGreaterThan(0)

  // Submit empty form only if submit button exists
  const submitButton = page.locator('button[type="submit"]')
  const submitVisible = await submitButton.isVisible().catch(() => false)
  if (submitVisible) {
    await submitButton.click()
    await page.waitForTimeout(500)
    const errorMessages = await page
      .locator(
        '[class*="error"], [class*="invalid"], [aria-invalid="true"] + *, p[class*="text-red"], p[class*="destructive"]'
      )
      .count()
    const anyErrorText = await page.locator('text=/שדה|נדרש|חובה|אימייל|סיסמ/').count()
    console.log(
      `S1: Validation errors found: ${errorMessages} error elements, ${anyErrorText} Hebrew error texts`
    )
  }
  console.log(`S1: Console errors: ${errors.join(', ') || 'none'}`)
})

// ── S2: Navigation ─────────────────────────────────────────────────────────────
test('S2 — Navigation', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto(`${BASE_URL}/dashboard`)
  await page.waitForLoadState('networkidle')

  const navLinks = ['בדיקת חשמל', 'לוח בקרה', 'בדיקה חדשה', 'יציאה']

  for (const link of navLinks) {
    const count = await page.locator(`text=${link}`).count()
    console.log(`S2: Nav link "${link}": ${count > 0 ? 'FOUND' : 'MISSING'}`)
  }

  // Check nav background - look for nav element
  const nav = page.locator('nav, header, [class*="nav"]').first()
  const navBg = await nav.evaluate((el) => window.getComputedStyle(el).backgroundColor)
  console.log(`S2: Nav background color: ${navBg}`)

  console.log(`S2: Console errors: ${errors.join(', ') || 'none'}`)
})

// ── S4: Wizard Shell ───────────────────────────────────────────────────────────
test('S4 — Wizard Shell', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto(`${BASE_URL}/inspections/00000000-0000-0000-0000-000000000001`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  await screenshot(page, 'S4-wizard-step1')

  // Step badge shows "1"
  const stepBadge = await page.locator('text=1').count()
  console.log(`S4: Step badge "1" found: ${stepBadge > 0}`)

  // Label "מידע כללי"
  const stepLabel = await page.locator('text=מידע כללי').count()
  console.log(`S4: Step label "מידע כללי" found: ${stepLabel > 0}`)

  // "הבא" button visible
  const nextBtn = page.locator('button:has-text("הבא")')
  const nextVisible = await nextBtn.isVisible()
  console.log(`S4: "הבא" button visible: ${nextVisible}`)

  // "הקודם" button disabled
  const prevBtn = page.locator('button:has-text("הקודם")')
  const prevDisabled = await prevBtn.isDisabled().catch(() => true)
  const prevVisible = await prevBtn.isVisible().catch(() => false)
  console.log(`S4: "הקודם" button disabled/hidden: ${prevDisabled || !prevVisible}`)

  // Click "הבא" and verify step 2
  if (nextVisible) {
    await nextBtn.click()
    await page.waitForTimeout(1000)

    const step2Label = await page.locator('text=בדיקה חזותית').count()
    console.log(`S4: After clicking "הבא", step 2 label "בדיקה חזותית": ${step2Label > 0}`)
    await screenshot(page, 'S4-wizard-step2')
  }

  console.log(`S4: Console errors: ${errors.join(', ') || 'none'}`)
})

// ── S5: Wizard Step 1 (General Info) ──────────────────────────────────────────
test('S5 — Wizard Step 1 General Info', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto(`${BASE_URL}/inspections/00000000-0000-0000-0000-000000000001`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  // Check fields
  const fieldChecks = [
    {
      label: 'client name',
      selector: 'input[name*="client"], input[placeholder*="שם"], input[id*="client"]',
    },
    {
      label: 'address',
      selector: 'input[name*="address"], input[placeholder*="כתובת"], input[id*="address"]',
    },
    { label: 'installation type', selector: 'select, [role="combobox"], [class*="select"]' },
    { label: 'date', selector: 'input[type="date"], input[name*="date"], [class*="date"]' },
  ]

  for (const check of fieldChecks) {
    const count = await page.locator(check.selector).count()
    console.log(`S5: "${check.label}" field found: ${count > 0}`)
  }

  // Toggle switches
  const toggles = await page.locator('[role="switch"], input[type="checkbox"]').count()
  console.log(`S5: Toggle/checkbox elements found: ${toggles}`)

  // Check if toggles look styled (not default)
  const toggleElements = await page.locator('[role="switch"]').all()
  for (let i = 0; i < Math.min(toggleElements.length, 2); i++) {
    const tagName = await toggleElements[i].evaluate((el) => el.tagName)
    console.log(`S5: Toggle ${i + 1} tag: ${tagName} (custom styled if not INPUT)`)
  }

  console.log(`S5: Console errors: ${errors.join(', ') || 'none'}`)
})

// ── Toggle & Radio visual check ────────────────────────────────────────────────
test('Toggle and Radio Visual Check', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto(`${BASE_URL}/inspections/00000000-0000-0000-0000-000000000001`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  // Screenshot toggles
  await screenshot(page, 'Toggle-step1')

  const toggleCount = await page.locator('[role="switch"]').count()
  console.log(`Toggle check: Found ${toggleCount} toggle switches on step 1`)

  // Navigate to step 2
  const nextBtn = page.locator('button:has-text("הבא")')
  if (await nextBtn.isVisible()) {
    await nextBtn.click()
    await page.waitForTimeout(1000)
    await screenshot(page, 'Toggle-step2-visual-checks')

    // Look for Pass/Fail/N/A buttons
    const passBtns = await page
      .locator('button:has-text("תקין"), button:has-text("עובר"), button:has-text("Pass")')
      .count()
    const failBtns = await page
      .locator('button:has-text("לא תקין"), button:has-text("נכשל"), button:has-text("Fail")')
      .count()
    const naBtns = await page
      .locator('button:has-text("לא רלוונטי"), button:has-text("N/A"), button:has-text("ל/ר")')
      .count()

    console.log(
      `Toggle check step 2: Pass buttons: ${passBtns}, Fail buttons: ${failBtns}, N/A buttons: ${naBtns}`
    )

    // Look for any radio-like buttons in visual checks
    const radioButtons = await page.locator('[role="radio"], [role="radiogroup"] button').count()
    console.log(`Toggle check step 2: Radio-style buttons: ${radioButtons}`)
  }

  console.log(`Toggle check: Console errors: ${errors.join(', ') || 'none'}`)
})
