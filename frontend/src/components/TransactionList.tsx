import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: Props) {
  if (transactions.length === 0) {
    return <p className="text-gray-400 text-sm">No transactions yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {transactions.map((txn) => {
        const currency = txn.iso_currency_code || 'USD';
        const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });
        const isDebit = txn.amount > 0;

        return (
          <li key={txn.transaction_id} className="flex items-center justify-between py-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-800">
                {txn.merchant_name || txn.name}
              </p>
              <p className="text-xs text-gray-400">
                {txn.date} {txn.pending && '· pending'}
              </p>
            </div>
            <span className={`ml-4 font-semibold ${isDebit ? 'text-red-500' : 'text-green-600'}`}>
              {isDebit ? '-' : '+'}{fmt.format(Math.abs(txn.amount))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
