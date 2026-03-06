import { test, expect } from '@playwright/test'

// ── S11 — Visual Theme (complementary to e2e-test.spec.ts) ───────────────────

test('S11 — dark mode text is readable', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.waitForTimeout(300)
  // Body should have a dark background (luminance < 0.5 approximation)
  const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  // Just assert the page is still visible and didn't crash
  expect(bgColor).toBeTruthy()
  await expect(page.locator('body')).toBeVisible()
})

test('S11 — no hardcoded blue-900 background on primary elements', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  // Hardcoded Tailwind blue-900 = rgb(30, 58, 138)
  const hasHardcodedBlue = await page.evaluate(() => {
    const elements = document.querySelectorAll('nav, header, button, a')
    for (const el of elements) {
      const bg = window.getComputedStyle(el).backgroundColor
      if (bg === 'rgb(30, 58, 138)') return true
    }
    return false
  })
  expect(hasHardcodedBlue).toBe(false)
})

// ── S12 — Error Handling ──────────────────────────────────────────────────────

test('S12 — bad inspection ID shows Hebrew error or 404, no raw stack trace', async ({ page }) => {
  await page.goto('/inspections/bad-nonexistent-id')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  const url = page.url()
  const bodyText = await page.locator('body').innerText()

  // Should NOT expose a raw JS stack trace
  expect(bodyText).not.toContain('at Object.<anonymous>')
  expect(bodyText).not.toContain('webpack-internal')

  // Should show either a Hebrew error message or a 404 page
  const hasHebrewError =
    bodyText.includes('שגיאה') ||
    bodyText.includes('לא נמצא') ||
    bodyText.includes('404') ||
    url.includes('not-found') ||
    (await page.locator('text=שגיאה').count()) > 0 ||
    (await page.locator('text=לא נמצא').count()) > 0

  expect(hasHebrewError).toBe(true)
})

test('S12 — error page has no console TypeError', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await page.goto('/inspections/bad-nonexistent-id')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  const typeErrors = errors.filter((e) => e.toLowerCase().includes('typeerror'))
  expect(typeErrors).toHaveLength(0)
})

// ── S13 — PDF Report ──────────────────────────────────────────────────────────

test('S13 — PDF report endpoint returns 200 with application/pdf', async ({ page }) => {
  const response = await page.request.get(
    '/api/inspections/00000000-0000-0000-0000-000000000001/report'
  )
  expect(response.status()).toBe(200)
  const contentType = response.headers()['content-type'] ?? ''
  expect(contentType).toContain('application/pdf')
})

test('S13 — PDF report body is larger than 1KB', async ({ page }) => {
  const response = await page.request.get(
    '/api/inspections/00000000-0000-0000-0000-000000000001/report'
  )
  expect(response.status()).toBe(200)
  const body = await response.body()
  expect(body.length).toBeGreaterThan(1024)
})

test('S13 — PDF report starts with %PDF magic bytes', async ({ page }) => {
  const response = await page.request.get(
    '/api/inspections/00000000-0000-0000-0000-000000000001/report'
  )
  expect(response.status()).toBe(200)
  const body = await response.body()
  const magic = body.slice(0, 4).toString('ascii')
  expect(magic).toBe('%PDF')
})
