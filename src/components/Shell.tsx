/* ---------------------------------------------------------------
   The shell.

   One navbar and one footer for the entire product. Signed out it
   carries marketing navigation; signed in it carries product
   navigation. It is the same bar either way — same black, same
   brand, same burgundy spine — so moving from the landing page into
   the workbench never feels like moving to a different website.
   --------------------------------------------------------------- */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, Close, ArrowRight } from './icons';
import { APP_NAV, PRIMARY_APP_NAV, PUBLIC_NAV, GROUP_LABEL, type NavItem } from '../config/nav';
import { useAuth } from '../state/useAuth';
import { auth, ROLE_LABEL } from '../services/auth';
import { useEgress } from '../state/useEgress';
import { store } from '../state/store';
import { ToastTray } from './ui';

function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="brand" aria-label="KAVACH home">
      <span className="spine" aria-hidden="true" />
      <Shield size={17} color="#fff" />
      KAVACH
    </Link>
  );
}

function UserMenu() {
  const user = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!user) {
    return (
      <>
        <Link to="/login" className="btn onblack sm">Sign in</Link>
        <Link to="/login" className="btn solid sm">Open Workbench</Link>
      </>
    );
  }

  const initials = user.name.split(/[\s.]+/).filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="usermenu" ref={ref}>
      <button
        type="button" className="usermenu-btn" onClick={() => setOpen((v) => !v)}
        aria-expanded={open} aria-haspopup="menu"
      >
        <span className="avatar" aria-hidden="true">{initials}</span>
        <span className="who-name">{user.name}</span>
      </button>
      {open ? (
        <div className="usermenu-pop" role="menu">
          <div className="who">
            <b>{user.name}</b>
            <span>{user.email}</span>
            <span>{ROLE_LABEL[user.role]} · demonstration account</span>
          </div>
          <Link to="/app/system" role="menuitem" onClick={() => setOpen(false)}>Node and models</Link>
          <Link to="/app/audit" role="menuitem" onClick={() => setOpen(false)}>Audit ledger</Link>
          <button
            type="button" role="menuitem"
            onClick={() => { setOpen(false); store.reset(); auth.logout(); navigate('/'); }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Drawer({ onClose, items }: { onClose: () => void; items: NavItem[] }) {
  const user = useAuth();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const groups: NavItem['group'][] = ['work', 'evidence', 'system'];

  return (
    <>
      <div className="drawer-veil" onClick={onClose} role="presentation" />
      <nav className="drawer" aria-label="Main menu" ref={ref} tabIndex={-1}>
        <div className="drawer-head">
          <Brand to={user ? '/app' : '/'} />
          <button type="button" className="burger" onClick={onClose} aria-label="Close menu"><Close size={20} /></button>
        </div>

        {user ? (
          groups.map((g) => {
            const list = items.filter((i) => i.group === g);
            if (!list.length) return null;
            return (
              <div key={g}>
                <div className="drawer-sec">{GROUP_LABEL[g]}</div>
                {list.map((i) => (
                  <NavLink key={i.to} to={i.to} end={i.end} onClick={onClose} className={({ isActive }) => (isActive ? 'on' : '')}>
                    {i.label}
                    <span style={{ display: 'block', fontSize: 12, color: '#7E7874', marginTop: 2 }}>{i.blurb}</span>
                  </NavLink>
                ))}
              </div>
            );
          })
        ) : (
          <>
            <div className="drawer-sec">KAVACH</div>
            {PUBLIC_NAV.map((n) => (
              <NavLink key={n.to} to={n.to} onClick={onClose} className={({ isActive }) => (isActive ? 'on' : '')}>{n.label}</NavLink>
            ))}
            <NavLink to="/login" onClick={onClose} className={({ isActive }) => (isActive ? 'on' : '')}>Sign in</NavLink>
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          {user ? (
            <button
              type="button" className="drawer-link"
              onClick={() => { onClose(); store.reset(); auth.logout(); navigate('/'); }}
            >
              Sign out
            </button>
          ) : (
            <Link to="/login" className="btn solid block" onClick={onClose}>Open Workbench <ArrowRight size={15} /></Link>
          )}
        </div>
      </nav>
    </>
  );
}

export function TopBar() {
  const user = useAuth();
  const blocked = useEgress();
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setDrawer(false); }, [pathname]);

  const primary = APP_NAV.filter((i) => PRIMARY_APP_NAV.includes(i.to));

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Brand to={user ? '/app' : '/'} />

        <nav className="topnav" aria-label={user ? 'Workbench' : 'KAVACH'}>
          {user
            ? primary.map((i) => (
                <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => (isActive ? 'on' : '')}>
                  {i.label}
                </NavLink>
              ))
            : PUBLIC_NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'on' : '')}>{n.label}</NavLink>
              ))}
          {user ? <NavLink to="/app/work" className={({ isActive }) => (isActive ? 'on' : '')}>More</NavLink> : null}
        </nav>

        <div className="topbar-end">
          <span className="node-chip" title="No external call has been permitted in this session">
            <i className="dot ok live" aria-hidden="true" />
            LOCAL ONLY · {blocked.length} refused
          </span>
          <UserMenu />
          <button type="button" className="burger" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}>
            <Menu size={20} />
          </button>
        </div>
      </div>
      {drawer ? <Drawer onClose={() => setDrawer(false)} items={APP_NAV} /> : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="foot-top">
        <div>
          <div className="brand foot-brand"><span className="spine" aria-hidden="true" /><Shield size={17} color="#fff" />KAVACH</div>
          <p className="foot-desc">
            Sovereign On-Premise Agentic AI Workbench. Private AI for confidential industrial work —
            it reads your files, does the job, checks its own answer and keeps every byte on your own machine.
          </p>
          <div className="foot-meta">
            Smart India Hackathon 2026 · PS26117<br />
            Mangalore Refinery and Petrochemicals Limited · Theme: Smart Automation<br />
            Team TokenGods
          </div>
        </div>
        <div>
          <h5>Product</h5>
          <Link to="/app">Workbench</Link>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/capabilities">Capabilities</Link>
          <Link to="/security">Security</Link>
        </div>
        <div>
          <h5>Demo</h5>
          <Link to="/login">Sign in</Link>
          <Link to="/app/run">Agent run</Link>
          <Link to="/app/sovereignty">Data boundary</Link>
          <Link to="/app/audit">Audit ledger</Link>
        </div>
        <div>
          <h5>The node</h5>
          <Link to="/app/system">Models and mode</Link>
          <Link to="/app/routing">Model routing</Link>
          <Link to="/app/sandbox">Sandbox</Link>
          <Link to="/app/night">Night Ops</Link>
        </div>
      </div>
      <div className="foot-bottom">
        <span>Prototype demonstration — data shown is fictional. No MRPL document, drawing, tag or rate is used.</span>
        <span>Runs fully offline · no CDN · no telemetry · no cloud AI</span>
      </div>
    </footer>
  );
}

/** The frame every route renders inside. */
export function Shell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return (
    <div className="app-root">
      <a className="skip-link" href="#main">Skip to content</a>
      <TopBar />
      <main className="page" id="main">{children}</main>
      {footer ? <SiteFooter /> : null}
      <ToastTray />
    </div>
  );
}
