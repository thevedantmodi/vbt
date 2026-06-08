import { Account, Transaction } from "../types";

const BASE = "/api";
const USER_ID = "default-user";

export async function createLinkToken(): Promise<string> {
  const res = await fetch(`${BASE}/plaid/create_link_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: USER_ID }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.error_message || "Failed to create link token");
  return data.link_token;
}

export async function exchangeToken(publicToken: string): Promise<void> {
  const res = await fetch(`${BASE}/plaid/exchange_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_token: publicToken, userId: USER_ID }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error?.error_message || "Failed to exchange token");
  }
}

export async function getAccounts(): Promise<Account[]> {
  const res = await fetch(`${BASE}/accounts?userId=${USER_ID}`);
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.error_message || "Failed to fetch accounts");
  return data.accounts;
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${BASE}/transactions?userId=${USER_ID}`);
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error?.error_message || "Failed to fetch transactions",
    );
  return data.transactions;
}
