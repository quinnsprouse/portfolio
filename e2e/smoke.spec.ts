import { expect, test } from '@playwright/test'

test('home page renders key sections without runtime errors', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => {
    pageErrors.push(error)
  })

  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Quinn Sprouse' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Selected Work' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'GitHub Activity' })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /view blog/i })).toBeVisible()

  expect(pageErrors).toHaveLength(0)
})
