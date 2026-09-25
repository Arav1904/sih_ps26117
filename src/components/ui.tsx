/* ---------------------------------------------------------------
   UI primitives.

   Every screen is built from these. If a screen needs a one-off
   style, the primitive gets a variant — it does not get a bespoke
   div with inline colours. That rule is what keeps the product
   looking like one product.
   --------------------------------------------------------------- */
import {
  useEffect, useRef, useState,
  type ButtonHTMLAttributes, type CSSProperties, type ReactNode,
} from 'react';
import { Check, Close, Folder } from './icons';

export { Shield } from './icons';

/* ------------------------------ panel ---------------------------- */

export function Panel({
  title, note, children, action, id, variant, foot,
}: {
  title?: ReactNode; note?: ReactNode; children: ReactNode; action?: ReactNode;
  id?: string; variant?: 'plain' | 'quiet' | 'sunken' | 'dark'; foot?: ReactNode;
}) {
  const cls = ['panel', variant && variant !== 'plain' ? variant : ''].filter(Boolean).join(' ');
  return (
    <section className={cls} id={id}>
      {title || action ? (
        <div className="panel-head">
          {title ? <h2 className="panel-title">{title}</h2> : null}
          {action ? <div className="panel-action">{action}</div> : null}
        </div>
      ) : null}
      {note ? <p className="panel-note">{note}</p> : null}
      {children}
      {foot ? <div className="panel-foot">{foot}</div> : null}
    </section>
  );
}

/* --------------------------- section head ------------------------ */

export function SectionHead({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="section-head">
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </header>
  );
}

/* ------------------------------ button --------------------------- */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'outline' | 'solid' | 'ghost' | 'dark' | 'onblack';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
};

export function Button({ variant = 'outline', size = 'md', block, className, children, ...rest }: BtnProps) {
  const cls = [
    'btn',
    variant === 'outline' ? '' : variant,
    size === 'md' ? '' : size,
    block ? 'block' : '',
    className ?? '',
  ].filter(Boolean).join(' ');
  return <button type="button" className={cls} {...rest}>{children}</button>;
}

/* ------------------------------- stat ---------------------------- */

export function Stat({ value, label, accent, boxed }: { value: ReactNode; label: ReactNode; accent?: boolean; boxed?: boolean }) {
  return (
    <div className={boxed ? 'stat boxed' : 'stat'}>
      <div className={accent ? 'v accent' : 'v'}>{value}</div>
      <div className="k">{label}</div>
    </div>
  );
}

/* -------------------------------- row ---------------------------- */

export function Row({
  n, label, sub, value, children, onClick, selected, ariaLabel,
}: {
  n?: string; label?: ReactNode; sub?: ReactNode; value?: ReactNode; children?: ReactNode;
  onClick?: () => void; selected?: boolean; ariaLabel?: string;
}) {
  const inner = (
    <>
      {n ? <span className="n">{n}</span> : null}
      <span className="lab">
        {label}
        {sub ? <span className="sub">{sub}</span> : null}
        {children}
      </span>
      {value !== undefined ? <span className="val">{value}</span> : null}
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        className={selected ? 'row button-like on' : 'row button-like'}
        onClick={onClick}
        aria-pressed={selected ?? undefined}
        aria-label={ariaLabel}
      >
        {inner}
      </button>
    );
  }
  return <div className="row">{inner}</div>;
}

/* ------------------------------ badge ---------------------------- */

export function Badge({
  children, tone = 'plain', className, style,
}: { children: ReactNode; tone?: 'plain' | 'solid' | 'accent' | 'ok' | 'hold' | 'purple' | 'onblack'; className?: string; style?: CSSProperties }) {
  return <span className={['badge', tone, className].filter(Boolean).join(' ')} style={style}>{children}</span>;
}

export function Dot({ tone = 'idle', live }: { tone?: 'idle' | 'ok' | 'accent' | 'purple'; live?: boolean }) {
  const cls = ['dot', tone === 'idle' ? '' : tone, live ? 'live' : ''].filter(Boolean).join(' ');
  return <i className={cls} aria-hidden="true" />;
}

/* --------------------------- confidence -------------------------- */

/** A score never travels without its status word. */
export function Conf({ value, threshold = 0.85, plain }: { value: number; threshold?: number; plain?: boolean }) {
  const held = value < threshold;
  return (
    <span className={held ? 'conf held' : 'conf released'}>
      <b>{value.toFixed(2)}</b>
      {plain ? null : held ? ' · held' : ' · released'}
    </span>
  );
}

/* ---------------------------- disclosure ------------------------- */

/** Level 3 of the information model. Nothing technical sits on the
 *  primary surface; it lives one click down, always labelled. */
export function Disclosure({ summary, children, id }: { summary: string; children: ReactNode; id?: string }) {
  return (
    <details className="disclosure" id={id}>
      <summary>{summary}</summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}

/* ---------------------------- empty state ------------------------ */

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-mark"><Folder size={22} /></span>
      <h4>{title}</h4>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}

/* ------------------------------ meter ---------------------------- */

export function Meter({ value, label, thick }: { value: number; label?: string; thick?: boolean }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div
      className={thick ? 'meter thick' : 'meter'}
      role="progressbar"
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'progress'}
    >
      <i style={{ width: `${pct * 100}%` }} />
    </div>
  );
}

/* ----------------------------- callout --------------------------- */

export function Callout({
  title, children, tone = 'accent', icon,
}: { title?: string; children: ReactNode; tone?: 'accent' | 'neutral' | 'ok' | 'purple'; icon?: ReactNode }) {
  return (
    <div className={tone === 'accent' ? 'callout' : `callout ${tone}`}>
      {icon ? <span aria-hidden="true" style={{ marginTop: 2 }}>{icon}</span> : null}
      <div style={{ minWidth: 0 }}>
        {title ? <h4>{title}</h4> : null}
        <p>{children}</p>
      </div>
    </div>
  );
}

/* ------------------------- simulation label ---------------------- */

/** Used wherever a figure is deterministic demonstration logic rather
 *  than live inference. Subtle, consistent, never apologetic. */
export function SimNote({ children = 'Demo simulation' }: { children?: ReactNode }) {
  return (
    <span className="sim-note" title="Deterministic demonstration logic — not live model inference">
      <i className="dot" aria-hidden="true" />
      {children}
    </span>
  );
}

/* ------------------------------ tabs ----------------------------- */

export function Tabs<T extends string>({
  tabs, value, onChange, label,
}: { tabs: { key: T; label: string }[]; value: T; onChange: (k: T) => void; label: string }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          className="tab"
          aria-selected={value === t.key}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------- modal ----------------------------- */

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-veil" onClick={onClose} role="presentation">
      <div
        className="modal" role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()} ref={ref} tabIndex={-1}
      >
        <div className="modal-head">
          <h2 className="panel-title" style={{ fontSize: 19 }}>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <Close size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ----------------------------- toasts ---------------------------- */

export interface ToastMsg { id: number; title: string; detail?: string }

let toastSeq = 0;
const toastListeners = new Set<(t: ToastMsg[]) => void>();
let toasts: ToastMsg[] = [];

export function toast(title: string, detail?: string): void {
  const t: ToastMsg = { id: ++toastSeq, title, detail };
  toasts = [...toasts, t];
  toastListeners.forEach((f) => f(toasts));
  window.setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id);
    toastListeners.forEach((f) => f(toasts));
  }, 4200);
}

export function ToastTray() {
  const [list, setList] = useState<ToastMsg[]>(toasts);
  useEffect(() => {
    toastListeners.add(setList);
    return () => { toastListeners.delete(setList); };
  }, []);
  if (!list.length) return null;
  return (
    <div className="toast-tray" role="status" aria-live="polite">
      {list.map((t) => (
        <div className="toast" key={t.id}>
          <Check size={16} />
          <div style={{ minWidth: 0 }}>
            <div className="t">{t.title}</div>
            {t.detail ? <div className="d">{t.detail}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------- animated count ---------------------- */

/** Counts up to `to` once, unless the visitor asked for reduced motion. */
export function CountUp({ to, decimals = 0, duration = 900 }: { to: number; decimals?: number; duration?: number }) {
  const [n, setN] = useState(to);
  const prev = useRef(to);

  useEffect(() => {
    const reduce = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const from = prev.current;
    prev.current = to;
    if (reduce || from === to || typeof requestAnimationFrame !== 'function') { setN(to); return; }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return <>{n.toFixed(decimals)}</>;
}
