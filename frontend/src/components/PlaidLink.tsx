interface Props {
  onOpen: () => void;
  ready: boolean;
}

export function PlaidLink({ onOpen, ready }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-2xl font-bold text-gray-800">Connect your bank</h2>
      <p className="text-gray-500">Link an account to start tracking your budget.</p>
      <button
        onClick={onOpen}
        disabled={!ready}
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
      >
        Connect with Plaid
      </button>
    </div>
  );
}
