import { useState, useRef, useEffect } from 'react';
import { fmt } from '../lib/budget';
import { NUM, ThemeTokens } from './theme';

interface Props {
  value: number;
  T: ThemeTokens;
  fontSize?: number;
  onSave: (v: number) => void;
}

export default function BudgetInput({ value, T, fontSize = 13, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setRaw(String(value));
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, value]);

  const commit = () => {
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= 0) onSave(Math.round(n));
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        style={{
          width: 72,
          fontSize,
          fontWeight: 680,
          ...NUM,
          border: 'none',
          borderBottom: `1.5px solid ${T.accent}`,
          background: 'transparent',
          color: T.text,
          outline: 'none',
          padding: '0 2px',
          fontFamily: 'inherit',
        }}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit budget"
      style={{
        cursor: 'text',
        borderBottom: `1px dashed ${T.faint}`,
        paddingBottom: 1,
        ...NUM,
      }}
    >
      {fmt(value)}
    </span>
  );
}
