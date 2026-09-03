# waku-login-forms

A small Waku and React 19 experiment comparing how four form submission APIs behave with no JavaScript, delayed form hydration, and fully hydrated JavaScript.

The project does not perform real authentication, it just exists to test the behavior around React's hydration gap.

## Login implementations

| Route                  | Form API                                              |
| ---------------------- | ----------------------------------------------------- |
| `/login/native-html`   | `<form action="/login-submit" method="post">`        |
| `/login/onsubmit`      | `<form onSubmit={handleSubmit}>`                      |
| `/login/client-action` | `<form action={clientAction}>`                        |
| `/login/server-action` | `<form action={serverAction}>` using `useActionState` |

All four routes render the same login form fields through a shared client component and application root.

## Test scenarios

### No JavaScript

Playwright disables JavaScript entirely. React cannot install listeners, hydrate the form, or replay a submission.

### Delayed form hydration

The application runtime loads normally, but Playwright holds the `LoginForm-*.js` request to simulate a form submission during hydration. The test releases the chunk only after the submission has occurred.

At submission time:

- The server-rendered form is visible and interactive.
- The `LoginForm` component and its handlers have not hydrated.
- For the client `action`, Playwright verifies that React's early form-replay listener is attached.

The client `action` can therefore be captured and replayed even though its component is not ready. The other implementations do not emit or rely on that replay listener.

### Ready JavaScript

The test waits for the form to report `data-hydrated="true"` before submitting it.

## Results

| Implementation  | DOM ready (no JavaScript)                         | Form hydration delayed                                | Component hydrated               |
| --------------- | ------------------------------------------------ | ----------------------------------------------------- | -------------------------------- |
| Native HTML     | Native POST navigation                           | Native POST; no replay listener                        | Native POST navigation           |
| `onSubmit`      | Browser's default GET navigation                 | Default GET navigation; no replay listener              | Handler runs and renders success |
| Client `action` | Submission is guarded and cannot complete        | Replay listener queues submission until hydration     | Action runs and renders success  |
| Server action   | Progressively submits and renders success        | Progressive POST; no replay listener required          | Action runs and renders success  |

The `onSubmit` form deliberately supplies no `action` or `method`. Event props are not represented in HTML, so until hydration the browser performs its default GET submission to the current URL.

React renders a function-valued client action with an internal `javascript:throw new Error(...)` form action. Only that implementation receives the early replay listener: it recognizes the sentinel, prevents native submission, captures the form data, and replays the action after hydration. React does not emit this listener for the native HTML, `onSubmit`, or server-action forms.

## Run locally

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Build and serve the production app:

```sh
npm run build
npm run start
```

## Run the tests

```sh
npm run test:e2e
```

The test script builds the application first, then Playwright starts the production server on port 3100 and runs all twelve combinations in Chromium.

To use Playwright UI:

```sh
npm run test:e2e -- --ui
```

If the production build changes while Playwright UI is open, restart the UI so Waku's in-memory server and the hashed client assets stay in sync.

## Project structure

```text
src/
├── actions/submit-login.ts
├── components/login/
│   ├── LoginFields.tsx
│   └── LoginForm.tsx
└── pages/
    ├── _api/login-submit.ts
    ├── _layout.tsx
    └── login/
        ├── native-html.tsx
        ├── onsubmit.tsx
        ├── client-action.tsx
        └── server-action.tsx

tests/
├── login-no-js.spec.ts
├── login-delayed-js.spec.ts
└── login-ready-js.spec.ts
```

The credentials and success response are fixtures only. The server action intentionally performs no authentication, session creation, or credential storage.
