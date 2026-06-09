import { useState } from 'react';
import Ring from './Ring';
import CatIcon from './CatIcon';
import BudgetInput from './BudgetInput';
import { tokens, NUM, ThemeTokens } from './theme';
import { computeMonth, statusOf, fmt, fmtSigned, ComputedCategory, Transaction } from '../lib/budget';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface Props {
  transactions?: Transaction[];
  dark?: boolean;
  accent?: string;
  budgets?: Record<string, number>;
  onSetBudget?: (categoryId: string, planned: number) => void;
}

export default function DesktopScreen({ transactions = [], dark = false, accent = '#4F63D2', budgets = {}, onSetBudget }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [openId, setOpenId] = useState<string | null>(null);

  const T = tokens(dark, accent);
  const d = computeMonth({ transactions, year: cursor.year, month: cursor.month, budgets, today });
  const st = statusOf(d.diff, d.planned);
  const selectedCat = openId ? d.cats.find((c) => c.id === openId) ?? null : null;

  const step = (n: number) => {
    let m = cursor.month + n, y = cursor.year;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    if (y > today.getFullYear() || (y === today.getFullYear() && m > today.getMonth())) return;
    setCursor({ year: y, month: m });
    setOpenId(null);
  };
  const atFuture = cursor.year === today.getFullYear() && cursor.month === today.getMonth();

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: '-apple-system, system-ui, sans-serif' }}>
      {/* top bar */}
      <div style={{ borderBottom: `1px solid ${T.hair}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surface }}>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Vedant's Budget Tool</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Chev dir="l" onClick={() => step(-1)} T={T} />
          <span style={{ fontSize: 15, fontWeight: 600, minWidth: 130, textAlign: 'center' }}>
            {MONTH_NAMES[d.month]} {d.year}
          </span>
          <Chev dir="r" disabled={atFuture} onClick={() => step(1)} T={T} />
        </div>
      </div>

      {/* main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0, minHeight: 'calc(100vh - 56px)' }}>

        {/* left sidebar — summary */}
        <div style={{ borderRight: `1px solid ${T.hair}`, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.faint, fontWeight: 600 }}>
              {d.isCurrent ? 'Projected spend' : 'Total spent'}
            </div>
            <div style={{ fontSize: 48, fontWeight: 720, letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 6, ...NUM }}>
              {fmt(d.isCurrent ? d.projected : d.spent)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: st.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: st.color }}>{st.label}</span>
            </div>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>
              {fmtSigned(d.diff)} vs {fmt(d.planned)} plan
            </div>
          </div>

          {/* gauge */}
          <div>
            <div style={{ position: 'relative', height: 10, borderRadius: 99, background: T.track }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: Math.min(100, d.planned ? d.spent / d.planned * 100 : 0) + '%', height: '100%', background: st.color, borderRadius: 99, transition: 'width .9s cubic-bezier(.4,0,.2,1)' }} />
              </div>
              {d.isCurrent && (
                <div style={{ position: 'absolute', top: -3, bottom: -3, left: `calc(${(d.elapsed * 100).toFixed(1)}% - 1px)`, width: 2, borderRadius: 2, background: T.text, opacity: 0.55 }} />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: T.muted, ...NUM }}>
              <span><b style={{ color: T.text }}>{fmt(d.spent)}</b> spent</span>
              <span>{d.isCurrent ? `${fmt(Math.max(0, d.remaining))} left` : `${fmt(d.planned)} planned`}</span>
            </div>
          </div>

          {/* mini stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard label="Planned" value={fmt(d.planned)} T={T} />
            <StatCard label="Remaining" value={fmt(Math.max(0, d.remaining))} T={T} />
            <StatCard label="Spent" value={fmt(d.spent)} T={T} />
            <StatCard label={d.isCurrent ? `Day ${d.dayOfMonth}/${d.daysInMonth}` : 'Closed'} value={d.isCurrent ? `${Math.round(d.elapsed * 100)}%` : '—'} T={T} />
          </div>
        </div>

        {/* right — categories + transaction panel */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedCat ? '1fr 340px' : '1fr', transition: 'grid-template-columns .3s ease' }}>

          {/* category grid */}
          <div style={{ padding: '28px 28px', overflowY: 'auto' }}>
            <div style={{ fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.faint, fontWeight: 600, marginBottom: 16 }}>Categories</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {d.cats.map((c) => (
                <CatCard
                  key={c.id}
                  c={c}
                  T={T}
                  dark={dark}
                  selected={openId === c.id}
                  onClick={() => setOpenId(openId === c.id ? null : c.id)}
                />
              ))}
            </div>
          </div>

          {/* transaction panel */}
          {selectedCat && (
            <TxPanel cat={selectedCat} T={T} dark={dark} year={d.year} isCurrent={d.isCurrent} onClose={() => setOpenId(null)} onSetBudget={onSetBudget ?? (() => {})} />
          )}
        </div>
      </div>
    </div>
  );
}

interface CatCardProps {
  c: ComputedCategory;
  T: ThemeTokens;
  dark: boolean;
  selected: boolean;
  onClick: () => void;
}

function CatCard({ c, T, dark, selected, onClick }: CatCardProps) {
  const over = c.diff > 0 && !c.fixed;
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', border: `1.5px solid ${selected ? c.color : T.hair}`,
      background: selected ? c.color + (dark ? '18' : '10') : T.surface,
      borderRadius: 16, padding: '16px 16px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 14,
      fontFamily: 'inherit', color: T.text, transition: 'border-color .15s, background .15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.color + (dark ? '26' : '1f'), color: c.color }}>
          <CatIcon id={c.id} size={17} stroke={1.9} />
        </span>
        <Ring size={44} stroke={5} value={c.pct} color={over ? '#DD6B5A' : c.color} track={T.track} rounded>
          <span style={{ fontSize: 11, fontWeight: 650, color: over ? '#DD6B5A' : T.muted, ...NUM }}>{Math.round(c.pct * 100)}</span>
        </Ring>
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
        <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3, ...NUM }}>
          {fmt(c.spent)} <span style={{ color: T.faint }}>/ {fmt(c.planned)}</span>
        </div>
      </div>
    </button>
  );
}

interface TxPanelProps {
  cat: ComputedCategory;
  T: ThemeTokens;
  dark: boolean;
  year: number;
  isCurrent: boolean;
  onClose: () => void;
  onSetBudget: (categoryId: string, planned: number) => void;
}

function TxPanel({ cat, T, dark, year, isCurrent, onClose, onSetBudget }: TxPanelProps) {
  const over = cat.diff > 0 && !cat.fixed;
  return (
    <div style={{ borderLeft: `1px solid ${T.hair}`, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', position: 'sticky', top: 0 }}>
      {/* panel header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cat.color + (dark ? '26' : '1f'), color: cat.color }}>
              <CatIcon id={cat.id} size={18} stroke={1.9} />
            </span>
            <span style={{ fontSize: 16, fontWeight: 680 }}>{cat.name}</span>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 99, border: `1px solid ${T.hair}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 16 }}>×</button>
        </div>
        <div style={{ fontSize: 13, color: T.muted, ...NUM }}>
          {fmt(cat.spent)} of{' '}
          <BudgetInput value={cat.planned} T={T} fontSize={13} onSave={(v) => onSetBudget(cat.id, v)} />
          {' '}· {Math.round(cat.pct * 100)}%
        </div>
        {isCurrent && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <MiniStat label={cat.fixed ? 'Recurring' : 'Projected'} value={fmt(cat.projected)} T={T} />
            <MiniStat label="vs plan" value={fmtSigned(cat.diff)} color={cat.fixed ? T.text : (over ? '#DD6B5A' : '#3FAE7A')} T={T} />
          </div>
        )}
      </div>

      {/* transaction list */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 20px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.faint, fontWeight: 600, padding: '12px 0 4px' }}>Transactions</div>
        {cat.txs.length === 0 && (
          <div style={{ fontSize: 14, color: T.faint, padding: '16px 0' }}>No transactions this month.</div>
        )}
        {cat.txs.map((t, i) => (
          <div key={t.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderTop: i ? `1px solid ${T.hair}` : 'none' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
              <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>{prettyDate(t.date, year)}</div>
            </div>
            <div style={{ fontSize: 13.5, marginLeft: 12, flexShrink: 0, ...NUM }}>{fmt(t.amount, true)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatCardProps { label: string; value: string; T: ThemeTokens; }
function StatCard({ label, value, T }: StatCardProps) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: T.faint, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 650, marginTop: 3, ...NUM }}>{value}</div>
    </div>
  );
}

interface MiniStatProps { label: string; value: string; color?: string; T: ThemeTokens; }
function MiniStat({ label, value, color, T }: MiniStatProps) {
  return (
    <div style={{ flex: 1, background: T.bg, border: `1px solid ${T.hair}`, borderRadius: 10, padding: '8px 10px' }}>
      <div style={{ fontSize: 10.5, color: T.faint, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 650, marginTop: 3, color: color || T.text, ...NUM }}>{value}</div>
    </div>
  );
}

interface ChevProps { dir: 'l' | 'r'; onClick: () => void; disabled?: boolean; T: ThemeTokens; }
function Chev({ dir, onClick, disabled, T }: ChevProps) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 32, height: 32, borderRadius: 99, border: `1px solid ${T.hair}`, background: 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1, padding: 0,
    }}>
      <svg width="8" height="13" viewBox="0 0 9 14" fill="none" style={{ transform: dir === 'r' ? 'none' : 'scaleX(-1)' }}>
        <path d="M1.5 1L7 7l-5.5 6" stroke={T.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function prettyDate(iso: string, year: number): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + year;
}
