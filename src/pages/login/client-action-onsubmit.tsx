import LoginForm from '../../components/login/LoginForm';

export default function LoginClientActionOnSubmitPage() {
  return (
    <>
      <title>Client action with onSubmit login | Waku</title>
      <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
        Client action with onSubmit
      </p>
      <LoginForm mode="client-action-on-submit" />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
