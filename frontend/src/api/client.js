const API_BASE = window.ENV_API_URL || "";

let tokenProvider = () => null;
let onUnauthorized = () => {};

export function configureApi({ getToken, onUnauthorized: handler }) {
  if (getToken) tokenProvider = getToken;
  if (handler) onUnauthorized = handler;
}

export async function apiFetch(
  path,
  { method = "GET", body, headers = {} } = {}
) {
  const token = tokenProvider();
  const finalHeaders = { ...headers };
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    onUnauthorized();
    throw new Error("Unauthorized");
  }

  return res;
}
