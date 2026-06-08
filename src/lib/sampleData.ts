import { categorize, Transaction } from './budget';

function thisMonth(day: number): string {
  const n = new Date();
  const mm = String(n.getMonth() + 1).padStart(2, '0');
  const dd = String(Math.min(day, n.getDate())).padStart(2, '0');
  return `${n.getFullYear()}-${mm}-${dd}`;
}

const RAW: [string, number, number, string][] = [
  ['Sunbreak Property Mgmt', 1800,   1,  'RENT_AND_UTILITIES'],
  ['Auto-transfer · Vault',   800,   1,  'TRANSFER_OUT'],
  ['Whole Foods Market',       84.20, 21, 'FOOD_AND_DRINK_GROCERIES'],
  ['Trader Joe’s',        52.65, 17, 'FOOD_AND_DRINK_GROCERIES'],
  ['Berkeley Bowl',            61.40, 12, 'FOOD_AND_DRINK_GROCERIES'],
  ['Whole Foods Market',       73.10,  6, 'FOOD_AND_DRINK_GROCERIES'],
  ['Local Co-op',              38.55,  3, 'FOOD_AND_DRINK_GROCERIES'],
  ['Trader Joe’s',        79.90,  2, 'FOOD_AND_DRINK_GROCERIES'],
  ['Tartine Bakery',           28.00, 22, 'FOOD_AND_DRINK_RESTAURANT'],
  ['Nopa',                     64.50, 19, 'FOOD_AND_DRINK_RESTAURANT'],
  ['Rintaro',                  71.00, 14, 'FOOD_AND_DRINK_RESTAURANT'],
  ['Souvla',                   22.50,  9, 'FOOD_AND_DRINK_RESTAURANT'],
  ['Mensho Ramen',             26.00,  5, 'FOOD_AND_DRINK_RESTAURANT'],
  ['Trick Dog',                31.00, 20, 'FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR'],
  ['Blue Bottle',               6.75, 18, 'FOOD_AND_DRINK_COFFEE'],
  ['Zeitgeist',                24.00, 13, 'FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR'],
  ['Sightglass Coffee',         9.25,  8, 'FOOD_AND_DRINK_COFFEE'],
  ['Bay Wheels',               29.00,  1, 'TRANSPORTATION'],
  ['Uber',                     18.40, 16, 'TRANSPORTATION'],
  ['Clipper top-up',           30.00, 11, 'TRANSPORTATION'],
  ['Lyft',                     18.60,  6, 'TRANSPORTATION'],
  ['Spotify',                  11.99,  3, 'ENTERTAINMENT'],
  ['iCloud+',                   9.99,  3, 'GENERAL_SERVICES_SUBSCRIPTION'],
  ['NYTimes',                  22.00,  3, 'GENERAL_SERVICES_SUBSCRIPTION'],
  ['ChatGPT Plus',             20.00,  3, 'GENERAL_SERVICES_SUBSCRIPTION'],
  ['Aesop',                    48.00, 19, 'PERSONAL_CARE'],
  ['Walgreens',                22.40, 13, 'PERSONAL_CARE'],
  ['Uniqlo',                   59.90, 10, 'GENERAL_MERCHANDISE'],
  ['Crunch Membership',        39.00,  2, 'GENERAL_SERVICES_GYMS_AND_FITNESS_CENTERS'],
  ['ClassPass credits',        21.00, 12, 'GENERAL_SERVICES_GYMS_AND_FITNESS_CENTERS'],
  ['United Airlines',         142.00, 15, 'TRAVEL'],
  ['Airbnb',                   68.00,  8, 'TRAVEL'],
];

export const SAMPLE_TRANSACTIONS: Transaction[] = RAW.map(([name, amount, day, pfcPrimary], i) => ({
  id: 'sample-' + i,
  name,
  amount,
  date: thisMonth(day),
  categoryId: categorize({ name, pfcPrimary }),
}));
