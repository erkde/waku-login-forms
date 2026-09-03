import LoginForm from '../../components/login/LoginForm';

export default function LoginNativeHtmlPage() {
  return (
    <>
      <title>Native HTML login | Waku</title>
      <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
        Native HTML form
      </p>
      <LoginForm mode="native-html" />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
