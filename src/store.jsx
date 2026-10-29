import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { emptyState, sampleState, cocoInfo, CATS } from "./data.js";

const KEY = "roomos-app-v1";
const Ctx = createContext(null);
const uid = (p = "id") => p + Math.random().toString(36).slice(2, 9);

function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) { /* storage blocked */ }
  return emptyState();
}

export function StoreProvider({ children }) {
  const [s, setS] = useState(load);
  const [toast, setToast] = useState(null);
  const [pending, setPending] = useState(null); // scan in review (not persisted)
  const timers = useRef([]);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* quota or blocked */ } }, [s]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const say = useCallback((msg) => { setToast(msg); const t = setTimeout(() => setToast(null), 2200); timers.current.push(t); }, []);
  const up = useCallback((fn) => setS((p) => fn(structuredClone(p))), []);

  const api = useMemo(() => ({
    s, toast, say, pending, setPending, up,
    item: (id) => s.items.find((i) => i.id === id),
    byCat: (cat) => s.items.filter((i) => i.cat === cat),
    loadSample: () => setS(sampleState()),
    reset: () => setS(emptyState()),
    signUp: (user) => up((d) => { d.user = { ...d.user, ...user }; d.authed = true; return d; }),
    logIn: (email) => setS((p) => { const base = p.scans.length || p.items.length > 1 ? p : sampleState(); return { ...base, authed: true, onboarded: true, user: { ...base.user, email: email || base.user.email } }; }),
    logOut: () => up((d) => { d.authed = false; return d; }),
    finishSetup: (room, track) => up((d) => { d.room = { ...d.room, ...room }; d.track = track; d.onboarded = true; return d; }),
    setQty: (id, qty) => up((d) => { const it = d.items.find((i) => i.id === id); if (it) it.qty = Math.max(0, qty); return d; }),
    patchItem: (id, patch) => up((d) => { const it = d.items.find((i) => i.id === id); if (it) Object.assign(it, patch); return d; }),
    removeItem: (id) => up((d) => { d.items = d.items.filter((i) => i.id !== id); return d; }),
    addItem: (item) => up((d) => { d.items.push({ id: uid("i"), qty: 1, ...item }); return d; }),
    setSetting: (k, v) => up((d) => { d.settings[k] = v; return d; }),
    setRoom: (patch) => up((d) => { d.room = { ...d.room, ...patch }; return d; }),
    setUser: (patch) => up((d) => { d.user = { ...d.user, ...patch }; return d; }),
    setGoals: (patch) => up((d) => { d.goals = { ...d.goals, ...patch }; return d; }),
    markRead: (id) => up((d) => { d.notifications.forEach((n) => { if (!id || n.id === id) n.read = true; }); return d; }),
    addRecent: (q) => up((d) => { const v = q.trim().toLowerCase(); if (v) d.recent = [v, ...d.recent.filter((r) => r !== v)].slice(0, 6); return d; }),
    clearRecent: (q) => up((d) => { d.recent = d.recent.filter((r) => r !== q); return d; }),
    logReading: (id, hrs) => up((d) => {
      const b = d.items.find((i) => i.id === id); if (!b) return d;
      b.hrs = +(b.hrs + hrs).toFixed(1); b.page = Math.min(b.pages, b.page + Math.round(hrs * 40)); b.status = b.page >= b.pages ? "Done" : "Reading";
      const day = (new Date().getDay() + 6) % 7; d.weekly.books[day][1] = +(d.weekly.books[day][1] + hrs).toFixed(1); return d;
    }),
    logQuest: (id, hrs) => up((d) => {
      const q = d.items.find((i) => i.id === id); if (!q) return d;
      q.hrs = +(q.hrs + hrs).toFixed(1); q.progress = Math.min(1, +(q.progress + 0.05).toFixed(2));
      const day = (new Date().getDay() + 6) % 7; d.weekly.sideQuests[day][0] = +(d.weekly.sideQuests[day][0] + hrs).toFixed(1); return d;
    }),
    placeOrder: (itemId, qty, auto) => {
      const id = uid("o"); const it = s.items.find((i) => i.id === itemId);
      up((d) => { d.orders.unshift({ id, itemId, qty, total: qty * (it?.price || 0), ts: Date.now(), status: 0, auto }); return d; });
      const t1 = setTimeout(() => up((d) => { const o = d.orders.find((x) => x.id === id); if (o && o.status < 1) o.status = 1; return d; }), 5000);
      const t3 = setTimeout(() => up((d) => { const o = d.orders.find((x) => x.id === id); if (o && o.status < 2) o.status = 2; return d; }), 11000);
      timers.current.push(t3);
      const t2 = setTimeout(() => up((d) => {
        const o = d.orders.find((x) => x.id === id); if (!o) return d; o.status = 3;
        const item = d.items.find((i) => i.id === itemId); if (item) item.qty += qty;
        d.notifications.unshift({ id: uid("n"), emoji: "📦", title: `${item?.name || "Your order"} arrived`, body: `${qty} added to your Snacks inventory.`, ts: Date.now(), read: false, kind: "order" });
        return d;
      }), 20000);
      timers.current.push(t1, t2);
      return id;
    },
    saveScan: (scan) => {
      // scan: { photo, place, rows:[{name,cat,emoji,score,box,keep}] }
      const kept = scan.rows.filter((r) => r.keep && r.cat !== "ignore");
      // work out the outcome against current state first (state updates apply later)
      const names = new Set(s.items.map((i) => i.cat + "|" + i.name.toLowerCase()));
      let added = 0, updated = 0;
      for (const r of kept) { if (r.cat === "unsorted") continue; const k = r.cat + "|" + r.name.toLowerCase(); if (names.has(k)) updated++; else { added++; names.add(k); } }
      up((d) => {
        for (const r of kept) {
          if (r.cat === "unsorted") continue;
          const ex = d.items.find((i) => i.cat === r.cat && i.name.toLowerCase() === r.name.toLowerCase());
          if (ex) { if (r.cat === "snacks") ex.qty += 1; ex.location = scan.place; }
          else d.items.push(newItem(r, scan.place));
        }
        d.scans.unshift({ id: uid("sc"), ts: Date.now(), place: scan.place, photo: d.settings.savePhotos ? scan.thumb : null, count: kept.length, added, missing: 0, detections: kept.map(({ name, cat, emoji, score, box }) => ({ name, cat, emoji, score, box })) });
        d.scans = d.scans.slice(0, 12);
        d.notifications.unshift({ id: uid("n"), emoji: "✅", title: "Scan complete", body: `${kept.length} objects found · ${scan.place}.`, ts: Date.now(), read: false, action: ["View", "archiveDetail", { id: d.scans[0].id }] });
        return d;
      });
      return { count: kept.length, added, updated };
    },
  }), [s, toast, say, pending, up]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

function newItem(r, place) {
  const base = { id: uid("i"), cat: r.cat, name: r.name, emoji: r.emoji, location: place };
  if (r.cat === "snacks") return { ...base, unit: "item", qty: 1, kcal: 150, price: 30, size: "1 pack" };
  if (r.cat === "books") return { ...base, genre: "Unsorted", status: "To read", color: "#b08b6e", page: 0, pages: 300, hrs: 0 };
  if (r.cat === "sideQuests") return { ...base, hrs: 0, progress: 0 };
  if (r.cat === "toys") return { ...base, status: "New" };
  if (r.cat === "devices") return { ...base, connected: false, battery: 1 };
  return base;
}

export const useStore = () => useContext(Ctx);
export { cocoInfo, CATS };
