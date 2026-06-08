import { AccountCard } from './AccountCard';
import { TransactionList } from './TransactionList';
import { Account, Transaction } from '../types';

interface Props {
  accounts: Account[];
  transactions: Transaction[];
  loading: boolean;
  onRefresh: () => void;
}

export function Dashboard({ accounts, transactions, loading, onRefresh }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Accounts</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-sm text-blue-600 hover:underline disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((acc) => (
          <AccountCard key={acc.account_id} account={acc} />
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Transactions</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
