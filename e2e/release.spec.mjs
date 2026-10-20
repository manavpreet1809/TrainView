import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('pages render without browser errors or horizontal page overflow', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/workouts', '/chat', '/setup']) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath((path.slice(1) || 'dashboard') + '.png'), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('workouts filter, sort, open and export matching records', async ({ page }) => {
  await page.goto('/workouts');
  const rows = page.locator('tbody tr');
  await expect(rows).not.toHaveCount(0);
  const total = await rows.count();
  await page.getByLabel('Search workouts', { exact: true }).fill('no-matching-session-xyz');
  await expect(page.getByText('No workouts match these filters.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export filtered CSV' })).toBeDisabled();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(rows).toHaveCount(total);
  await page.getByRole('button', { name: /^Distance/ }).click();
  await expect(page.getByRole('columnheader', { name: /^Distance/ })).toHaveAttribute('aria-sort', 'descending');
  await page.getByRole('button', { name: /^Open (?!navigation)/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Training load', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('Activity type', { exact: true }).selectOption({ index: 1 });
  const matching = await rows.count();
  expect(matching).toBeGreaterThan(0);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export filtered CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv.trim().split(/\r?\n/)).toHaveLength(matching + 1);
});

test('theme survives navigation and reload with browser storage', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveClass(/light/);
});

test('theme remains usable when storage is denied', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Storage denied', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Storage denied', 'SecurityError'); };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveClass(/light/);
});

test('demo coach answers without provider credentials', async ({ page }) => {
  await page.goto('/chat');
  const conversation = page.getByRole('log', { name: 'Coaching conversation' });
  await page.getByRole('textbox', { name: 'Message your coach' }).fill('What training data is available?');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(conversation).toContainText('What training data is available?');
  await expect(page.getByText('Preparing response…', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Stop', exact: true })).toHaveCount(0);
  await expect(conversation).toContainText(/demo/i);
});

test('coach request can be stopped and another question submitted', async ({ page }) => {
  await page.route('**/api/chat', async route => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    await route.fulfill({ contentType: 'text/plain', body: 'Controlled test response.' }).catch(() => {});
  });
  await page.goto('/chat');
  await page.getByRole('textbox', { name: 'Message your coach' }).fill('Start a response');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('Response stopped.');
  await page.getByRole('textbox', { name: 'Message your coach' }).fill('Try again');
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeEnabled();
});

test('navigation reaches setup with keyboard-accessible controls', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('menuitem', { name: 'Data setup' }).click();
  } else {
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: /Data setup/ }).click();
  }
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByRole('heading', { name: 'Set up TrainView' })).toBeVisible();
  await expect(page.getByText('Synthetic demo', { exact: true })).toBeVisible();
});

test('date range validation can be corrected', async ({ page }) => {
  await page.goto('/workouts');
  await page.getByLabel('From date', { exact: true }).fill('2099-01-02');
  await page.getByLabel('To date', { exact: true }).fill('2099-01-01');
  await expect(page.locator('main').getByRole('alert')).toContainText('From date must be on or before to date.');
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('main').getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Export filtered CSV' })).toBeEnabled();
});

test('route failure offers retry and recovers to a local preview', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/workouts/demo-01/map', async route => {
    attempts += 1;
    if (attempts === 1) await route.fulfill({ status: 503, body: 'Unavailable' });
    else await route.continue();
  });
  await page.goto('/workouts');
  await page.getByRole('button', { name: /^Open (?!navigation)/ }).first().click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Unable to load map');
  await page.getByRole('button', { name: 'Retry route' }).click();
  await expect(page.getByRole('img', { name: 'Simplified route shape without a basemap' })).toBeVisible();
});

test('failed CSV export keeps filters and allows retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/workouts/export?**', async route => {
    attempts += 1;
    if (attempts === 1) await route.fulfill({ status: 503, body: 'Unavailable' });
    else await route.continue();
  });
  await page.goto('/workouts');
  await page.getByLabel('Activity type', { exact: true }).selectOption({ index: 1 });
  const type = await page.getByLabel('Activity type', { exact: true }).inputValue();
  await page.getByRole('button', { name: 'Export filtered CSV' }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText('download could not be prepared');
  await expect(page.getByLabel('Activity type', { exact: true })).toHaveValue(type);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export filtered CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('trainview-workouts.csv');
  await expect(page.locator('main').getByRole('alert')).toHaveCount(0);
});
