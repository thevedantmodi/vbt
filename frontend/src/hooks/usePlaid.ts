import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { createLinkToken, exchangeToken, getAccounts, getTransactions } from '../services/api';
import { Account, Transaction } from '../types';

export function usePlaid() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linked, setLinked] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createLinkToken()
      .then(setLinkToken)
      .catch((e) => setError(e.message));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [accs, txns] = await Promise.all([getAccounts(), getTransactions()]);
      setAccounts(accs);
      setTransactions(txns);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      try {
        await exchangeToken(publicToken);
        setLinked(true);
        fetchData();
      } catch (e: any) {
        setError(e.message);
      }
    },
    onExit: (err) => {
      if (err) setError(err.error_message || 'Link exited with error');
    },
  });

  return { open, ready, linked, accounts, transactions, loading, error, fetchData };
}
