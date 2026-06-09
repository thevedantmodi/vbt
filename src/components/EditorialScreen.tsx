import { useState } from 'react';
import Ring from './Ring';
import CatIcon from './CatIcon';
import Sheet from './Sheet';
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

export default function EditorialScreen({ transactions = [], dark = false, accent = '#4F63D2', budgets = {}, onSetBudget }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [openId, setOpenId] = useState<string | null>(null);

  const T = tokens(dark, accent);
  const d = computeMonth({ transactions, year: cursor.year, month: cursor.month, budgets, today });
  const st = statusOf(d.diff, d.planned);
  const oc = openId ? d.cats.find((c) => c.id === openId) ?? null : null;

  const step = (n: number) => {
    let m = cursor.month + n, y = cursor.year;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    if (y > today.getFullYear() || (y === today.getFullYear() && m > today.getMonth())) return;
    setCursor({ year: y, month: m });
    setOpenId(null);
  };
  const atFuture = cursor.year === today.getFullYear() && cursor.month === today.getMonth();

  return (
    <div style={{ position: 'relative', height: '100%', background: T.bg, color: T.text, fontFamily: '-apple-system, system-ui, sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '52px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.faint, fontWeight: 600 }}>Monthly budget</div>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 4 }}>{MONTH_NAMES[d.month]}</div>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{d.isCurrent ? `Day ${d.dayOfMonth} of ${d.daysInMonth}` : `${d.year} · closed`}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <Chev dir="l" onClick={() => step(-1)} T={T} />
            <Chev dir="r" disabled={atFuture} onClick={() => step(1)} T={T} />
          </div>
        </div>

        <div style={{ padding: '24px 24px 4px' }}>
          <div style={{ fontSize: 12.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.faint, fontWeight: 600 }}>
            {d.isCurrent ? 'Projected spend' : 'Total spent'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
            <div style={{ fontSize: 56, fontWeight: 720, ...NUM }}>{fmt(d.isCurrent ? d.projected : d.spent)}</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: st.color }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: st.color }}>{st.label}</span>
            <span style={{ fontSize: 14, color: T.muted }}>· {fmtSigned(d.diff)} vs {fmt(d.planned)} plan</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ position: 'relative', height: 12, borderRadius: 99, background: T.track }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: Math.min(100, d.planned ? d.spent / d.planned * 100 : 0) + '%', height: '100%', background: st.color, borderRadius: 99, transition: 'width .9s cubic-bezier(.4,0,.2,1)' }} />
              </div>
              {d.isCurrent && (
                <div title="expected by today" style={{ position: 'absolute', top: -4, bottom: -4, left: `calc(${(d.elapsed * 100).toFixed(1)}% - 1px)`, width: 2, borderRadius: 2, background: T.text, opacity: 0.6 }} />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, fontSize: 12.5, color: T.muted, ...NUM }}>
              <span><b style={{ color: T.text, fontWeight: 650 }}>{fmt(d.spent)}</b> spent</span>
              <span>{d.isCurrent ? `${fmt(Math.max(0, d.remaining))} left` : `${fmt(d.planned)} planned`}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '22px 18px 0' }}>
          <div style={{ fontSize: 12.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.faint, fontWeight: 600, padding: '0 6px 12px' }}>Categories</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {d.cats.map((c) => <CatCard key={c.id} c={c} T={T} dark={dark} onClick={() => setOpenId(c.id)} />)}
          </div>
          <div style={{ height: 28 }} />
        </div>
      </div>

      <Sheet cat={oc} T={T} dark={dark} monthLabel={MONTH_NAMES[d.month]} year={d.year} isCurrent={d.isCurrent} onClose={() => setOpenId(null)} onSetBudget={onSetBudget ?? (() => {})} />
    </div>
  );
}

interface CatCardProps {
  c: ComputedCategory;
  T: ThemeTokens;
  dark: boolean;
  onClick: () => void;
}

function CatCard({ c, T, dark, onClick }: CatCardProps) {
  const over = c.diff > 0 && !c.fixed;
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', border: `1px solid ${T.hair}`, background: T.surface, borderRadius: 18,
      padding: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'inherit', color: T.text,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.color + (dark ? '26' : '1f'), color: c.color }}>
          <CatIcon id={c.id} size={16} stroke={1.9} />
        </span>
        <Ring size={42} stroke={5} value={c.pct} color={over ? T.text : c.color} track={T.track} rounded>
          <span style={{ fontSize: 11, fontWeight: 650, color: over ? T.text : T.muted, ...NUM }}>{Math.round(c.pct * 100)}</span>
        </Ring>
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 2, ...NUM }}>{fmt(c.spent)} <span style={{ color: T.faint }}>/ {fmt(c.planned)}</span></div>
      </div>
    </button>
  );
}

interface ChevProps {
  dir: 'l' | 'r';
  onClick: () => void;
  disabled?: boolean;
  T: ThemeTokens;
}

function Chev({ dir, onClick, disabled, T }: ChevProps) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 38, height: 38, borderRadius: 99, border: `1px solid ${T.hair}`, background: 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1, padding: 0,
    }}>
      <svg width="9" height="14" viewBox="0 0 9 14" fill="none" style={{ transform: dir === 'r' ? 'none' : 'scaleX(-1)' }}>
        <path d="M1.5 1L7 7l-5.5 6" stroke={T.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
