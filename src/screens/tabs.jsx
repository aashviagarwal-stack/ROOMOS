import { useState } from "react";
import { Screen, Header, Title, Sub, Bar, Tag, Emoji, Btn, Pills, useNav } from "../ui.jsx";
import { Ico } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { ROOM_PHOTO, CATS, CAT_ORDER, healthScore, levels, weekTotal, fmtDate, fmtTime, sum } from "../data.js";

export const photoOf = (scan) => (!scan || scan.photo === "sample" ? ROOM_PHOTO : scan.photo || ROOM_PHOTO);
const catRoute = (cat) => (cat === "snacks" ? ["snacks", {}] : cat === "devices" ? ["speaker", {}] : ["category", { cat }]);
export function openCat(go, cat) { const [r, p] = catRoute(cat); go(r, p); }

export function catStat(s, cat) {
  const items = s.items.filter((i) => i.cat === cat);
  if (cat === "snacks") return `${sum(items.map((i) => i.qty))} items tracked`;
  if (cat === "books") return `${items.length} books tracked`;
  if (cat === "sideQuests") return `${items.length} active hobbies`;
  if (cat === "toys") return `${items.length} toys tracked`;
  if (cat === "devices") return `${items.filter((i) => i.connected).length} device connected`;
  return `${items.length} pieces`;
}

export function Home() {
  const { s, isSample, exitSample } = useStore(); const { go, reset } = useNav();
  if (!s.scans.length) return <HomeEmpty />;
  const score = healthScore(s), lv = levels(s);
  const first = (s.user.name || "there").split(" ")[0];
  const cards = CAT_ORDER.filter((c) => s.track[c] && c !== "devices");
  const screen = s.weekly.screen; const mx = Math.max(...screen);
  const low = s.items.filter((i) => i.cat === "snacks" && i.qty <= 1);
  return (
    <Screen tab="home">
      <Header />
      {isSample && (
        <div className="card row-flex" style={{ padding: "10px 12px", marginBottom: 10, borderColor: "var(--yellow)", background: "rgba(255,204,0,.14)" }}>
          <span className="emoji" style={{ fontSize: 20 }}>👀</span>
          <span className="small" style={{ flex: 1 }}>You're exploring the <b>sample room</b>.</span>
          <button className="btn sm tan" onClick={() => { exitSample(); reset("splash"); }}>Start my own room</button>
        </div>
      )}
      <Title>Hello {first}!</Title>
      <Sub>{low.length ? `${low[0].name} ${low[0].qty === 0 ? "ran out" : "are running low"} — everything else looks good.` : "Your room is running smoothly!"}</Sub>
      <div className="stack">
        <div className="panel">
          <div className="photo" style={{ height: 180 }}>
            <img src={photoOf(s.scans[0])} alt="Latest scan of your room" />
            <div className="row-flex" style={{ position: "absolute", left: 10, right: 10, bottom: 10, padding: 6, borderRadius: 23, background: "rgba(0,0,0,.3)", backdropFilter: "blur(6px)" }}>
              <button className="pill md" style={{ flex: 1 }} onClick={() => go("live")}>Explore Room</button>
              <button className="btn tan" style={{ flex: 1.2, height: 34, fontSize: 13 }} onClick={() => go("analysis")}>Room Analysis <Ico n="chev" size={14} /></button>
            </div>
          </div>
        </div>
        <button className="card tap" style={{ textAlign: "left" }} onClick={() => go("analysis")}>
          <div className="between"><span className="h3">Room Health Score</span><Ico n="chev" size={16} /></div>
          <div className="row-flex" style={{ marginTop: 6, gap: 14 }}>
            <div><span style={{ fontSize: 34, fontWeight: 600 }} className="num">{score}</span><span className="small" style={{ opacity: .75 }}> /100</span></div>
            <div className="stack" style={{ flex: 1, gap: 6 }}>
              <div className="row-flex" style={{ gap: 8 }}><span className="muted" style={{ width: 70, color: "#fff" }}>Distraction</span><Bar v={lv.distraction} /></div>
              <div className="row-flex" style={{ gap: 8 }}><span className="muted" style={{ width: 70, color: "#fff" }}>Productivity</span><Bar v={lv.productivity} /></div>
            </div>
          </div>
        </button>
        <div className="between"><h2 className="h2">Room Objects</h2><button className="small link" onClick={() => go("objects")}>See all</button></div>
        <div className="pills" style={{ gap: 10 }}>
          {cards.map((c) => (
            <button key={c} className="card tap" onClick={() => openCat(go, c)} style={{ width: 112, flex: "none", padding: "12px 8px", textAlign: "center" }}>
              <Emoji e={CATS[c].emoji} s={34} />
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 8 }}>{CATS[c].name}</div>
              <div style={{ fontSize: 9.5, opacity: .8, marginTop: 2 }}>{CATS[c].distraction} distraction</div>
              <span className="pill" style={{ height: 18, fontSize: 8, marginTop: 8, padding: "0 12px" }}>Open</span>
            </button>
          ))}
        </div>
        <div className="card between" style={{ alignItems: "flex-end" }}>
          <div><div className="h3">Screen time</div><div className="big" style={{ marginTop: 4 }}>3h 36m</div><div className="muted" style={{ color: "#fff", opacity: .75 }}>Yesterday</div></div>
          <div className="row-flex" style={{ gap: 6, alignItems: "flex-end", height: 48 }}>{screen.map((h, i) => <i key={i} style={{ width: 9, height: (h / mx) * 46, borderRadius: 2, background: i % 3 === 1 ? "var(--orange)" : "var(--yellow)" }} />)}</div>
        </div>
      </div>
    </Screen>
  );
}

function HomeEmpty() {
  const { s, loadSample } = useStore(); const { go } = useNav();
  return (
    <Screen tab="home" glow>
      <Header />
      <Title>Hello {(s.user.name || "there").split(" ")[0]}!</Title><Sub>Let's get your room set up.</Sub>
      <div className="stack">
        <div className="dashed center" style={{ padding: "26px 20px" }}>
          <div className="circle-btn" style={{ width: 100, height: 100, margin: "0 auto", background: "rgba(255,255,255,.18)" }}><Emoji e="📷" s={46} /></div>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 14 }}>No scans yet</div>
          <p className="small" style={{ opacity: .85, maxWidth: 280, margin: "8px auto 16px", lineHeight: 1.45 }}>Scan your room once and ROOM.OS will find and track everything on your shelves.</p>
          <div style={{ maxWidth: 230, margin: "0 auto" }}><Btn onClick={() => go("scan")}>Start first scan</Btn></div>
        </div>
        <h2 className="h2">How it works</h2>
        <div className="grid3">
          {[["📷", "1. Scan", "Point at a shelf"], ["✅", "2. Confirm", "Check what we found"], ["📊", "3. Track", "See habits over time"]].map(([e, t, d]) => (
            <div key={t} className="card tight center" style={{ padding: "14px 6px" }}><Emoji e={e} s={28} /><div style={{ fontWeight: 600, fontSize: 13, marginTop: 8 }}>{t}</div><div style={{ fontSize: 10, opacity: .8, marginTop: 4 }}>{d}</div></div>
          ))}
        </div>
        <div className="card row-flex"><Emoji e="💡" s={20} /><span className="small">Good lighting gives the best results.</span></div>
        <button className="small link center" onClick={loadSample}>Or explore with the sample room</button>
      </div>
    </Screen>
  );
}

export function Objects() {
  const { s } = useStore(); const { go } = useNav();
  const [f, setF] = useState("all"); const [q, setQ] = useState("");
  let cats = CAT_ORDER.filter((c) => s.track[c] || s.items.some((i) => i.cat === c));
  if (f === "high") cats = cats.filter((c) => CATS[c].distraction !== "Low");
  if (f === "prod") cats = cats.filter((c) => CATS[c].distraction === "Low");
  if (q) cats = cats.filter((c) => CATS[c].name.toLowerCase().includes(q.toLowerCase()) || s.items.some((i) => i.cat === c && i.name.toLowerCase().includes(q.toLowerCase())));
  const unsorted = s.items.filter((i) => i.cat === "unsorted");
  return (
    <Screen tab="objects">
      <Header />
      <Title>Objects</Title><Sub>Everything ROOM.OS has spotted in your room.</Sub>
      <div className="stack">
        <label className="row-flex field" style={{ padding: "0 14px" }}><Ico n="search" size={18} color="#514340" /><input aria-label="Search objects" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search objects" style={{ background: "none", border: 0, outline: "none", flex: 1, color: "#fff" }} /></label>
        <Pills value={f} onChange={setF} options={[["all", "All"], ["high", "High distraction"], ["prod", "Productive"]]} />
        <div className="grid2">
          {cats.map((c) => (
            <button key={c} className="card tap" onClick={() => openCat(go, c)} style={{ textAlign: "left", minHeight: 134, display: "flex", flexDirection: "column" }}>
              <div className="between" style={{ alignItems: "flex-start" }}><Emoji e={CATS[c].emoji} s={32} /><Tag tone={CATS[c].tone}>{CATS[c].distraction}</Tag></div>
              <div className="spacer" />
              <div style={{ fontSize: 16, fontWeight: 600 }}>{CATS[c].name}</div>
              <div className="between"><span className="muted" style={{ color: "#fff", opacity: .8 }}>{catStat(s, c)}</span><Ico n="chev" size={16} /></div>
            </button>
          ))}
          <button className="dashed tap center" onClick={() => go("scan")} style={{ minHeight: 134, display: "grid", placeItems: "center", alignContent: "center", gap: 10 }}>
            <span className="circle-btn" style={{ width: 48, height: 48 }}><Ico n="plus" size={24} /></span><span style={{ fontWeight: 600, fontSize: 13 }}>Scan to add more</span>
          </button>
        </div>
        {unsorted.length > 0 && <div className="card"><div className="h3">Unsorted</div>{unsorted.map((i) => <div key={i.id} className="small" style={{ marginTop: 6 }}>{i.emoji} {i.name}</div>)}</div>}
      </div>
    </Screen>
  );
}

export function Analytics() {
  const { s } = useStore(); const { go } = useNav();
  const [range, setRange] = useState("week");
  const m = range === "week" ? 1 : 4.3;
  const books = weekTotal(s.weekly.books) * m, sq = weekTotal(s.weekly.sideQuests) * m, dev = weekTotal(s.weekly.devices) * m;
  const per = [["sideQuests", "⭐", "Side Quests", sq, s.goals.sideQuests * m, "hrs"], ["books", "📚", "Books", books, s.goals.reading * m, "hrs"], ["devices", "🔊", "Speaker", dev, 10 * m, "hrs"], ["snacks", "🍿", "Snacks", s.kcalWeek * m, s.goals.kcal * m, "kcal"]];
  const most = per.slice(0, 3).sort((a, b) => b[3] - a[3])[0];
  const act = s.weekly.books.map((d, i) => d[0] + d[1] + s.weekly.sideQuests[i][0] + s.weekly.sideQuests[i][1] + s.weekly.devices[i][0] * 0.5);
  const mx = Math.max(0.5, ...act); const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekScans = s.scans.filter((x) => Date.now() - x.ts < 7 * 864e5 * m).length;
  return (
    <Screen tab="analytics">
      <Header />
      <Title>Analytics</Title><Sub>A {range === "week" ? "weekly" : "monthly"} snapshot across everything ROOM.OS tracks.</Sub>
      <div className="stack">
        <div className="row-flex" style={{ padding: 3, borderRadius: 18, background: "rgba(255,255,255,.15)", gap: 0 }}>
          {[["week", "Week"], ["month", "Month"]].map(([k, l]) => <button key={k} onClick={() => setRange(k)} aria-pressed={range === k} style={{ flex: 1, height: 30, borderRadius: 15, fontWeight: 600, fontSize: 13, background: range === k ? "rgba(255,255,255,.88)" : "none", color: range === k ? "var(--tan-ink)" : "#fff" }}>{l}</button>)}
        </div>
        <div className="grid3">
          {[[CAT_ORDER.filter((c) => s.track[c]).length, "Categories tracked"], [most[3] > 0 ? most[2] : "—", "Most active"], [weekScans, range === "week" ? "Scans this week" : "Scans this month"]].map(([v, l]) => (
            <div key={l} className="card tight center" style={{ padding: "14px 4px" }}><div style={{ fontSize: typeof v === "number" ? 24 : 14, fontWeight: 600, minHeight: 30, display: "grid", placeItems: "center" }}>{v}</div><div style={{ fontSize: 10, opacity: .8, marginTop: 4 }}>{l}</div></div>
          ))}
        </div>
        <div className="card">
          <div className="small" style={{ fontWeight: 600 }}>Room activity — {range === "week" ? "last 7 days" : "daily average"}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 130, marginTop: 14, borderBottom: "1px solid rgba(0,0,0,.6)", padding: "0 6px" }}>
            {act.map((v, i) => <div key={i} style={{ flex: 1, height: (v / mx) * 100 + "%", background: "var(--orange)", borderRadius: "4px 4px 0 0" }} title={v.toFixed(1) + " hrs"} />)}
          </div>
          <div style={{ display: "flex", gap: 14, padding: "4px 6px 0" }}>{days.map((d) => <span key={d} style={{ flex: 1, textAlign: "center", fontSize: 9, fontWeight: 600 }}>{d}</span>)}</div>
        </div>
        <div className="card">
          <div className="h3" style={{ marginBottom: 10 }}>Time by category</div>
          <div className="stack" style={{ gap: 14 }}>
            {per.map(([c, e, n, v, goal, u]) => (
              <button key={c} className="row-flex tap" onClick={() => openCat(go, c)} style={{ textAlign: "left" }}>
                <Emoji e={e} s={18} /><span style={{ width: 84, fontWeight: 600, fontSize: 13 }}>{n}</span><Bar v={v / goal} c={c === "snacks" ? "var(--orange)" : undefined} h="thin" />
                <span className="small num" style={{ width: 70, textAlign: "right", opacity: .85 }}>{u === "kcal" ? Math.round(v).toLocaleString() + " kcal" : v.toFixed(1) + " hrs"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}

export function Archive() {
  const { s } = useStore(); const { go } = useNav();
  const [f, setF] = useState("all");
  const places = [...new Set(s.scans.map((x) => x.place))];
  let list = s.scans;
  if (f === "month") list = list.filter((x) => Date.now() - x.ts < 30 * 864e5);
  else if (f !== "all") list = list.filter((x) => x.place === f);
  return (
    <Screen tab="archive">
      <Header />
      <Title>Archive</Title><Sub>Past scans and previously detected items.</Sub>
      <div className="stack">
        <Pills value={f} onChange={setF} options={[["all", "All"], ["month", "This month"], ...places.map((p) => [p, p.split(",")[0]])]} />
        {list.length === 0 && <div className="dashed center" style={{ padding: 28 }}><Emoji e="🗂️" s={34} /><p className="small" style={{ marginTop: 10 }}>No scans here yet. Tap the scan button to make one.</p></div>}
        {list.map((x) => (
          <button key={x.id} className="card tap row-flex" style={{ textAlign: "left", padding: 12 }} onClick={() => go("archiveDetail", { id: x.id })}>
            <div className="photo" style={{ width: 64, height: 64, flex: "none", borderRadius: 12 }}><img src={photoOf(x)} alt="" /></div>
            <div className="grow min0" style={{ flex: 1 }}>
              <div className="between"><span style={{ fontWeight: 600, fontSize: 15 }}>{fmtDate(x.ts)}</span>{x.added > 0 ? <Tag tone="green">+{x.added} new</Tag> : x.missing > 0 ? <Tag tone="red">{x.missing} missing</Tag> : null}</div>
              <div className="small" style={{ marginTop: 3 }}>{x.count} objects found</div>
              <div className="between"><span className="muted" style={{ color: "#fff", opacity: .65 }}>{fmtTime(x.ts)} · {x.place.split(",")[0]}</span><Ico n="chev" size={16} /></div>
            </div>
          </button>
        ))}
      </div>
    </Screen>
  );
}
