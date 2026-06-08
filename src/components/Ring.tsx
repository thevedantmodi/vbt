import React from 'react';

interface Props {
  size?: number;
  stroke?: number;
  value?: number;
  color?: string;
  track?: string;
  pace?: number | null;
  paceColor?: string;
  rounded?: boolean;
  gradient?: [string, string] | null;
  glow?: boolean;
  children?: React.ReactNode;
  startAt?: number;
}

export default function Ring({
  size = 120, stroke = 10, value = 0, color = '#888', track = 'rgba(0,0,0,0.08)',
  pace = null, paceColor = 'rgba(0,0,0,0.5)', rounded = true, gradient = null, glow = false,
  children, startAt = -90,
}: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const gid = React.useId().replace(/:/g, '');
  const cx = size / 2, cy = size / 2;

  let tick: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (pace != null) {
    const a = (startAt + pace * 360) * Math.PI / 180;
    const r0 = r - stroke / 2 - 2, r1 = r + stroke / 2 + 2;
    tick = { x1: cx + r0 * Math.cos(a), y1: cy + r0 * Math.sin(a), x2: cx + r1 * Math.cos(a), y2: cy + r1 * Math.sin(a) };
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: `rotate(${startAt + 90}deg)`, transformOrigin: 'center', filter: glow ? `drop-shadow(0 0 6px ${color}66)` : 'none' }}>
        {gradient && (
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        )}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={gradient ? `url(#${gid})` : color}
          strokeWidth={stroke} strokeLinecap={rounded ? 'round' : 'butt'}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - v)}
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      {tick && (
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
          <line x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} stroke={paceColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', lineHeight: 1.05 }}>{children}</div>
    </div>
  );
}
