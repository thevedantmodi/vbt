import { Account } from '../types';

interface Props {
  account: Account;
}

export function AccountCard({ account }: Props) {
  const balance = account.balances.current ?? account.balances.available;
  const currency = account.balances.iso_currency_code || 'USD';
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500 capitalize">{account.subtype || account.type}</p>
      <p className="mt-1 font-semibold text-gray-800 truncate">{account.name}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {balance !== null ? fmt.format(balance) : '—'}
      </p>
    </div>
  );
}
