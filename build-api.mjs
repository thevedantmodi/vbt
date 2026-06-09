import { build } from 'esbuild';
import { mkdirSync } from 'fs';

mkdirSync('api/plaid', { recursive: true });

await build({
  entryPoints: {
    'status': '_api/status.ts',
    'transactions': '_api/transactions.ts',
    'sync': '_api/sync.ts',
    'accounts': '_api/accounts.ts',
    'plaid/create_link_token': '_api/plaid/create_link_token.ts',
    'plaid/exchange_public_token': '_api/plaid/exchange_public_token.ts',
    'unlink': '_api/unlink.ts',
    'budgets': '_api/budgets.ts',
    'override': '_api/override.ts',
    'hide': '_api/hide.ts',
  },
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outdir: 'api',
  packages: 'external',
});

console.log('API bundle done.');
