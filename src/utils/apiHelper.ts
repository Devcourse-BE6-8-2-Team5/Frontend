export interface ApiRequestOptions extends RequestInit {
  headers?: HeadersInit;
}

/**
 * Unified fetch wrapper that attaches cookies and optional Bearer token.
 * - Keeps relative paths (e.g., "/api/..."), letting Next.js rewrites/proxy handle routing
 * - Merges headers safely; does not override provided RequestInit
 */
export async function apiRequest(
  input: string,
  init: ApiRequestOptions = {},
  accessToken?: string
): Promise<Response> {
  const defaultHeaders: HeadersInit = {
    Accept: 'application/json',
  };

  const authHeader: HeadersInit = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};

  const mergedHeaders: HeadersInit = {
    ...defaultHeaders,
    ...authHeader,
    ...(init.headers || {}),
  };

  const requestInit: RequestInit = {
    ...init,
    headers: mergedHeaders,
    credentials: 'include',
  };

  return fetch(input, requestInit);
}


