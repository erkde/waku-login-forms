const successMessage = 'Native form submitted successfully.';

export const POST = async (): Promise<Response> => {
  return new Response(
    `<!doctype html><html><head><title>Native form submission</title></head><body><p>${successMessage}</p></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
};
