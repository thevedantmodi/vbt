import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORIES, Category } from '../lib/budget';
import { ThemeTokens } from './theme';

interface Props {
  value: string;
  onChange: (id: string) => void;
  T: ThemeTokens;
  dark: boolean;
  placeholder?: string;
  fontSize?: number;
  marginTop?: number;
}

export default function CatSelect({ value, onChange, T, dark, placeholder, fontSize = 11, marginTop = 5 }: Props) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = () => setOpen(false);
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
  };

  const selected = value ? CATEGORIES.find((c: Category) => c.id === value) : null;
  const label = selected?.name ?? placeholder ?? '';

  return (
    <>
      <button
        ref={btnRef}
        onMouseDown={e => e.stopPropagation()}
        onClick={openMenu}
        style={{
          marginTop,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize,
          color: selected ? T.text : T.faint,
          background: T.surface,
          border: `1px solid ${open ? T.text : T.hair}`,
          borderRadius: 8,
          padding: '3px 8px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color 0.12s',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, letterSpacing: '-0.01em' }}>{label}</span>
        <span style={{ color: T.faint, fontSize: 9, marginLeft: 4, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
      </button>

      {open && rect && createPortal(
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
            background: T.surface,
            border: `1px solid ${T.hair}`,
            borderRadius: 12,
            boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.13)',
            padding: '4px 0',
            overflow: 'hidden',
            fontFamily: '-apple-system, system-ui, sans-serif',
          }}
        >
          {CATEGORIES.map((c: Category) => (
            <button
              key={c.id}
              onClick={() => { onChange(c.id); setOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: T.text,
                background: c.id === value ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : 'transparent',
                border: 'none',
                padding: '6px 12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <span style={{ width: 12, flexShrink: 0, color: T.faint, fontSize: 10, fontWeight: 500 }}>{c.id === value ? '✓' : ''}</span>
              {c.name}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
