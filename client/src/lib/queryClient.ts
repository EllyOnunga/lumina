import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

let cachedCsrfToken: string | null = null;
let csrfTokenRequest: Promise<string> | null = null;

async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;
  if (csrfTokenRequest) return csrfTokenRequest;

  csrfTokenRequest = (async () => {
    try {
      // Add timestamp to prevent browser caching of the token endpoint
      const res = await fetch(`/api/csrf-token?t=${Date.now()}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        cachedCsrfToken = data.csrfToken;
        return cachedCsrfToken!;
      }
    } catch (e) {
      console.error("Failed to fetch CSRF token", e);
    } finally {
      csrfTokenRequest = null;
    }
    return "";
  })();

  return csrfTokenRequest;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};

  // Add CSRF token for state-changing methods
  if (!["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())) {
    const token = await getCsrfToken();
    if (token) {
      headers["X-CSRF-Token"] = token;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // If we get a 403 Forbidden, the CSRF token might have expired/invalidated
  if (res.status === 403 && !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())) {
    cachedCsrfToken = null; // Clear cache and try once more
    const newToken = await getCsrfToken();
    if (newToken) {
      headers["X-CSRF-Token"] = newToken;
      const retryRes = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      await throwIfResNotOk(retryRes);
      return retryRes;
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      let url = queryKey[0] as string;
      if (queryKey.length > 1 && typeof queryKey[1] === "object" && queryKey[1] !== null) {
        const searchParams = new URLSearchParams();
        Object.entries(queryKey[1]).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => searchParams.append(key, v));
            } else {
              searchParams.append(key, String(value));
            }
          }
        });
        const queryString = searchParams.toString();
        if (queryString) {
          url += "?" + queryString;
        }
      } else if (queryKey.length > 1) {
        url = queryKey.join("/");
      }

      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
