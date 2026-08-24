import LoginForm from '../../components/login/LoginForm';

export default function LoginClientActionPage() {
  return (
    <>
      <title>Client action login | Waku</title>
      <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
        Client action function
      </p>
      <LoginForm mode="client-action" />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
