import { expect, test } from '@playwright/test';
import {
  expectClientActionReplayBootstrap,
  expectClientActionQueuedForReplay,
  fillLoginForm,
  holdFormChunk,
  nativeSuccessMessage,
  submitFormAndCaptureNavigation,
  successMessage,
} from './login-helpers';

test('native HTML form submits while hydration is delayed', async ({ page }) => {
  const chunk = await holdFormChunk(page, 'LoginForm');

  try {
    const response = await page.goto('/login/native-html', {
      waitUntil: 'commit',
    });
    await expectClientActionReplayBootstrap(response, false);
    await chunk.blocked;
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('form')).toHaveAttribute(
      'data-hydrated',
      'false',
    );
    await fillLoginForm(page);

    const request = await submitFormAndCaptureNavigation(page);

    expect(request.method()).toBe('POST');
    expect(new URL(request.url()).pathname).toBe('/login-submit');
    await expect(page).toHaveURL('/login-submit');
    await expect(page.getByText(nativeSuccessMessage)).toBeVisible();
  } finally {
    chunk.release();
  }
});

test('onSubmit has only native browser behavior before hydration', async ({
  page,
}) => {
  const chunk = await holdFormChunk(page, 'LoginForm');

  try {
    const response = await page.goto('/login/onsubmit', {
      waitUntil: 'commit',
    });
    await expectClientActionReplayBootstrap(response, false);
    await chunk.blocked;
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('form')).toHaveAttribute(
      'data-hydrated',
      'false',
    );
    await fillLoginForm(page);

    const request = await submitFormAndCaptureNavigation(page);

    expect(request.method()).toBe('GET');
    expect(new URL(request.url()).pathname).toBe('/login/onsubmit');
    await expect(page).toHaveURL(request.url());
  } finally {
    chunk.release();
  }
});

test('client action replays submission after hydration', async ({ page }) => {
  const chunk = await holdFormChunk(page, 'LoginForm');

  try {
    const response = await page.goto('/login/client-action', {
      waitUntil: 'commit',
    });
    await expectClientActionReplayBootstrap(response, true);
    await chunk.blocked;
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('form')).toHaveAttribute(
      'data-hydrated',
      'false',
    );
    await fillLoginForm(page);

    await page.getByRole('button', { name: 'Log in' }).click();
    await expectClientActionQueuedForReplay(page);
    chunk.release();

    await expect(page.getByRole('status')).toHaveText(successMessage);
    await expect(page).toHaveURL('/login/client-action');
  } finally {
    chunk.release();
  }
});

test('client action with onSubmit records the replay path', async ({ page }) => {
  const chunk = await holdFormChunk(page, 'LoginForm');

  try {
    const response = await page.goto('/login/client-action-onsubmit', {
      waitUntil: 'commit',
    });
    await expectClientActionReplayBootstrap(response, true);
    await chunk.blocked;
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('form')).toHaveAttribute(
      'data-hydrated',
      'false',
    );
    await fillLoginForm(page);

    await page.getByRole('button', { name: 'Log in' }).click();
    await expectClientActionQueuedForReplay(page);
    chunk.release();

    await expect(page.getByTestId('client-action-invocations')).toHaveText('1');
    await expect(page.getByTestId('on-submit-invocations')).toHaveText('0');
    await expect(page).toHaveURL('/login/client-action-onsubmit');
  } finally {
    chunk.release();
  }
});

test('server action progressively submits while hydration is delayed', async ({
  page,
}) => {
  const chunk = await holdFormChunk(page, 'LoginForm');

  try {
    const response = await page.goto('/login/server-action', {
      waitUntil: 'commit',
    });
    await expectClientActionReplayBootstrap(response, false);
    await chunk.blocked;
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('form')).toHaveAttribute(
      'data-hydrated',
      'false',
    );
    await fillLoginForm(page);

    await page
      .getByRole('button', { name: 'Log in' })
      .click({ noWaitAfter: true });

    await expect(page.getByRole('status')).toHaveText(successMessage);
    await expect(page.locator('form')).toHaveAttribute(
      'data-hydrated',
      'false',
    );
    await expect(page).toHaveURL('/login/server-action');
  } finally {
    chunk.release();
  }
});
