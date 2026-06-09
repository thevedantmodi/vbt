import { useEffect, useState, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import EditorialScreen from "./components/EditorialScreen";
import DesktopScreen from "./components/DesktopScreen";
import { api } from "./lib/api";
import { SAMPLE_TRANSACTIONS } from "./lib/sampleData";
import { Transaction } from "./lib/budget";

const ACCENT = "#4F63D2";

export default function App() {
  const [dark, setDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
  );
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 768);
  const [linked, setLinked] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [mockTransactions, setMockTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(true);
  const [serverUp, setServerUp] = useState(false);

  useEffect(() => {
    const handler = () => setDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    api
      .status()
      .then((s) => {
        setServerUp(true);
        if (s.linked) {
          setLinked(true);
          refresh();
        }
        return api.getBudgets();
      })
      .then(({ budgets }) => setBudgets(budgets))
      .catch(() => setServerUp(false));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await api.sync();
      const { transactions } = await api.getTransactions();
      setTransactions(transactions);
      setDemo(false);
    } catch (e) {
      console.warn("Falling back to sample data:", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    try {
      const { transactions } = await api.getTransactions();
      setTransactions(transactions);
    } catch {}
  }, []);

  const handleSetBudget = useCallback(async (categoryId: string, planned: number) => {
    setBudgets((prev) => ({ ...prev, [categoryId]: planned }));
    if (serverUp) {
      await api.setBudget(categoryId, planned).catch(() => {});
    }
  }, [serverUp]);

const startLink = async () => {
    const { link_token } = await api.createLinkToken();
    setLinkToken(link_token);
  };

  const unlink = async () => {
    if (!confirm("Disconnect your bank? This removes all synced data.")) return;
    await api.unlink();
    setLinked(false);
    setTransactions(SAMPLE_TRANSACTIONS);
    setDemo(true);
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      await api.exchangePublicToken(public_token);
      setLinked(true);
      await api.sync();
      await refresh();
    },
  });

  useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready, open]);

  const addMockTransaction = useCallback((t: Transaction) => {
    setMockTransactions((prev) => [...prev, t]);
  }, []);

  const allTransactions = [...transactions, ...mockTransactions];

  const bankProps = { linked, serverUp, loading, demo, onLink: startLink, onSync: refresh, onUnlink: unlink };

  if (desktop) {
    return (
      <DesktopScreen
        transactions={allTransactions}
        dark={dark}
        accent={ACCENT}
        budgets={budgets}
        onSetBudget={handleSetBudget}
        onRefreshTransactions={refreshTransactions}
        onAddMockTransaction={addMockTransaction}
        onToggleDark={() => setDark((v) => !v)}
        {...bankProps}
      />
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: dark ? "#000" : "#e9e7e1",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 0 40px",
    }}>
      <div style={{
        width: 402,
        maxWidth: "100vw",
        height: 860,
        maxHeight: "100dvh",
        borderRadius: 40,
        overflow: "hidden",
        boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
        background: dark ? "#0E0F11" : "#F4F2EC",
      }}>
        <EditorialScreen
          transactions={allTransactions}
          dark={dark}
          accent={ACCENT}
          budgets={budgets}
          onSetBudget={handleSetBudget}
          onRefreshTransactions={refreshTransactions}
          onToggleDark={() => setDark((v) => !v)}
          {...bankProps}
        />
      </div>
    </div>
  );
}
