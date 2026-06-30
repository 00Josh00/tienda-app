export async function onRequest(context) {
  const { request, env } = context;
  const BACKEND_URL = env.BACKEND_URL;

  if (!BACKEND_URL) {
    return new Response('BACKEND_URL no configurada', { status: 500 });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '') || '/';

  const backendUrl = `${BACKEND_URL}/api${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('Host', new URL(BACKEND_URL).host);

  return fetch(backendUrl, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? null : request.body,
  });
}
