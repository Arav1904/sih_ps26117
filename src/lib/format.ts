export const clock = (ms: number): string => new Date(ms).toTimeString().slice(0, 8);

export const seconds = (ms: number): string => (ms / 1000).toFixed(1) + 's';

export const inr = (n: number): string => '\u20B9' + n.toLocaleString('en-IN');

export const pct = (n: number): string => Math.round(n * 100) + '%';

export const seq = (n: number): string => String(n).padStart(4, '0');
