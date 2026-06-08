import type { CSSProperties } from 'react';

export interface ThemeTokens {
  dark: boolean;
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  faint: string;
  hair: string;
  track: string;
  accent: string;
  scrim: string;
}

export function tokens(dark: boolean, accent: string): ThemeTokens {
  return dark
    ? { dark: true,  bg: '#0E0F11', surface: '#191A1D', surface2: '#212328', text: '#F4F4F5', muted: 'rgba(244,244,245,0.56)', faint: 'rgba(244,244,245,0.34)', hair: 'rgba(255,255,255,0.10)', track: 'rgba(255,255,255,0.12)', accent, scrim: 'rgba(0,0,0,0.62)' }
    : { dark: false, bg: '#F4F2EC', surface: '#FFFFFF',  surface2: '#FBFAF7', text: '#16171A', muted: 'rgba(22,23,26,0.56)',   faint: 'rgba(22,23,26,0.36)',   hair: 'rgba(0,0,0,0.08)',      track: 'rgba(0,0,0,0.08)',      accent, scrim: 'rgba(20,18,14,0.34)' };
}

export const NUM: CSSProperties = { fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' };
