import { expect, type Page, type Response } from '@playwright/test';

export const credentials = {
  email: 'person@example.com',
  password: 'test-password',
} as const;

export const successMessage = 'Login form submitted successfully.';
export const nativeSuccessMessage = 'Native form submitted successfully.';

export async function fillLoginForm(page: Page) {
  const emailInput = page.getByLabel('Email address');
  const passwordInput = page.getByLabel('Password', { exact: true });
  const rememberCheckbox = page.getByLabel('Remember me');

  await emailInput.fill(credentials.email);
  await passwordInput.fill(credentials.password);
  await rememberCheckbox.check();
}

export async function submitFormAndCaptureNavigation(page: Page) {
  const currentUrl = page.url();

  const [request] = await Promise.all([
    page.waitForRequest((candidate) => candidate.isNavigationRequest()),
    page.waitForURL((url) => url.href !== currentUrl, {
      waitUntil: 'commit',
    }),
    page
      .getByRole('button', { name: 'Log in' })
      .click({ noWaitAfter: true }),
  ]);

  return request;
}

export async function expectClientActionQueuedForReplay(page: Page) {
  const replayQueue = await page.evaluate(() => {
    const queue = (
      document as Document & { $$reactFormReplay?: unknown[] }
    ).$$reactFormReplay;

    return {
      length: queue?.length,
      formMatches: queue?.[0] === document.querySelector('form'),
      submitterMatches:
        queue?.[1] === document.querySelector('button[type="submit"]'),
      includesFormData: queue?.[2] instanceof FormData,
    };
  });

  expect(replayQueue).toEqual({
    length: 3,
    formMatches: true,
    submitterMatches: true,
    includesFormData: true,
  });
}

export async function expectClientActionReplayBootstrap(
  response: Response | null,
  expected: boolean,
) {
  expect(response).not.toBeNull();

  const html = await response!.text();
  expect(html.includes('$$reactFormReplay')).toBe(expected);
}

export async function holdFormChunk(page: Page, formName: string) {
  const formChunk = new RegExp(
    `${formName}.*\\.(?:js|tsx)(?:\\?.*)?$`,
  );

  let reportBlocked!: () => void;
  let releaseChunk!: () => void;

  const blocked = new Promise<void>((resolve) => {
    reportBlocked = resolve;
  });
  const released = new Promise<void>((resolve) => {
    releaseChunk = resolve;
  });

  await page.route(formChunk, async (route) => {
    reportBlocked();
    await released;
    await route.continue();
  });

  return { blocked, release: releaseChunk };
}
