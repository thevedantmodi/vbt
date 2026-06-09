import { Transaction } from "./budget";

const BASE = import.meta.env.VITE_API_URL || "";

async function post<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!r.ok)
    throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(BASE + path);
  if (!r.ok) throw new Error(r.statusText);
  return r.json() as Promise<T>;
}

export const api = {
  createLinkToken: () =>
    post<{ link_token: string }>("/api/plaid/create_link_token"),
  exchangePublicToken: (public_token: string) =>
    post<{ ok: boolean }>("/api/plaid/exchange_public_token", { public_token }),
  getTransactions: () =>
    get<{ transactions: Transaction[] }>("/api/transactions"),
  sync: () => post<{ ok: boolean }>("/api/sync"),
  status: () => get<{ linked: boolean; env: string }>("/api/status"),
  unlink: () => post<{ ok: boolean }>("/api/unlink"),
};
