import LoginForm from '../../components/login/LoginForm';

export default function LoginOnSubmitPage() {
  return (
    <>
      <title>onSubmit login | Waku</title>
      <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
        onSubmit handler
      </p>
      <LoginForm mode="on-submit" />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
