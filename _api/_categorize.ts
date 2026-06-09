const RULES: { id: string; pfc: string[]; match: string[] }[] = [
  { id: 'rent',      pfc: ['RENT_AND_UTILITIES'], match: ['rent', 'property', 'landlord'] },
  { id: 'savings',   pfc: ['TRANSFER_OUT'], match: ['savings', 'vault', 'transfer to'] },
  { id: 'groceries', pfc: ['FOOD_AND_DRINK_GROCERIES'], match: ['market', 'grocery', 'trader joe', 'whole foods', 'safeway', 'co-op'] },
  { id: 'food',      pfc: ['FOOD_AND_DRINK_RESTAURANT', 'FOOD_AND_DRINK_FAST_FOOD'], match: ['restaurant', 'cafe', 'bakery', 'kitchen', 'grill', 'ramen', 'taco'] },
  { id: 'drink',     pfc: ['FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR', 'FOOD_AND_DRINK_COFFEE'], match: ['bar', 'coffee', 'pub', 'tavern', 'brewing', 'blue bottle'] },
  { id: 'transit',   pfc: ['TRANSPORTATION'], match: ['uber', 'lyft', 'clipper', 'bart', 'transit', 'bike', 'gas', 'parking'] },
  { id: 'subs',      pfc: ['ENTERTAINMENT', 'GENERAL_SERVICES_SUBSCRIPTION'], match: ['spotify', 'netflix', 'icloud', 'patreon', 'nytimes', 'chatgpt', 'subscription'] },
  { id: 'personal',  pfc: ['PERSONAL_CARE', 'GENERAL_MERCHANDISE'], match: ['pharmacy', 'walgreens', 'cvs', 'sephora', 'aesop', 'uniqlo', 'salon'] },
  { id: 'fitness',   pfc: ['GENERAL_SERVICES_GYMS_AND_FITNESS_CENTERS'], match: ['gym', 'fitness', 'crunch', 'classpass', 'yoga', 'pilates'] },
  { id: 'travel',    pfc: ['TRAVEL'], match: ['airline', 'airbnb', 'hotel', 'flight', 'united', 'delta', 'expedia'] },
];

export function categorize(tx: {
  personal_finance_category?: { primary?: string } | null;
  merchant_name?: string | null;
  name?: string | null;
}): string {
  const pfc = tx.personal_finance_category?.primary;
  if (pfc) {
    const r = RULES.find((x) => x.pfc.includes(pfc));
    if (r) return r.id;
  }
  const name = (tx.merchant_name || tx.name || '').toLowerCase();
  const r = RULES.find((x) => x.match.some((m) => name.includes(m)));
  return r ? r.id : 'other';
}
