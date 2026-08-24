'use server';

export type LoginState = { submitted: boolean };

export async function submitLogin(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // This demo intentionally does not authenticate. A real action must validate
  // credentials, rate-limit attempts, and establish a secure server session.
  void formData.get('email');

  return { submitted: true };
}
