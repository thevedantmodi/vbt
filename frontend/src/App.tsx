import { usePlaid } from "./hooks/usePlaid";
import { PlaidLink } from "./components/PlaidLink";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const {
    open,
    ready,
    linked,
    accounts,
    transactions,
    loading,
    error,
    fetchData,
  } = usePlaid();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">
          Vedant's Budget Tool
        </h1>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!linked ? (
          <PlaidLink onOpen={() => open()} ready={ready} />
        ) : (
          <Dashboard
            accounts={accounts}
            transactions={transactions}
            loading={loading}
            onRefresh={fetchData}
          />
        )}
      </main>
    </div>
  );
}
