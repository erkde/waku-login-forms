'use client';

import {
  useActionState,
  useEffect,
  useState,
  type FormEvent,
} from 'react';
import { submitLogin, type LoginState } from '../../actions/submit-login';
import { LoginFields, LoginSuccess } from './LoginFields';

export type LoginMode =
  | 'native-html'
  | 'on-submit'
  | 'client-action'
  | 'client-action-on-submit'
  | 'server-action';

type LoginFormProps = {
  mode: LoginMode;
};

export default function LoginForm({ mode }: LoginFormProps) {
  if (mode === 'native-html') {
    return <NativeHtmlForm />;
  }
  if (mode === 'on-submit') {
    return <OnSubmitForm />;
  }
  if (mode === 'client-action') {
    return <ClientActionForm />;
  }
  if (mode === 'client-action-on-submit') {
    return <ClientActionOnSubmitForm />;
  }
  return <ServerActionForm />;
}

const NativeHtmlForm = () => {
  const hydrated = useHydrated();

  return (
    <form
      className="space-y-5"
      data-hydrated={hydrated}
      action="/login-submit"
      method="post"
    >
      <LoginFields />
    </form>
  );
};

const OnSubmitForm = () => {
  const hydrated = useHydrated();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form
      className="space-y-5"
      data-hydrated={hydrated}
      onSubmit={handleSubmit}
    >
      <LoginFields />
      {submitted && <LoginSuccess />}
    </form>
  );
};

const ClientActionForm = () => {
  const hydrated = useHydrated();
  const [submitted, setSubmitted] = useState(false);

  const login = (_formData: FormData) => {
    setSubmitted(true);
  };

  return (
    <form className="space-y-5" data-hydrated={hydrated} action={login}>
      <LoginFields />
      {submitted && <LoginSuccess />}
    </form>
  );
};

const ClientActionOnSubmitForm = () => {
  const hydrated = useHydrated();
  const [onSubmitInvocations, setOnSubmitInvocations] = useState(0);
  const [clientActionInvocations, setClientActionInvocations] = useState(0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setOnSubmitInvocations((count) => count + 1);
    event.preventDefault();
  };

  const login = (_formData: FormData) => {
    setClientActionInvocations((count) => count + 1);
  };

  return (
    <form
      className="space-y-5"
      data-hydrated={hydrated}
      action={login}
      onSubmit={handleSubmit}
    >
      <LoginFields />
      <dl aria-label="Submission invocation counts" className="text-sm">
        <div className="flex justify-between">
          <dt>onSubmit invocations</dt>
          <dd>
            <output data-testid="on-submit-invocations">
              {onSubmitInvocations}
            </output>
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Client action invocations</dt>
          <dd>
            <output data-testid="client-action-invocations">
              {clientActionInvocations}
            </output>
          </dd>
        </div>
      </dl>
    </form>
  );
};

const initialState: LoginState = { submitted: false };

const ServerActionForm = () => {
  const hydrated = useHydrated();
  const [state, loginAction] = useActionState(submitLogin, initialState);

  return (
    <form className="space-y-5" data-hydrated={hydrated} action={loginAction}>
      <LoginFields />
      {state.submitted && <LoginSuccess />}
    </form>
  );
};

const useHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  return hydrated;
};
