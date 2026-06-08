import { useEffect, useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import EditorialScreen from './components/EditorialScreen';
import DesktopScreen from './components/DesktopScreen';
import { api } from './lib/api';
import { SAMPLE_TRANSACTIONS } from './lib/sampleData';
import { Transaction } from './lib/budget';

const ACCENT = '#4F63D2';

const btn: React.CSSProperties = {
  border: '1px solid rgba(128,128,128,0.4)', background: 'transparent', color: 'inherit',
  borderRadius: 99, padding: '6px 14px', cursor: 'pointer', font: 'inherit',
};

export default function App() {
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const [desktop, setDesktop] = useState(false);
  const [linked, setLinked] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(true);
  const [serverUp, setServerUp] = useState(false);

  useEffect(() => {
    api.status()
      .then((s) => { setServerUp(true); if (s.linked) { setLinked(true); refresh(); } })
      .catch(() => setServerUp(false));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await api.sync();
      const { transactions } = await api.getTransactions();
      setTransactions(transactions);
      setDemo(false);
    } catch (e) {
      console.warn('Falling back to sample data:', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const startLink = async () => {
    const { link_token } = await api.createLinkToken();
    setLinkToken(link_token);
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      await api.exchangePublicToken(public_token);
      setLinked(true);
      await api.sync();
      await refresh();
    },
  });

  useEffect(() => { if (linkToken && ready) open(); }, [linkToken, ready, open]);

  if (desktop) {
    return (
      <div style={{ fontFamily: 'system-ui', fontSize: 13 }}>
        {/* desktop toolbar */}
        <div style={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 8, zIndex: 100 }}>
          {demo && <span style={{ padding: '6px 14px', color: '#888', border: '1px solid rgba(128,128,128,0.3)', borderRadius: 99, background: dark ? '#111' : '#fff' }}>sample data</span>}
          {!linked && <button onClick={startLink} disabled={!serverUp} style={{ ...btn, background: dark ? '#111' : '#fff', opacity: serverUp ? 1 : 0.4 }}>{serverUp ? '+ Connect bank' : 'Server offline'}</button>}
          {linked && <button onClick={refresh} style={{ ...btn, background: dark ? '#111' : '#fff' }}>{loading ? 'Syncing…' : '↻ Sync'}</button>}
          <button onClick={() => setDark((v) => !v)} style={{ ...btn, background: dark ? '#111' : '#fff' }}>{dark ? '☀︎' : '☾'}</button>
          <button onClick={() => setDesktop(false)} style={{ ...btn, background: dark ? '#111' : '#fff' }}>☎ Phone</button>
        </div>
        <DesktopScreen transactions={transactions} dark={dark} accent={ACCENT} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#000' : '#e9e7e1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0 40px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'system-ui', fontSize: 13 }}>
        <button onClick={() => setDark((v) => !v)} style={btn}>{dark ? '☀︎ Light' : '☾ Dark'}</button>
        <button onClick={() => setDesktop(true)} style={btn}>⬜ Desktop</button>
        {!linked && <button onClick={startLink} disabled={!serverUp} style={{ ...btn, opacity: serverUp ? 1 : 0.4 }}>{serverUp ? '+ Connect a bank (Plaid)' : 'Server offline'}</button>}
        {linked && <button onClick={refresh} style={btn}>{loading ? 'Syncing…' : '↻ Sync'}</button>}
        {demo && <span style={{ color: dark ? '#888' : '#666' }}>· showing sample data</span>}
      </div>

      <div style={{ width: 402, height: 860, borderRadius: 40, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', background: dark ? '#0E0F11' : '#F4F2EC' }}>
        <EditorialScreen transactions={transactions} dark={dark} accent={ACCENT} />
      </div>
    </div>
  );
}
