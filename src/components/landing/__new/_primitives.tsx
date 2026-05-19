// HomeOfficeLife · Shared primitives
/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react'

// ---------- Navigation Context ----------
export interface NavContextValue {
  page: string;
  go: (id: string) => void;
  scrollTo: (id: string) => void;
}
export const NavContext = createContext<NavContextValue>({ page: "home", go: () => {}, scrollTo: () => {} });
export const useNav = () => useContext(NavContext);

// ---------- Logo ----------
export interface LogoProps {
  size?: number;
  variant?: "full" | "icon";
  tone?: "brand" | "white";
}
export const Logo = ({ size = 28, variant = "full", tone = "brand" }: LogoProps) => {
  const inkColor   = tone === "white" ? "#FFFFFF" : "#0F1F22";
  const mutedColor = tone === "white" ? "rgba(255,255,255,0.55)" : "#54676B";
  const totalW = variant === "full" ? size + size * 3.6 : size;
  return (
    <svg width={totalW} height={size} viewBox={variant === "full" ? `0 0 ${40 + 40 * 3.6} 40` : "0 0 40 40"} fill="none" role="img" aria-label="Office Planner">
      {/* Squircle */}
      <rect width="40" height="40" rx="9" fill="#1E3A5F"/>
      {/* Porta: frame */}
      <rect x="9" y="8" width="17" height="24" rx="1.5" stroke="white" strokeWidth="1.8" fill="none"/>
      {/* Painel azul */}
      <rect x="20" y="8" width="6" height="24" rx="1" fill="#93C5FD" opacity="0.90"/>
      {/* Divisória */}
      <line x1="20" y1="8" x2="20" y2="32" stroke="white" strokeWidth="1.4"/>
      {/* Maçaneta azul */}
      <circle cx="17.2" cy="20.5" r="1.4" fill="#60A5FA"/>
      {variant === "full" && (
        <text x="48" y="26.5" fontFamily='"Space Grotesk", system-ui, sans-serif' fontSize="18" letterSpacing="-0.025em" fill={inkColor}>
          <tspan fontWeight="700">Office</tspan>
          <tspan fontWeight="500" fill={mutedColor}> Planner</tspan>
        </text>
      )}
    </svg>
  );
};

// ---------- Button ----------
const btnVariants: Record<string, string> = {
  default:     "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
  hero:        "text-white bg-[image:var(--gradient-hero)] shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] hover:scale-[1.02]",
  coral:       "bg-[var(--brand-coral-500)] text-white shadow-[var(--shadow-coral)] hover:scale-105",
  secondary:   "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-90",
  outline:     "bg-[var(--card)] text-[var(--foreground)] border-2 border-[var(--border)] hover:border-[var(--brand-teal-500)]",
  ghost:       "bg-transparent text-[var(--foreground)] hover:bg-[var(--secondary)]",
  destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90",
  link:        "bg-transparent text-[var(--primary)] underline underline-offset-4 hover:opacity-80 px-0",
};
const btnSizes: Record<string, string> = {
  sm:      "h-8 px-3 text-xs",
  default: "h-9 px-4 text-sm",
  lg:      "h-12 px-7 text-[15px] font-bold rounded-[12px]",
  xl:      "h-14 px-8 text-[16px] font-bold rounded-[12px]",
  icon:    "h-9 w-9 p-0",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof btnVariants;
  size?: keyof typeof btnSizes;
  className?: string;
  children?: React.ReactNode;
}
export const Button = ({ variant = "default", size = "default", className = "", children, ...rest }: ButtonProps) => (
  <button className={
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none " +
    (btnVariants[variant] || btnVariants.default) + " " + (btnSizes[size] || btnSizes.default) + " " + className
  } {...rest}>{children}</button>
);

// ---------- Card ----------
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  hover?: boolean;
  children?: React.ReactNode;
}
export const Card = ({ className = "", hover = false, children, ...rest }: CardProps) => (
  <div className={
    "rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] " +
    (hover ? "hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)] cursor-pointer group " : "") + className
  } {...rest}>{children}</div>
);

// ---------- Pill ----------
const pillTones: Record<string, string> = {
  muted:   "bg-white/90 backdrop-blur text-[var(--foreground)] border border-[var(--border)]",
  eyebrow: "bg-[color:oklch(0.42_0.07_195/.12)] text-[var(--primary)] border border-[color:oklch(0.42_0.07_195/.3)] uppercase tracking-wider",
  accent:  "bg-[color:oklch(0.72_0.15_45/.18)] text-[var(--accent-foreground)] uppercase tracking-wider",
  coral:   "bg-[var(--brand-coral-500)] text-white",
  wood:    "bg-[color:oklch(0.62_0.09_55/.15)] text-[color:oklch(0.45_0.08_55)] uppercase tracking-wider",
  overlay: "bg-[var(--brand-ink-900)]/90 text-white backdrop-blur",
  glass:   "bg-white/95 text-[var(--brand-ink-900)] backdrop-blur shadow-[var(--shadow-soft)]",
  primary: "bg-[var(--primary)] text-[var(--primary-foreground)]",
};

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof pillTones;
  className?: string;
  children?: React.ReactNode;
}
export const Pill = ({ tone = "muted", className = "", children, ...rest }: PillProps) => (
  <span className={"inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold " + (pillTones[tone] || pillTones.muted) + " " + className} {...rest}>{children}</span>
);

// ---------- Watermark ----------
export const Watermark = () => (
  <div className="absolute bottom-2 left-2 z-10 pointer-events-none select-none rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/80 mix-blend-difference" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }} aria-hidden="true">
    homeofficelife.com.br
  </div>
);

// ---------- Icons ----------
export type IconProps = { size?: number; className?: string; style?: React.CSSProperties; [key: string]: any };

const ico = (d: React.ReactNode, opts: Record<string, any> = {}): React.FC<IconProps> => (props) => {
  const { size = 16, className = "", style: s, ...rest } = props || {};
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} {...opts} {...rest}>{d}</svg>);
};

export const I: Record<string, React.FC<IconProps>> = {
  Upload:     ico(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>),
  Zap:        ico(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>),
  Star:       ico(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>, { fill: "currentColor" }),
  Search:     ico(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>),
  Shopping:   ico(<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>),
  Heart:      ico(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>),
  Bookmark:   ico(<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>),
  Plus:       ico(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>),
  X:          ico(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>),
  ArrowRight: ico(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>),
  ArrowLeft:  ico(<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>),
  MapPin:     ico(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>),
  Crown:      ico(<><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></>),
  Flame:      ico(<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>),
  Sparkles:   ico(<><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></>),
  Image:      ico(<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.5-3.5L11 18l-5-5L3 16"/></>),
  Camera:     ico(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>),
  Send:       ico(<><path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></>),
  Check:      ico(<polyline points="20 6 9 17 4 12"/>),
  Wallet:     ico(<><path d="M19 7h-7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h7v-2h-5v-6h5z"/><path d="M3 5a2 2 0 0 1 2-2h13a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a2 2 0 0 1-2-2z"/></>),
  Recycle:    ico(<><path d="M7 19H4a1 1 0 0 1-.86-1.51L4.7 14"/><path d="M14 16l-3 3 3 3"/><path d="M11 19h8a1 1 0 0 0 .86-1.51L18.3 14"/><path d="m21 12-2 7H14"/><path d="M3 12 6 6h7"/></>),
  Menu:       ico(<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>),
  User:       ico(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>),
  Home:       ico(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>),
  Grid:       ico(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>),
  Eye:        ico(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>),
  ChevronLeft: ico(<polyline points="15 18 9 12 15 6"/>),
  ChevronRight: ico(<polyline points="9 6 15 12 9 18"/>),
  Users:      ico(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  Package:    ico(<><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>),
  Shield:     ico(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>),
  ArrowLeftRight: ico(<><polyline points="17 11 21 7 17 3"/><line x1="21" y1="7" x2="9" y2="7"/><polyline points="7 21 3 17 7 13"/><line x1="15" y1="17" x2="3" y2="17"/></>),
};

// ---------- Toast ----------
export interface ToastContextValue {
  show: (text: string, duration?: number) => void;
}
export const ToastContext = createContext<ToastContextValue>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

export interface ToastProviderProps {
  children: React.ReactNode;
}
export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string, duration = 3000) => {
    setMsg(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), duration);
  }, []);
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {msg && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, background: "var(--foreground)", color: "var(--background)",
          padding: "10px 24px", borderRadius: 9999, fontSize: 14, fontWeight: 600,
          fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-elegant)",
          animation: "fadeUp 0.3s ease",
        }}>{msg}</div>
      )}
    </ToastContext.Provider>
  );
};
