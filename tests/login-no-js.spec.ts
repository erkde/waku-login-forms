import { expect, test } from '@playwright/test';
import {
  expectCredentialLeak,
  fillLoginForm,
  successMessage,
} from './login-helpers';

test.use({ javaScriptEnabled: false });

test('onSubmit uses native form behavior without JavaScript', async ({
  page,
}) => {
  await page.goto('/login/onsubmit');
  await fillLoginForm(page);

  await page.getByRole('button', { name: 'Log in' }).click();

  await expectCredentialLeak(page, '/login/onsubmit');
});

test('client action cannot submit without JavaScript', async ({ page }) => {
  await page.goto('/login/client-action');
  await fillLoginForm(page);

  await expect(page.locator('form')).toHaveAttribute('action', /^javascript:/);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/login/client-action');
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('server action progressively submits without JavaScript', async ({
  page,
}) => {
  await page.goto('/login/server-action');
  await fillLoginForm(page);

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('status')).toHaveText(successMessage);
  await expect(page).toHaveURL('/login/server-action');
  await expect(page.locator('form')).toHaveAttribute('data-hydrated', 'false');
});
