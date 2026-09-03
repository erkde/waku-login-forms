# waku-login-forms

A small Waku and React 19 experiment comparing how five form submission APIs behave with no JavaScript, delayed form hydration, and fully hydrated JavaScript.

The project does not perform real authentication, it just exists to test the behavior around React's hydration gap.

## Login implementations

| Route                           | Form API                                               |
| ------------------------------- | ------------------------------------------------------ |
| `/login/native-html`            | `<form action="/login-submit" method="post">`          |
| `/login/onsubmit`               | `<form onSubmit={handleSubmit}>`                       |
| `/login/client-action`          | `<form action={clientAction}>`                         |
| `/login/client-action-onsubmit` | `<form action={clientAction} onSubmit={handleSubmit}>` |
| `/login/server-action`          | `<form action={serverAction}>` using `useActionState`  |

All five routes render the same login form fields through a shared client component and application root.

## Test scenarios

### No JavaScript

Playwright disables JavaScript entirely. React cannot install listeners, hydrate the form, or replay a submission.

### Delayed form hydration

The application runtime loads normally, but Playwright holds the `LoginForm-*.js` request to simulate a form submission during hydration. The test releases the chunk only after the submission has occurred.

At submission time:

- The server-rendered form is visible and interactive.
- The `LoginForm` component and its handlers have not hydrated.
- For forms with a client `action`, Playwright verifies that React's early form-replay listener is attached.

### Ready JavaScript

The test waits for the form to report `data-hydrated="true"` before submitting it.

## Results

| Implementation             | JavaScript disabled                       | Submitted before hydration                    | Submitted after hydration               |
| -------------------------- | ----------------------------------------- | --------------------------------------------- | --------------------------------------- |
| Native HTML                | Native POST navigation                    | Native POST; no replay listener               | Native POST navigation                  |
| `onSubmit`                 | Browser's default GET navigation          | Default GET navigation; no replay listener    | Handler runs and renders success        |
| Client `action`            | Submission is guarded and cannot complete | Replay queues and directly invokes the action | Action runs and renders success         |
| Client `action` + onSubmit | Neither function can run                  | Action runs; `onSubmit` does not              | `onSubmit` runs and prevents the action |
| Server action              | Progressively submits and renders success | Progressive POST; no replay listener required | Action runs and renders success         |

### Native HTML

The browser can submit this form in every scenario because its POST URL and method are present in the HTML. React hydration does not change its submission path, and no replay support is involved.

### `onSubmit`

Because an event handler is not represented in the server-rendered HTML, the browser performs its default GET submission when JavaScript is disabled or the component has not hydrated. Once hydrated, React can run the handler, which calls `preventDefault()` and renders the success state instead of navigating.

### Client `action`

React represents the function-valued action in HTML with an internal `javascript:throw new Error(...)` URL. With JavaScript disabled, that guard prevents the form from completing a native submission. During delayed hydration, React's early replay listener recognizes the guarded action, prevents navigation, and stores the form, submitter, and form data. After hydration it invokes the queued client action. When the component is already hydrated, the action runs through the normal React submission path.

### Client `action` with `onSubmit`

This form records the two callbacks independently. A submission made before hydration produces one client-action invocation and zero `onSubmit` invocations. A submission made after hydration does the reverse: `onSubmit` runs once, and its `preventDefault()` call keeps the client action at zero.

That difference shows that hydration replay does not dispatch the complete submit path again. React invokes the queued client action directly, so event behavior placed only in `onSubmit` does not apply to a submission captured during the hydration gap.

### Server action

The server action is encoded as a progressively enhanced form submission, so it works with JavaScript disabled and while the client component is still waiting to hydrate. In the delayed case the browser POSTs to the server rather than adding an entry to React's client-action replay queue. After hydration, React handles the action without changing the visible result.

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

The test script builds the application first, then Playwright starts the production server on port 3100 and runs all fifteen combinations in Chromium.

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
        ├── client-action-onsubmit.tsx
        └── server-action.tsx

tests/
├── login-no-js.spec.ts
├── login-delayed-js.spec.ts
└── login-ready-js.spec.ts
```

The credentials and success response are fixtures only. The server action intentionally performs no authentication, session creation, or credential storage.
