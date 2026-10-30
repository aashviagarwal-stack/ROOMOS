import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Glyph, Ico } from "./icons.jsx";
import { useStore } from "./store.jsx";
import { ROOM_PHOTO } from "./data.js";

/* ---------------- navigation ---------------- */
const NavCtx = createContext(null);
export function NavProvider({ initial, children }) {
  const [stack, setStack] = useState([{ r: initial, p: {} }]);
  const [dir, setDir] = useState("fwd");
  const [sheet, setSheet] = useState(null);
  const sheetRef = useRef(null); sheetRef.current = sheet;
  const hist = (fn) => { try { fn(); } catch (e) { /* history unavailable */ } };
  // Phone back gesture / browser back: close an open sheet, else go back one screen.
  useEffect(() => {
    hist(() => history.replaceState({ roomos: 1 }, ""));
    const onPop = () => {
      if (sheetRef.current) { setSheet(null); return; }
      setDir("back"); setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    };
    window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop);
  }, []);
  const go = useCallback((r, p = {}) => { setDir("fwd"); setSheet(null); hist(() => history.pushState({ roomos: 1 }, "")); setStack((s) => [...s, { r, p }]); }, []);
  const replace = useCallback((r, p = {}) => { setDir("fwd"); setSheet(null); setStack((s) => [...s.slice(0, -1), { r, p }]); }, []);
  const reset = useCallback((r, p = {}) => { setDir("fwd"); setSheet(null); setStack([{ r, p }]); }, []);
  const back = useCallback(() => { setDir("back"); setSheet(null); setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)); }, []);
  const open = useCallback((r, p = {}) => setSheet({ r, p }), []);
  const close = useCallback(() => setSheet(null), []);
  const cur = stack[stack.length - 1];
  const v = useMemo(() => ({ cur, depth: stack.length, dir, go, replace, reset, back, sheet, open, close }), [cur, stack.length, dir, go, replace, reset, back, sheet, open, close]);
  return <NavCtx.Provider value={v}>{children}</NavCtx.Provider>;
}
export const useNav = () => useContext(NavCtx);

/* ---------------- layout ---------------- */
export function Screen({ children, tab, glow, notab, sharp, bg = ROOM_PHOTO, plain }) {
  const { dir, cur } = useNav();
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [cur]);
  return (
    <div className={"screen" + (dir === "back" ? " back-anim" : "")} key={cur.r + JSON.stringify(cur.p)}>
      {!plain && <div className={"room-bg" + (sharp ? " sharp" : "")} style={{ backgroundImage: `url(${bg})` }} />}
      {!plain && !sharp && <div className="glass-layer" />}
      <div ref={ref} className={"scroll" + (tab ? "" : " notab")} style={{ position: "relative", zIndex: 1 }}>{children}</div>
      {tab && <TabBar active={tab} glow={glow} />}
    </div>
  );
}

export function TopIcons() {
  const { s } = useStore(); const { go } = useNav();
  const unread = s.notifications.some((n) => !n.read);
  return (
    <div className="row-flex" style={{ gap: 8 }}>
      <button className="circle-btn" aria-label="Notifications" onClick={() => go("notifications")}>
        <Glyph name="bell" size={18} color="#51433C" />{unread && <span className="dot" />}
      </button>
      <button className="circle-btn" aria-label="Profile" onClick={() => go("profile")}><Glyph name="avatar" size={20} color="#51433C" /></button>
    </div>
  );
}
export function Header() {
  const { go } = useNav();
  return (
    <div className="hdr">
      <span className="logo">ROOM.OS</span>
      <div className="row-flex" style={{ gap: 8 }}>
        <button className="circle-btn" aria-label="Search" onClick={() => go("search")}><Ico n="search" size={18} color="#514340" /></button>
        <TopIcons />
      </div>
    </div>
  );
}
export function Back({ crumb, right = true, onBack, children }) {
  const { back } = useNav();
  return (
    <div className="hdr">
      <button className="circle-btn" aria-label="Back" onClick={onBack || back}><Ico n="back" size={20} /></button>
      <span className="crumb">{crumb}</span>
      {children}
      {right && <TopIcons />}
    </div>
  );
}
export const Title = ({ children, sm }) => <h1 className={"title" + (sm ? " sm" : "")}>{children}</h1>;
export const Sub = ({ children }) => <p className="sub">{children}</p>;

/* ---------------- bits ---------------- */
export const Bar = ({ v, o, h, c }) => (
  <div className={"bar" + (h ? " " + h : "")}>
    <i style={{ width: Math.max(4, Math.min(100, v * 100)) + "%", background: c }} />
    {o != null && <i className="o" style={{ width: Math.max(0, Math.min(100, o * 100)) + "%" }} />}
  </div>
);
export const Tag = ({ tone = "grey", children }) => <span className={"tag " + tone}>{children}</span>;
export const Emoji = ({ e, s = 24 }) => <span className="emoji" style={{ fontSize: s }} aria-hidden="true">{e}</span>;
export function Toggle({ on, onChange, label }) {
  return <button role="switch" aria-checked={on} aria-label={label} className={"toggle" + (on ? " on" : "")} onClick={() => onChange(!on)} />;
}
export function Stepper({ v, onChange, min = 0, suffix = "" , step = 1 }) {
  return (
    <div className="stepper">
      <button aria-label="Decrease" onClick={() => onChange(Math.max(min, v - step))}><Ico n="minus" size={16} /></button>
      <span>{v}{suffix}</span>
      <button aria-label="Increase" onClick={() => onChange(v + step)}><Ico n="plus" size={16} /></button>
    </div>
  );
}
export function Row({ emoji, img, title, sub, value, chev, onClick, children, warn, tone, style }) {
  const El = onClick ? "button" : "div";
  return (
    <El className={"row" + (warn ? " warn" : "")} onClick={onClick} style={style}>
      {emoji && <Emoji e={emoji} s={22} />}
      {img}
      <span className="grow"><span className="t" style={tone ? { color: tone } : null}>{title}</span>{sub && <span className="s">{sub}</span>}</span>
      {value != null && <span className="v">{value}</span>}
      {children}
      {chev && <Ico n="chev" size={16} />}
    </El>
  );
}
export function Btn({ children, chev = true, cls = "", ...p }) {
  return <button type="button" className={"btn " + cls} {...p}>{children}{chev && <Ico n="chev" size={16} />}</button>;
}
export function Pills({ options, value, onChange }) {
  return (
    <div className="pills" role="tablist">
      {options.map(([k, label]) => <button key={k} role="tab" aria-selected={value === k} className={"pill" + (value === k ? " on" : "")} onClick={() => onChange(k)}>{label}</button>)}
    </div>
  );
}
export function Ring({ size = 150, pct = 0, color = "var(--yellow)", stroke = 0.2, children }) {
  const r = size / 2 - (size * stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={size * stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={size * stroke} strokeDasharray={`${c * Math.min(1, pct)} ${c}`} strokeLinecap="round" style={{ transition: "stroke-dasharray .6s" }} />
      </svg>
      <div className="c">{children}</div>
    </div>
  );
}
export function Weekly({ data, legend, onShow, height = 170, unit = "hrs" }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(0.5, ...data.map((d) => d[0] + d[1]));
  const total = data.reduce((a, d) => a + d[0] + d[1], 0);
  return (
    <div className="card" aria-label={`Last 7 days, ${total.toFixed(1)} ${unit} total`}>
      <div className="between"><span className="small">Last 7 Days</span>{onShow && <button className="pill" style={{ height: 22, fontSize: 9, padding: "0 10px" }} onClick={onShow}>Show Analytics</button>}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: height - 70, marginTop: 12, borderBottom: "1px solid rgba(0,0,0,.8)", padding: "0 6px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }} title={`${(d[0] + d[1]).toFixed(1)} ${unit}`}>
            <div style={{ height: (d[1] / max) * 100 + "%", background: "var(--yellow)", borderRadius: "3px 3px 0 0" }} />
            <div style={{ height: (d[0] / max) * 100 + "%", background: "var(--orange)", borderRadius: d[1] ? 0 : "3px 3px 0 0" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, padding: "4px 6px 0" }}>{days.map((d, i) => <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, fontWeight: 600 }}>{d}</span>)}</div>
      {legend && <div className="row-flex" style={{ gap: 14, marginTop: 8, fontSize: 10 }}>
        <span className="row-flex" style={{ gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 5, background: "var(--orange)" }} />{legend[0]}</span>
        <span className="row-flex" style={{ gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 5, background: "var(--yellow)" }} />{legend[1]}</span>
      </div>}
    </div>
  );
}
export function Sheet({ children, onClose }) {
  const { close } = useNav();
  return (<>
    <div className="dim" onClick={onClose || close} />
    <div className="sheet" role="dialog" aria-modal="true">{children}</div>
  </>);
}
export function SheetHead({ title, sub }) {
  const { close } = useNav();
  return (
    <div className="between" style={{ marginBottom: 12 }}>
      <div><div style={{ fontSize: 22, fontWeight: 600 }}>{title}</div>{sub && <div className="small" style={{ opacity: .8, marginTop: 4 }}>{sub}</div>}</div>
      <button className="circle-btn" aria-label="Close" onClick={close} style={{ background: "rgba(255,255,255,.2)" }}><Ico n="x" size={18} /></button>
    </div>
  );
}
export function Field({ label, id, ...p }) {
  return <label className="fieldwrap" htmlFor={id}><span className="lbl">{label}</span><input id={id} className="field" {...p} /></label>;
}
export function Check({ on, onChange, children }) {
  return (
    <button type="button" className="row-flex" style={{ gap: 10, textAlign: "left" }} onClick={() => onChange(!on)} role="checkbox" aria-checked={on}>
      <span className={"check" + (on ? " on" : "")}>{on && <Ico n="check" size={15} color="#514340" sw={3} />}</span>
      <span className="small">{children}</span>
    </button>
  );
}
export function Halo({ emoji, tone }) {
  return <div className="halo" style={tone ? { background: tone + "22" } : null}><div style={tone ? { background: tone + "66" } : null}>{emoji ? <Emoji e={emoji} s={56} /> : <Ico n="check" size={60} sw={2.6} />}</div></div>;
}

/* ---------------- tab bar ---------------- */
const TABS = [["home", "Home", "folder"], ["objects", "Objects", "box"], null, ["analytics", "Analytics", "chart"], ["archive", "Archive", "star"]];
export function TabBar({ active, glow }) {
  const { reset, go } = useNav();
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t, i) => t ? (
        <button key={t[0]} className={"tab" + (active === t[0] ? " on" : "")} aria-current={active === t[0] ? "page" : undefined} onClick={() => reset(t[0])}>
          <Glyph name={t[2]} size={22} color={active === t[0] ? "#fff" : "#BAA397"} />{t[1]}
        </button>
      ) : (
        <button key="scan" className={"scanbtn" + (glow ? " glow" : "")} aria-label="Scan your room" onClick={() => go("scan")}><Ico n="scan" size={32} sw={2.4} /></button>
      ))}
    </nav>
  );
}
