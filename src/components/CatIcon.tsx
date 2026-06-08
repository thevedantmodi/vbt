const ICON_PATHS: Record<string, string> = {
  rent:      'M4 11.5 12 5l8 6.5M6 10v9h12v-9M10 19v-5h4v5',
  savings:   'M5 13a6 4.5 0 1 0 12 0 6 4.5 0 1 0-12 0M17 11.5c1.6.3 2.8 1.1 2.8 2.2 0 .8-.7 1.5-1.6 1.9M8 9.2C8.4 7.5 10 6.4 12 6.4c.8 0 1.5.2 2.1.5M6.5 16.8 6 19M15 16.8 15.5 19M9 9.6V9',
  groceries: 'M4 5h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h7a1.5 1.5 0 0 0 1.5-1.2L20 8H7M10 20.5h.01M17 20.5h.01',
  food:      'M6 3v8m0-8v8m0 0v8M6 11c1.5 0 2-1 2-3V3m10 0c-2 0-3 2-3 5 0 2 1 2.5 2 2.5h1V3m0 8.5V21',
  drink:     'M6 4h12l-1.5 7a4.5 4.5 0 0 1-9 0L6 4M12 15.5V20M9 20h6',
  transit:   'M6 16.5V8c0-2 1.5-3 6-3s6 1 6 3v8.5M6 12h12M8.5 19v1.5M15.5 19v1.5M8 16h.01M16 16h.01M6 19h12',
  subs:      'M5 12a7 7 0 0 1 11.5-5.4L19 8M19 4v4h-4M19 12a7 7 0 0 1-11.5 5.4L5 16M5 20v-4h4',
  personal:  'M12 21s-7-4.3-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 4.5C19 16.7 12 21 12 21Z',
  fitness:   'M5 9v6M19 9v6M3 11v2M21 11v2M7 8.5v7M17 8.5v7M7 12h10',
  travel:    'M10.5 3.5c.8-.8 1.7-.6 1.9.4l1 4.3 5.2 2.4c1 .5.9 1.6-.1 1.9l-4.4 1.2-.7 4.6c-.2 1-1.2 1.2-1.7.3l-1.9-3.6-3.7.9c-.9.2-1.5-.6-1-1.4l1.9-3-2.2-2.6c-.6-.7 0-1.6.9-1.4l3.6.7 1.9-5.1Z',
  other:     'M12 8v4m0 4h.01M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0',
};

interface Props {
  id: string;
  size?: number;
  stroke?: number;
  color?: string;
}

export default function CatIcon({ id, size = 20, stroke = 1.8, color = 'currentColor' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={ICON_PATHS[id] || ICON_PATHS.other} />
    </svg>
  );
}
