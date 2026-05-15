// HomeOfficeLife · Shared primitives
// ----------------------------------
// Recreations (visual only) of Button / Card / Badge / Pill / Logo from
// the production app's shadcn-style components. Loaded BEFORE feature files
// and exported to window so other Babel scripts can pick them up.

/* eslint-disable */
const { useState, useEffect, useRef } = React;

// ---------- Logo ----------
const Logo = ({ size = 28, variant = "full", tone = "brand" }) => {
  const primary = tone === "white" ? "#FFFFFF" : "#0E3D3F";
  const accent  = tone === "white" ? "#FFFFFF" : "#F36458";
  const width = variant === "full" ? size * 4.6 : size;
  return (
    <svg width={width} height={size}
         viewBox={variant === "full" ? "0 0 184 40" : "0 0 40 40"}
         fill="none" role="img" aria-label="homeoffice.life">
      <path d="M9 7v25h5.5V21c0-3 1.8-5 4.5-5s4.5 2 4.5 5v11H29V20c0-5.5-3.6-9.2-8.8-9.2-2.4 0-4.5.9-5.7 2.4V7H9z" fill={primary}/>
      <path d="M32 4.5l1.1 3.4 3.4 1.1-3.4 1.1L32 13.5l-1.1-3.4-3.4-1.1 3.4-1.1L32 4.5z" fill={accent}/>
      {variant === "full" && (
        <text x="50" y="28" fontFamily='"Space Grotesk", system-ui, sans-serif'
              fontWeight="700" fontSize="20" fill={primary} letterSpacing="-0.02em">
          homeoffice<tspan fontWeight="500">life</tspan>
        </text>
      )}
    </svg>
  );
};

// ---------- Button ----------
const Button = ({ variant = "default", size = "default", className = "", children, ...rest }) => {
  const variants = {
    default:     "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
    hero:        "text-white bg-[image:var(--gradient-hero)] shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] hover:scale-[1.02]",
    coral:       "bg-[var(--brand-coral-500)] text-white shadow-[var(--shadow-coral)] hover:scale-105",
    secondary:   "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-90",
    outline:     "bg-[var(--card)] text-[var(--foreground)] border-2 border-[var(--border)] hover:border-[var(--brand-teal-500)]",
    ghost:       "bg-transparent text-[var(--foreground)] hover:bg-[var(--secondary)]",
    destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90",
    link:        "bg-transparent text-[var(--primary)] underline underline-offset-4 hover:opacity-80 px-0",
  };
  const sizes = {
    sm:      "h-8 px-3 text-xs",
    default: "h-9 px-4 text-sm",
    lg:      "h-12 px-7 text-[15px] font-bold rounded-[12px]",
    xl:      "h-14 px-8 text-[16px] font-bold rounded-[12px]",
    icon:    "h-9 w-9 p-0",
  };
  return (
    <button
      className={
        "inline-flex items-center justify-center gap-2 whitespace-nowrap " +
        "rounded-[10px] font-medium transition-all duration-300 " +
        "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)] " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] " +
        "focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none " +
        variants[variant] + " " + sizes[size] + " " + className
      }
      {...rest}
    >
      {children}
    </button>
  );
};

// ---------- Card ----------
const Card = ({ className = "", hover = false, children, ...rest }) => (
  <div
    className={
      "rounded-3xl border border-[var(--border)] bg-[var(--card)] " +
      "shadow-[var(--shadow-soft)] transition-all duration-300 " +
      "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)] " +
      (hover ? "hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)] cursor-pointer " : "") +
      className
    }
    {...rest}
  >
    {children}
  </div>
);

// ---------- Badge / Pill ----------
const Pill = ({ tone = "muted", className = "", children, ...rest }) => {
  const tones = {
    muted:   "bg-white/90 backdrop-blur text-[var(--foreground)] border border-[var(--border)]",
    eyebrow: "bg-[color:oklch(0.42_0.07_195/.12)] text-[var(--primary)] border border-[color:oklch(0.42_0.07_195/.3)] uppercase tracking-wider",
    accent:  "bg-[color:oklch(0.72_0.15_45/.18)] text-[var(--accent-foreground)] uppercase tracking-wider",
    coral:   "bg-[var(--brand-coral-500)] text-white",
    wood:    "bg-[color:oklch(0.62_0.09_55/.15)] text-[color:oklch(0.45_0.08_55)] uppercase tracking-wider",
    overlay: "bg-[var(--brand-ink-900)]/90 text-white backdrop-blur",
    glass:   "bg-white/95 text-[var(--brand-ink-900)] backdrop-blur shadow-[var(--shadow-soft)]",
    primary: "bg-[var(--primary)] text-[var(--primary-foreground)]",
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold " +
        tones[tone] + " " + className
      }
      {...rest}
    >
      {children}
    </span>
  );
};

// ---------- Watermark overlay ----------
const Watermark = () => (
  <div className="absolute bottom-2 left-2 z-10 pointer-events-none select-none rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/80 mix-blend-difference"
       style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
       aria-hidden="true">
    homeofficelife.com.br
  </div>
);

// ---------- Icon (inline Lucide-style stroke svgs) ----------
const ico = (d, opts = {}) => (props) => {
  const { size = 16, className = "", ...rest } = props || {};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         className={className} {...opts} {...rest}>
      {d}
    </svg>
  );
};
const Icon = {
  Upload:     ico(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>),
  Zap:        ico(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>),
  Star:       ico(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>, { fill: "currentColor" }),
  StarOutline:ico(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>),
  Search:     ico(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>),
  Shopping:   ico(<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>),
  Heart:      ico(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>),
  Bookmark:   ico(<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>),
  Plus:       ico(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>),
  X:          ico(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>),
  ArrowRight: ico(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>),
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
  ArrowLeftRight: ico(<><polyline points="17 11 21 7 17 3"/><line x1="21" y1="7" x2="9" y2="7"/><polyline points="7 21 3 17 7 13"/><line x1="15" y1="17" x2="3" y2="17"/></>),
  Menu:       ico(<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>),
  User:       ico(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>),
};

Object.assign(window, { Logo, Button, Card, Pill, Watermark, Icon });
