import { expect, test } from '@playwright/test';
import {
  delayFormChunk,
  expectCredentialLeak,
  fillLoginForm,
  successMessage,
} from './login-helpers';

test('onSubmit falls back to native submission before hydration', async ({
  page,
}) => {
  await delayFormChunk(page, 'LoginForm');

  await page.goto('/login/onsubmit', { waitUntil: 'commit' });
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('form')).toHaveAttribute('data-hydrated', 'false');
  await fillLoginForm(page);

  await page.getByRole('button', { name: 'Log in' }).click();

  await expectCredentialLeak(page, '/login/onsubmit');
});

test('client action replays submission after hydration', async ({ page }) => {
  await delayFormChunk(page, 'LoginForm');

  await page.goto('/login/client-action', { waitUntil: 'commit' });
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('form')).toHaveAttribute('data-hydrated', 'false');
  await fillLoginForm(page);

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('status')).toHaveText(successMessage);
  await expect(page).toHaveURL('/login/client-action');
});

test('server action progressively submits while hydration is delayed', async ({
  page,
}) => {
  await delayFormChunk(page, 'LoginForm');

  await page.goto('/login/server-action', { waitUntil: 'commit' });
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('form')).toHaveAttribute('data-hydrated', 'false');
  await fillLoginForm(page);

  await page
    .getByRole('button', { name: 'Log in' })
    .click({ noWaitAfter: true });

  await expect(page.getByRole('status')).toHaveText(successMessage);
  await expect(page.locator('form')).toHaveAttribute('data-hydrated', 'false');
  await expect(page).toHaveURL('/login/server-action');
});
