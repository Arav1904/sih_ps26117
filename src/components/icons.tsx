/* ---------------------------------------------------------------
   Icons.

   Hand-drawn 24×24 strokes. No icon package: an air-gapped build
   should not carry 400 glyphs to use fourteen of them.
   Every icon takes the ink colour of the surface it sits on.
   --------------------------------------------------------------- */
import type { ReactNode, SVGProps } from 'react';

type P = { size?: number } & SVGProps<SVGSVGElement>;

function Base({ size = 18, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" {...rest}
    >
      {children}
    </svg>
  );
}

export const Shield = ({ size = 18, color, ...r }: P & { color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color ?? 'currentColor'}
    strokeWidth={1.8} strokeLinejoin="round" aria-hidden="true" focusable="false" {...r}>
    <path d="M12 2 L20 5 V11 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 11 V5 Z" />
  </svg>
);

export const Check = (p: P) => <Base {...p}><path d="M4 12.5 9 17.5 20 6.5" /></Base>;
export const ArrowRight = (p: P) => <Base {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Base>;
export const ArrowDown = (p: P) => <Base {...p}><path d="M12 4v15M6 13l6 6 6-6" /></Base>;
export const Close = (p: P) => <Base {...p}><path d="M6 6l12 12M18 6L6 18" /></Base>;
export const Menu = (p: P) => <Base {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Base>;
export const Doc = (p: P) => <Base {...p}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 13h6M9 17h4" /></Base>;
export const Image = (p: P) => <Base {...p}><rect x="3" y="5" width="18" height="14" rx="1.5" /><circle cx="8.5" cy="10" r="1.6" /><path d="M21 16l-5-5-6 8" /></Base>;
export const Code = (p: P) => <Base {...p}><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" /></Base>;
export const Search = (p: P) => <Base {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></Base>;
export const Brain = (p: P) => <Base {...p}><path d="M12 5.5a3 3 0 0 0-5.8-1A2.8 2.8 0 0 0 4 7.2a2.9 2.9 0 0 0 .7 1.9A3 3 0 0 0 6.4 14 3 3 0 0 0 12 15.5z" /><path d="M12 5.5a3 3 0 0 1 5.8-1A2.8 2.8 0 0 1 20 7.2a2.9 2.9 0 0 1-.7 1.9A3 3 0 0 1 17.6 14 3 3 0 0 1 12 15.5z" /><path d="M12 15.5V20" /></Base>;
export const Lock = (p: P) => <Base {...p}><rect x="4.5" y="10" width="15" height="10" rx="1.6" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Base>;
export const Ledger = (p: P) => <Base {...p}><path d="M5 4h13a1 1 0 0 1 1 1v15H6a1 1 0 0 1-1-1z" /><path d="M5 4v16" /><path d="M9 9h7M9 13h7M9 17h4" /></Base>;
export const Moon = (p: P) => <Base {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4 8.2 8.2 0 1 0 20 14.5z" /></Base>;
export const Cpu = (p: P) => <Base {...p}><rect x="7" y="7" width="10" height="10" rx="1.2" /><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M10 3.5v-1M14 3.5v-1M10 22.5v-1M14 22.5v-1M3.5 10h-1M3.5 14h-1M22.5 10h-1M22.5 14h-1" /></Base>;
export const Globe = (p: P) => <Base {...p}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.4 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.4-3.6-8.5S9.6 5.9 12 3.5z" /></Base>;
export const Ban = (p: P) => <Base {...p}><circle cx="12" cy="12" r="8.5" /><path d="M6 18 18 6" /></Base>;
export const Home = (p: P) => <Base {...p}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></Base>;
export const Bolt = (p: P) => <Base {...p}><path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12z" /></Base>;
export const Download = (p: P) => <Base {...p}><path d="M12 4v11M7.5 11 12 15.5 16.5 11" /><path d="M4.5 19.5h15" /></Base>;
export const Alert = (p: P) => <Base {...p}><path d="M12 4.5 21 19.5H3z" /><path d="M12 10v4.5M12 17.4v.2" /></Base>;
export const Eye = (p: P) => <Base {...p}><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" /><circle cx="12" cy="12" r="2.6" /></Base>;
export const Play = (p: P) => <Base {...p}><path d="M7 4.5 19 12 7 19.5z" /></Base>;
export const Sparkle = (p: P) => <Base {...p}><path d="M12 3.5 13.9 9 19.5 11 13.9 13 12 18.5 10.1 13 4.5 11 10.1 9z" /></Base>;
export const Folder = (p: P) => <Base {...p}><path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h7a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" /></Base>;
export const Refresh = (p: P) => <Base {...p}><path d="M20 12a8 8 0 1 1-2.5-5.8" /><path d="M20 4v5h-5" /></Base>;
export const Terminal = (p: P) => <Base {...p}><rect x="3" y="4.5" width="18" height="15" rx="1.6" /><path d="M7.5 10 10.5 12.6 7.5 15.2M13 15.5h4" /></Base>;

export const TOOL_ICONS: Record<string, (p: P) => ReactNode> = {
  'file.read': Doc,
  'file.write': Download,
  planner: Brain,
  router: Cpu,
  'ocr.surya': Eye,
  'vision.qwen-vl': Image,
  extract: Sparkle,
  'rag.qdrant': Search,
  'reason.llama': Brain,
  'reason.qwen-coder': Code,
  'sheet.calc': Ledger,
  verify: Check,
  'sandbox.exec': Terminal,
  'code.edit': Code,
};
