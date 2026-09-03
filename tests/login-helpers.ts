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

  await expect(emailInput).toHaveValue(credentials.email);
  await expect(passwordInput).toHaveValue(credentials.password);
  await expect(rememberCheckbox).toBeChecked();
}

export async function submitAndExpectNativePost(page: Page) {
  const [request] = await Promise.all([
    page.waitForRequest((candidate) => {
      return (
        candidate.isNavigationRequest() &&
        new URL(candidate.url()).pathname === '/login-submit'
      );
    }),
    page.getByRole('button', { name: 'Log in' }).click(),
  ]);

  expect(request.method()).toBe('POST');
  await expect(page).toHaveURL('/login-submit');
  await expect(page.getByText(nativeSuccessMessage)).toBeVisible();
}

export async function expectClientActionReplayListener(page: Page) {
  const session = await page.context().newCDPSession(page);

  try {
    const { result: windowObject } = await session.send('Runtime.evaluate', {
      expression: 'window',
    });

    if (!windowObject.objectId) {
      throw new Error('Could not inspect the browser window');
    }

    await expect
      .poll(
        async () => {
          const { listeners } = await session.send(
            'DOMDebugger.getEventListeners',
            { objectId: windowObject.objectId! },
          );

          return listeners.some((listener) => listener.type === 'submit');
        },
        { message: "React's client-action replay listener should be attached" },
      )
      .toBe(true);
  } finally {
    await session.detach();
  }
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
