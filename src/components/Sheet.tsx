import Ring from './Ring';
import CatIcon from './CatIcon';
import BudgetInput from './BudgetInput';
import { NUM, ThemeTokens } from './theme';
import { fmt, fmtSigned, ComputedCategory } from '../lib/budget';

interface Props {
  cat: ComputedCategory | null;
  T: ThemeTokens;
  dark: boolean;
  monthLabel: string;
  year: number;
  isCurrent: boolean;
  onClose: () => void;
  onSetBudget: (categoryId: string, planned: number) => void;
}

export default function Sheet({ cat, T, dark, monthLabel, year, isCurrent, onClose, onSetBudget }: Props) {
  const showing = !!cat;
  const c = cat;
  const txs = cat ? cat.txs : [];
  const over = cat && cat.diff > 0 && !cat.fixed;

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: T.scrim, opacity: showing ? 1 : 0, pointerEvents: showing ? 'auto' : 'none', transition: 'opacity .28s ease', zIndex: 20 }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 21,
        background: T.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26,
        boxShadow: '0 -16px 50px rgba(0,0,0,0.28)', padding: '10px 22px 30px',
        maxHeight: '78%', display: 'flex', flexDirection: 'column',
        transform: showing ? 'translateY(0)' : 'translateY(102%)', transition: 'transform .34s cubic-bezier(.32,.72,0,1)',
      }}>
        <div style={{ width: 38, height: 5, borderRadius: 99, background: T.hair, margin: '0 auto 16px' }} />
        {c && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.color + (dark ? '26' : '1f'), color: c.color }}>
                <CatIcon id={c.id} size={22} stroke={1.9} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 19, fontWeight: 680, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ fontSize: 13, color: T.muted, ...NUM }}>
                  {fmt(c.spent)} of{' '}
                  <BudgetInput value={c.planned} T={T} fontSize={13} onSave={(v) => onSetBudget(c.id, v)} />
                  {' '}· {Math.round(c.pct * 100)}%
                </div>
              </div>
              <Ring size={52} stroke={6} value={c.pct} color={over ? '#DD6B5A' : c.color} track={T.track} rounded>
                <span style={{ fontSize: 12, fontWeight: 700, ...NUM }}>{Math.round(c.pct * 100)}%</span>
              </Ring>
            </div>

            {isCurrent && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Mini label={c.fixed ? 'Recurring' : 'Projected'} value={fmt(c.projected)} T={T} />
                <Mini label="vs plan" value={fmtSigned(c.diff)} color={c.fixed ? T.text : (over ? '#DD6B5A' : '#3FAE7A')} T={T} />
                <Mini label="Remaining" value={fmt(c.planned - c.spent)} T={T} />
              </div>
            )}

            <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.faint, fontWeight: 600, margin: '22px 0 2px' }}>
              Transactions
            </div>
            <div style={{ overflowY: 'auto', marginRight: -8, paddingRight: 8 }}>
              {txs.length === 0 && (
                <div style={{ fontSize: 14, color: T.faint, padding: '18px 0' }}>No transactions this month.</div>
              )}
              {txs.map((t, i) => (
                <div key={t.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: i ? `1px solid ${T.hair}` : 'none' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>{prettyDate(t.date, year)}</div>
                  </div>
                  <div style={{ fontSize: 14.5, marginLeft: 12, ...NUM }}>{fmt(t.amount, true)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

interface MiniProps {
  label: string;
  value: string;
  color?: string;
  T: ThemeTokens;
}

function Mini({ label, value, color, T }: MiniProps) {
  return (
    <div style={{ flex: 1, background: T.surface2, border: `1px solid ${T.hair}`, borderRadius: 13, padding: '10px 11px' }}>
      <div style={{ fontSize: 11, color: T.faint, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 680, marginTop: 4, color: color || T.text, ...NUM }}>{value}</div>
    </div>
  );
}

function prettyDate(iso: string, year: number): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + year;
}
