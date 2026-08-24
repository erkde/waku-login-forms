import LoginForm from '../../components/login/LoginForm';

export default function LoginServerActionPage() {
  return (
    <>
      <title>Server action login | Waku</title>
      <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
        Server action
      </p>
      <LoginForm mode="server-action" />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const;
};
