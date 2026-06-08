export interface Category {
  id: string;
  name: string;
  planned: number;
  fixed: boolean;
  color: string;
  pfc?: string[];
  match?: string[];
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  categoryId: string;
}

export interface ComputedCategory extends Category {
  txs: Transaction[];
  spent: number;
  projected: number;
  diff: number;
  pct: number;
}

export interface MonthData {
  year: number;
  month: number;
  daysInMonth: number;
  dayOfMonth: number;
  isCurrent: boolean;
  elapsed: number;
  cats: ComputedCategory[];
  planned: number;
  spent: number;
  projected: number;
  diff: number;
  remaining: number;
}

export const CATEGORIES: Category[] = [
  { id: 'rent',      name: 'Rent',           planned: 1800, fixed: true,  color: '#5B7DB1', pfc: ['RENT_AND_UTILITIES'], match: ['rent', 'property', 'landlord'] },
  { id: 'savings',   name: 'Savings',        planned: 800,  fixed: true,  color: '#6FBF8E', pfc: ['TRANSFER_OUT'], match: ['savings', 'vault', 'transfer to'] },
  { id: 'groceries', name: 'Groceries',      planned: 450,  fixed: false, color: '#5BA672', pfc: ['FOOD_AND_DRINK_GROCERIES'], match: ['market', 'grocery', 'trader joe', 'whole foods', 'safeway', 'co-op'] },
  { id: 'food',      name: 'Social Food',    planned: 250,  fixed: false, color: '#E08A4B', pfc: ['FOOD_AND_DRINK_RESTAURANT', 'FOOD_AND_DRINK_FAST_FOOD'], match: ['restaurant', 'cafe', 'bakery', 'kitchen', 'grill', 'ramen', 'taco'] },
  { id: 'drink',     name: 'Social Drink',   planned: 120,  fixed: false, color: '#C2557A', pfc: ['FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR', 'FOOD_AND_DRINK_COFFEE'], match: ['bar', 'coffee', 'pub', 'tavern', 'brewing', 'blue bottle'] },
  { id: 'transit',   name: 'Transportation', planned: 140,  fixed: false, color: '#4FA3A5', pfc: ['TRANSPORTATION'], match: ['uber', 'lyft', 'clipper', 'bart', 'transit', 'bike', 'gas', 'parking'] },
  { id: 'subs',      name: 'Subscriptions',  planned: 75,   fixed: true,  color: '#8C6FD4', pfc: ['ENTERTAINMENT', 'GENERAL_SERVICES_SUBSCRIPTION'], match: ['spotify', 'netflix', 'icloud', 'patreon', 'nytimes', 'chatgpt', 'subscription'] },
  { id: 'personal',  name: 'Personal Care',  planned: 200,  fixed: false, color: '#D2A24C', pfc: ['PERSONAL_CARE', 'GENERAL_MERCHANDISE'], match: ['pharmacy', 'walgreens', 'cvs', 'sephora', 'aesop', 'uniqlo', 'salon'] },
  { id: 'fitness',   name: 'Fitness',        planned: 60,   fixed: true,  color: '#D2674E', pfc: ['GENERAL_SERVICES_GYMS_AND_FITNESS_CENTERS'], match: ['gym', 'fitness', 'crunch', 'classpass', 'yoga', 'pilates'] },
  { id: 'travel',    name: 'Travel',         planned: 300,  fixed: false, color: '#4E8FD6', pfc: ['TRAVEL'], match: ['airline', 'airbnb', 'hotel', 'flight', 'united', 'delta', 'expedia'] },
];

export const UNCATEGORIZED: Category = { id: 'other', name: 'Uncategorized', planned: 0, fixed: false, color: '#9098A8' };

export function categorize(tx: { personal_finance_category?: { primary?: string }; pfcPrimary?: string; merchant_name?: string; name?: string }): string {
  const pfc = tx.personal_finance_category?.primary || tx.pfcPrimary;
  if (pfc) {
    const byPfc = CATEGORIES.find((c) => c.pfc?.includes(pfc));
    if (byPfc) return byPfc.id;
  }
  const name = (tx.merchant_name || tx.name || '').toLowerCase();
  const byName = CATEGORIES.find((c) => c.match?.some((m) => name.includes(m)));
  return byName ? byName.id : 'other';
}

export function fmt(n: number, cents = false): string {
  const v = Math.round(cents ? n * 100 : n) / (cents ? 100 : 1);
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
}

export function fmtSigned(n: number): string {
  return (n >= 0 ? '+' : '−') + fmt(Math.abs(n));
}

export function computeMonth({ transactions = [], year, month, budgets = {}, today = new Date() }: {
  transactions?: Transaction[];
  year: number;
  month: number;
  budgets?: Record<string, number>;
  today?: Date;
}): MonthData {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrent = today.getFullYear() === year && today.getMonth() === month;
  const dayOfMonth = isCurrent ? today.getDate() : daysInMonth;
  const elapsed = dayOfMonth / daysInMonth;

  const inMonth = transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const cats: ComputedCategory[] = CATEGORIES.map((c) => {
    const txs = inMonth
      .filter((t) => t.categoryId === c.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    const spent = txs.reduce((s, t) => s + t.amount, 0);
    const planned = budgets[c.id] ?? c.planned;
    const projected = c.fixed ? planned : (elapsed > 0 ? spent / elapsed : spent);
    return {
      ...c, planned, txs,
      spent: round2(spent),
      projected: Math.round(projected),
      diff: Math.round(projected) - planned,
      pct: planned ? spent / planned : 0,
    };
  });

  const planned = cats.reduce((s, c) => s + c.planned, 0);
  const spent = cats.reduce((s, c) => s + c.spent, 0);
  const projected = cats.reduce((s, c) => s + c.projected, 0);

  return {
    year, month, daysInMonth, dayOfMonth, isCurrent, elapsed,
    cats, planned, spent: round2(spent), projected,
    diff: projected - planned, remaining: planned - spent,
  };
}

export function statusOf(diff: number, planned: number): { key: string; label: string; color: string } {
  const r = planned ? diff / planned : 0;
  if (diff <= 0) return { key: 'under', label: 'On budget',     color: '#3FAE7A' };
  if (r <= 0.03) return { key: 'watch', label: 'Trending over', color: '#E0A33E' };
  return               { key: 'over',  label: 'Over budget',   color: '#DD6B5A' };
}

function round2(n: number): number { return Math.round(n * 100) / 100; }
