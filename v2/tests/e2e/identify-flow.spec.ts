import { expect, test } from '@playwright/test'

test('login-first guest workflow identifies, saves, and reloads a case', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: /BOK BAC/i })).toBeVisible()

  await page.getByRole('button', { name: /Guest Mode/i }).click()
  await expect(page).toHaveURL(/\/$/)

  await expect(page.getByRole('heading', { name: /Step 1/i })).toBeVisible()
  await page.getByRole('button', { name: /Gram Negative/i }).click()
  await page.getByRole('button', { name: /^➖ Bacilli/i }).click()
  await expect(page.getByText(/Enterobacterales Suite/i)).toBeVisible()

  await page.getByRole('button', { name: /กรอกผล Biochemical Tests/i }).click()
  await expect(page.getByRole('heading', { name: /Step 2/i })).toBeVisible()
  await expect(page.getByText(/Tests still needed to reduce uncertainty/i)).toBeVisible()

  await page.getByRole('button', { name: /set oxidase to −/i }).click()
  await page.getByRole('button', { name: /set indole \(IMViC\) to \+/i }).click()
  await page.getByRole('button', { name: /set citrate \(IMViC\) to −/i }).click()

  await page.getByRole('button', { name: /Review probabilistic match/i }).click()
  await expect(page.getByRole('heading', { name: /Step 3/i })).toBeVisible()
  await expect(page.getByText(/TOP IDENTIFICATION MATCH/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /#1 Escherichia coli/i })).toBeVisible()

  await page.getByRole('button', { name: /save current identification case/i }).click()
  await expect(page.getByRole('button', { name: /load saved case/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /export json/i })).toBeVisible()

  await page.getByLabel('Case title').fill('Teaching E. coli case')
  await page.getByLabel('Case tags').fill('teaching, qc')
  await page.getByPlaceholder(/search cases/i).fill('teaching')
  await expect(page.getByLabel('Case title')).toHaveValue('Teaching E. coli case')

  await page.getByRole('button', { name: /เริ่มต้นเคสใหม่/i }).click()
  await expect(page.getByRole('heading', { name: /Step 1/i })).toBeVisible()

  await page.goto('/cases')
  await expect(page.getByLabel('Case title')).toHaveValue('Teaching E. coli case')
  await page.getByRole('button', { name: /load saved case/i }).click()
  await expect(page).toHaveURL(/\/cases$/)
  await page.goto('/')
  await page.getByRole('button', { name: /กรอกผล Biochemical Tests/i }).click()
  await page.getByRole('button', { name: /Review probabilistic match/i }).click()
  await expect(page.getByRole('link', { name: /#1 Escherichia coli/i })).toBeVisible()
})
