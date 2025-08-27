const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL as string;
const TOKEN = process.env.EXPO_PUBLIC_TOKEN as string;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': TOKEN,
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return res.json() as Promise<T>;
}

export function httpGet<T>(path: string, init?: RequestInit) {
  return request<T>(path, init);
}
export function httpPost<T>(path: string, init?: RequestInit) {
  return request<T>(path, { method: 'POST', ...(init || {}) });
}
