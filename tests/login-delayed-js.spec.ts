import { expect, test } from '@playwright/test';
import {
  expectClientActionReplayBootstrap,
  expectClientActionReplayListener,
  fillLoginForm,
  holdFormChunk,
  submitAndExpectNativePost,
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

    await submitAndExpectNativePost(page);
  } finally {
    chunk.release();
  }
});

test('onSubmit falls back to native submission before hydration', async ({
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

    await submitAndExpectNativePost(page);
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
    await expectClientActionReplayListener(page);
    await expect(page.locator('form')).toHaveAttribute(
      'data-hydrated',
      'false',
    );
    await fillLoginForm(page);

    await page.getByRole('button', { name: 'Log in' }).click();
    chunk.release();

    await expect(page.getByRole('status')).toHaveText(successMessage);
    await expect(page).toHaveURL('/login/client-action');
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
