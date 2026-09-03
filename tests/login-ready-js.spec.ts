import { expect, test } from '@playwright/test';
import {
  fillLoginForm,
  submitAndExpectNativePost,
  successMessage,
} from './login-helpers';

const implementations = [
  { name: 'onSubmit', path: '/login/onsubmit' },
  { name: 'client action', path: '/login/client-action' },
  { name: 'server action', path: '/login/server-action' },
] as const;

test('native HTML form submits after component hydration', async ({ page }) => {
  await page.goto('/login/native-html');
  await expect(page.locator('form')).toHaveAttribute('data-hydrated', 'true');
  await fillLoginForm(page);

  await submitAndExpectNativePost(page);
});

for (const implementation of implementations) {
  test(`${implementation.name} submits after hydration`, async ({ page }) => {
    await page.goto(implementation.path);
    await expect(page.locator('form')).toHaveAttribute(
      'data-hydrated',
      'true',
    );
    await fillLoginForm(page);

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByRole('status')).toHaveText(successMessage);
    await expect(page).toHaveURL(implementation.path);
  });
}
