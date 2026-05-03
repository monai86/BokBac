import { expect, test } from '@playwright/test'

test('identify, explain, save, reset, and reload a case', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /ผลการวินิจฉัย/i })).toBeVisible()
  await expect(page.getByText('Why this result is leading')).toBeVisible()

  await page.getByRole('button', { name: /set oxidase to \+/i }).click()
  await expect(page.getByText(/1 answer considered/i)).toBeVisible()

  await page.getByRole('button', { name: /save current identification case/i }).click()
  await expect(page.getByRole('button', { name: /load saved case/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /export json/i })).toBeVisible()

  await page.getByLabel('Case title').fill('Teaching oxidase case')
  await page.getByLabel('Case tags').fill('teaching, qc')
  await page.getByPlaceholder(/search cases/i).fill('teaching')
  await expect(page.getByLabel('Case title')).toHaveValue('Teaching oxidase case')

  await page.getByRole('button', { name: /reset all biochemical/i }).click()
  await expect(page.getByText(/prevalence priors/i)).toBeVisible()

  await page.getByRole('button', { name: /load saved case/i }).click()
  await expect(page.getByText(/1 answer considered/i)).toBeVisible()
})
