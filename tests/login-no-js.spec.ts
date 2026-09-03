import { expect, test } from '@playwright/test';
import {
  fillLoginForm,
  nativeSuccessMessage,
  submitFormAndCaptureNavigation,
  successMessage,
} from './login-helpers';

test.use({ javaScriptEnabled: false });

test('native HTML form submits at DOM ready', async ({ page }) => {
  await page.goto('/login/native-html');
  await fillLoginForm(page);

  const request = await submitFormAndCaptureNavigation(page);

  expect(request.method()).toBe('POST');
  expect(new URL(request.url()).pathname).toBe('/login-submit');
  await expect(page).toHaveURL('/login-submit');
  await expect(page.getByText(nativeSuccessMessage)).toBeVisible();
});

test('onSubmit uses native form behavior without JavaScript', async ({
  page,
}) => {
  await page.goto('/login/onsubmit');
  await fillLoginForm(page);

  const request = await submitFormAndCaptureNavigation(page);

  expect(request.method()).toBe('GET');
  expect(new URL(request.url()).pathname).toBe('/login/onsubmit');
  await expect(page).toHaveURL(request.url());
});

test('client action cannot submit without JavaScript', async ({ page }) => {
  await page.goto('/login/client-action');
  await expect(page.locator('form')).toHaveAttribute('action', /^javascript:/);

  await fillLoginForm(page);

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
