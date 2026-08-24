# waku-login-forms

A small Waku and React 19 experiment comparing how three form submission APIs behave with no JavaScript, delayed form hydration, and fully hydrated JavaScript.

The project does not perform real authentication, it just exists to test the behavior around React's hydration gap.

## Login implementations

| Route                  | Form API                                              |
| ---------------------- | ----------------------------------------------------- |
| `/login/onsubmit`      | `<form onSubmit={handleSubmit}>`                      |
| `/login/client-action` | `<form action={clientAction}>`                        |
| `/login/server-action` | `<form action={serverAction}>` using `useActionState` |

All three routes render the same login form fields through a shared client component.

## Test scenarios

### No JavaScript

Playwright disables JavaScript entirely. React cannot install listeners, hydrate the form, or replay a submission.

### Delayed form hydration

The application runtime loads normally, but Playwright delays `LoginForm-*.js` by three seconds to simulate a form submission during hydration.

At submission time:

- The server-rendered form is visible and interactive.
- React's early form-replay listener is available.
- The `LoginForm` component and its handlers have not hydrated.

React is capable of capturing supported interactions, but the component responsible for them is not ready yet.

### Ready JavaScript

The test waits for the form to report `data-hydrated="true"` before submitting it.

## Results

| Implementation  | No JavaScript                                    | Delayed form hydration                                | Ready JavaScript                 |
| --------------- | ------------------------------------------------ | ----------------------------------------------------- | -------------------------------- |
| `onSubmit`      | Native GET submission; credentials enter the URL | Native GET submission; credentials enter the URL      | Handler runs and renders success |
| Client `action` | Submission is guarded and cannot complete        | Submission is queued and replayed after hydration     | Action runs and renders success  |
| Server action   | Progressively submits and renders success        | Progressively submits while the form chunk is delayed | Action runs and renders success  |

The `onSubmit` form intentionally omits `method="post"` to verify the credential-leak risk of relying on a client handler for non-JS clients and during hydration.

React renders a function-valued client action with an internal `javascript:throw new Error(...)` form action. Its early replay listener recognizes that sentinel, prevents native submission, captures the form data, and replays the action after hydration.

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

The test script builds the application first, then Playwright starts the production server on port 3100 and runs all nine combinations in Chromium.

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
    ├── _layout.tsx
    └── login/
        ├── onsubmit.tsx
        ├── client-action.tsx
        └── server-action.tsx

tests/
├── login-no-js.spec.ts
├── login-delayed-js.spec.ts
└── login-ready-js.spec.ts
```

The credentials and success response are fixtures only. The server action intentionally performs no authentication, session creation, or credential storage.
