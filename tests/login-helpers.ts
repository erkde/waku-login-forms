import { expect, type Page } from '@playwright/test';

export const credentials = {
  email: 'person@example.com',
  password: 'test-password',
} as const;

export const successMessage = 'Login form submitted successfully.';

export async function fillLoginForm(page: Page) {
  const emailInput = page.getByLabel('Email address');
  const passwordInput = page.getByLabel('Password', { exact: true });
  const rememberCheckbox = page.getByLabel('Remember me');

  await emailInput.fill(credentials.email);
  await passwordInput.fill(credentials.password);
  await rememberCheckbox.check();

  await expect(emailInput).toHaveValue(credentials.email);
  await expect(passwordInput).toHaveValue(credentials.password);
  await expect(rememberCheckbox).toBeChecked();
}

export async function expectCredentialLeak(page: Page, pathname: string) {
  await expect(page).toHaveURL((url) => {
    return (
      url.pathname === pathname &&
      url.searchParams.get('email') === credentials.email &&
      url.searchParams.get('password') === credentials.password &&
      url.searchParams.get('remember') === 'on'
    );
  });
  await expect(page.getByRole('status')).toHaveCount(0);
}

export async function delayFormChunk(page: Page, formName: string) {
  const formChunk = new RegExp(
    `${formName}.*\\.(?:js|tsx)(?:\\?.*)?$`,
  );

  await page.route(
    formChunk,
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3_000));
      await route.continue();
    },
  );
}
