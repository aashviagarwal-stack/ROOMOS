import { useState } from "react";
import { Screen, Back, Title, Sub, Bar, Tag, Emoji, Btn, Stepper, Toggle, Weekly, Ring, Sheet, SheetHead, Check, Pills, useNav, Halo } from "../ui.jsx";
import { Ico, PlayIcon, PauseIcon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { CATS, IMG, healthScore, levels, weekTotal, sum } from "../data.js";
import { openCat } from "./tabs.jsx";

const Snack = ({ it, h = 50 }) => it.img ? <img src={IMG[it.img]} alt="" style={{ height: h, width: h * 0.8, objectFit: "contain", flex: "none" }} /> : <span style={{ width: h * 0.8, textAlign: "center", flex: "none" }}><Emoji e={it.emoji || "🍿"} s={h * 0.55} /></span>;
const plural = (n, u) => `${n} ${u}${n === 1 ? "" : "s"}`;
const statusTone = { Reading: "yellow", Done: "green", "To read": "grey", "On shelf": "green", Moved: "orange", New: "yellow", Missing: "red" };

/* ---------------- Snacks ---------------- */
export function Snacks() {
  const { s, byCat } = useStore(); const { go, open } = useNav();
  const items = byCat("snacks"); const top = [...items].sort((a, b) => b.qty - a.qty).slice(0, 4);
  return (
    <Screen tab="objects">
      <Back crumb="Room › Objects" />
      <Title>Snacks</Title>
      <div className="stack">
        <div className="card"><div className="h3">Top Snacks</div>
          <div className="between" style={{ marginTop: 10, padding: "0 6px" }}>{top.map((it) => <Snack key={it.id} it={it} h={74} />)}</div>
        </div>
        <div className="card">
          <div className="row-flex"><div style={{ flex: "none" }}><div className="big">{s.kcalWeek} kcal</div><div className="muted" style={{ color: "#fff", opacity: .8 }}>Consumed this week</div></div><Bar v={s.kcalWeek / s.goals.kcal} o={(s.kcalWeek / s.goals.kcal) * 0.45} /></div>
          <div style={{ marginTop: 10 }}><Btn onClick={() => go("diet")} style={{ height: 34, fontSize: 14 }}>Healthy Diet Ideas</Btn></div>
        </div>
        <h2 className="h2">Inventory status</h2>
        {items.map((it) => (
          <div key={it.id} className="row" style={{ minHeight: 62 }}>
            <Snack it={it} h={50} />
            <span className="grow"><span className="t">{plural(it.qty, it.unit)}</span><span className="s">{it.name}</span></span>
            {it.qty <= 1 && <Tag tone="red">{it.qty === 0 ? "Out" : "Low"}</Tag>}
            <button className="btn sm" onClick={() => open("order", { id: it.id })}>Order New <Ico n="chev" size={14} /></button>
          </div>
        ))}
        {s.orders.filter((o) => o.status < 3).map((o) => { const it = s.items.find((i) => i.id === o.itemId); return (
          <button key={o.id} className="card row-flex tap" style={{ textAlign: "left" }} onClick={() => go("placed", { id: o.id })}><Emoji e="🛵" s={22} /><span className="small grow" style={{ flex: 1 }}><b>{o.qty} × {it?.name}</b> on the way</span><Ico n="chev" size={16} /></button>
        ); })}
        <Btn onClick={() => go("update", { cat: "snacks" })}>Update Inventory</Btn>
        <h2 className="h2">Weekly Overview</h2>
        <Weekly data={s.weekly.snacks} legend={["Chips", "Drinks"]} unit="items" onShow={() => go("analytics")} />
      </div>
    </Screen>
  );
}

/* ---------------- Books / Side Quests / Toys / Decor ---------------- */
export function Category() {
  const { s, byCat } = useStore(); const { cur, go } = useNav();
  const cat = cur.p.cat; const C = CATS[cat]; const items = byCat(cat);
  const cfg = {
    books: { top: "Top Books", stat: `${weekTotal(s.weekly.books)} hrs`, statSub: "Read this week", pct: weekTotal(s.weekly.books) / s.goals.reading, cta: "Continue Reading", legend: ["Morning", "Evening"], list: [...items].sort((a, b) => b.hrs - a.hrs).slice(0, 3) },
    sideQuests: { top: "Top Projects", stat: `${weekTotal(s.weekly.sideQuests)} hrs`, statSub: "Worked on this week", pct: weekTotal(s.weekly.sideQuests) / s.goals.sideQuests, cta: "Continue Working", legend: ["Crafting", "Embroidery"], list: [...items].sort((a, b) => b.hrs - a.hrs).slice(0, 3) },
    toys: { top: "Toy status", stat: plural(items.length, "toy"), statSub: "Tracked on your shelves", pct: items.filter((i) => i.status !== "Missing").length / Math.max(1, items.length), cta: "See where they are", legend: ["Plushies", "Collectibles"], list: items },
    decor: { top: "Decor", stat: plural(items.length, "piece"), statSub: "Spotted in your scans", pct: 1, cta: "See in room", legend: null, list: items },
  }[cat] || { top: C?.name, stat: items.length + " items", statSub: "", pct: 1, cta: "Open", list: items };
  const ctaGo = () => {
    if (cat === "books") { const b = items.find((i) => i.status === "Reading") || items[0]; if (b) go("item", { id: b.id }); }
    else if (cat === "sideQuests") { const q = [...items].sort((a, b) => b.progress - a.progress).find((i) => i.progress < 1); if (q) go("item", { id: q.id }); }
    else go("live");
  };
  return (
    <Screen tab="objects">
      <Back crumb="Room › Objects" />
      <Title>{C.name}</Title>
      <div className="stack">
        <div className="card">
          <div className="h3" style={{ marginBottom: 6 }}>{cfg.top}</div>
          {cfg.list.length === 0 && <p className="small" style={{ opacity: .8 }}>Nothing here yet — scan a shelf to add some.</p>}
          {cfg.list.map((it) => (
            <button key={it.id} className="row-flex tap" style={{ width: "100%", textAlign: "left", padding: "7px 0" }} onClick={() => go("item", { id: it.id })}>
              {cat === "books" ? <i style={{ width: 26, height: 38, borderRadius: 4, background: it.color, boxShadow: "inset 5px 0 0 rgba(0,0,0,.2)", flex: "none" }} /> : <Emoji e={it.emoji} s={26} />}
              <span style={{ flex: 1, minWidth: 0 }}><span className="t" style={{ fontWeight: 600, display: "block" }}>{it.name}</span>
                <span className="muted" style={{ color: "#fff", opacity: .75 }}>{cat === "books" ? `${it.hrs} hrs · ${it.status}` : cat === "sideQuests" ? `${it.hrs} hrs · ${Math.round(it.progress * 100)}% done` : it.location}</span></span>
              {cat === "books" && <div style={{ width: 82 }}><Bar v={it.page / it.pages} h="thin" /></div>}
              {cat === "sideQuests" && <div style={{ width: 82 }}><Bar v={it.progress} h="thin" /></div>}
              {(cat === "toys") && <Tag tone={statusTone[it.status]}>{it.status}</Tag>}
            </button>
          ))}
        </div>
        <div className="card">
          <div className="row-flex"><div style={{ flex: "none" }}><div className="big">{cfg.stat}</div><div className="muted" style={{ color: "#fff", opacity: .8 }}>{cfg.statSub}</div></div><Bar v={cfg.pct} o={cfg.pct * 0.55} /></div>
          <div style={{ marginTop: 10 }}><Btn onClick={ctaGo} style={{ height: 36, fontSize: 14 }}>{cfg.cta}</Btn></div>
        </div>
        <div className="grid2"><Btn onClick={() => go("inventory", { cat })} style={{ fontSize: 13 }}>View Inventory</Btn><Btn onClick={() => go("update", { cat })} style={{ fontSize: 13 }}>Update Inventory</Btn></div>
        {s.weekly[cat] && <><h2 className="h2">Weekly Overview</h2><Weekly data={s.weekly[cat]} legend={cfg.legend} onShow={() => go("analytics")} /></>}
      </div>
    </Screen>
  );
}

/* ---------------- single item ---------------- */
export function Item() {
  const { s, item, logReading, logQuest, patchItem, removeItem, say } = useStore(); const { cur, back, go } = useNav();
  const it = item(cur.p.id);
  if (!it) return <Screen><Back /><p>This item was removed.</p></Screen>;
  const C = CATS[it.cat];
  const seen = s.scans.filter((x) => x.detections?.some((d) => d.cat === it.cat)).slice(0, 2);
  return (
    <Screen tab="objects">
      <Back crumb={C.name} />
      <div className="center" style={{ marginTop: 6 }}>
        {it.cat === "books" ? (
          <div style={{ width: 140, height: 200, margin: "0 auto", borderRadius: 10, background: it.color, boxShadow: "inset 14px 0 0 rgba(0,0,0,.2), 0 10px 20px rgba(0,0,0,.4)", padding: "22px 14px 0 26px", textAlign: "left", fontWeight: 700, fontSize: 18 }}>{it.name}</div>
        ) : <div className="circle-btn" style={{ width: 130, height: 130, margin: "0 auto", background: "rgba(255,255,255,.18)" }}><Emoji e={it.emoji} s={64} /></div>}
        <Title sm>{it.name}</Title>
        <p className="small" style={{ opacity: .85 }}>{[it.genre, it.pages && `${it.pages} pages`, it.location].filter(Boolean).join(" · ") || C.name}</p>
      </div>
      <div className="stack" style={{ marginTop: 14 }}>
        {it.cat === "books" && <>
          <div className="card">
            <div className="between"><span className="h3">Page {it.page} of {it.pages}</span><span className="h3" style={{ color: "var(--yellow)" }}>{Math.round((it.page / it.pages) * 100)}%</span></div>
            <div style={{ margin: "10px 0 8px" }}><Bar v={it.page / it.pages} h="thick" /></div>
            <span className="muted" style={{ color: "#fff", opacity: .8 }}>{it.status === "Done" ? "Finished — nice one!" : `About ${Math.max(0.1, ((it.pages - it.page) / 40)).toFixed(1)} hrs left at your pace`}</span>
          </div>
          <div className="grid3">{[[it.hrs + " hrs", "Read so far"], [it.status, "Status"], [it.location || "—", "Where"]].map(([v, l]) => <div key={l} className="card tight center"><div style={{ fontWeight: 600, fontSize: 15 }}>{v}</div><div style={{ fontSize: 10, opacity: .8, marginTop: 4 }}>{l}</div></div>)}</div>
          <Btn onClick={() => { logReading(it.id, 0.5); say("Logged 30 minutes of reading"); }}>Log 30 min of reading</Btn>
          <div className="grid2">
            <button className="pill md" onClick={() => { patchItem(it.id, { status: "Done", page: it.pages }); say("Marked as finished"); }}>Mark as finished</button>
            <button className="pill md" onClick={() => { patchItem(it.id, { status: "To read" }); say("Moved to To read"); }}>Move to “To read”</button>
          </div>
        </>}
        {it.cat === "sideQuests" && <>
          <div className="card"><div className="between"><span className="h3">{Math.round(it.progress * 100)}% done</span><span className="small">{it.hrs} hrs so far</span></div><div style={{ marginTop: 10 }}><Bar v={it.progress} h="thick" /></div></div>
          <Btn onClick={() => { logQuest(it.id, 0.5); say("Logged 30 minutes"); }}>Log 30 min of work</Btn>
          <button className="pill md" onClick={() => { patchItem(it.id, { progress: 1 }); say("Project complete!"); }}>Mark project complete</button>
        </>}
        {it.cat === "toys" && <div className="card"><div className="lbl" style={{ marginBottom: 8 }}>Status</div><div className="pills">{["On shelf", "Moved", "New", "Missing"].map((st) => <button key={st} className={"pill" + (it.status === st ? " on" : "")} onClick={() => patchItem(it.id, { status: st })}>{st}</button>)}</div></div>}
        {seen.length > 0 && <><h2 className="h2">Spotted in scans</h2>
          {seen.map((x) => <button key={x.id} className="row" onClick={() => go("archiveDetail", { id: x.id })}><span className="grow"><span className="t">{new Date(x.ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span><span className="s">{x.place}</span></span><Ico n="chev" size={16} /></button>)}</>}
        <button className="pill md red" onClick={() => { removeItem(it.id); say(it.name + " removed"); back(); }}>Remove from room</button>
      </div>
    </Screen>
  );
}

/* ---------------- Speaker ---------------- */
export function Speaker() {
  const { s, byCat, patchItem } = useStore(); const { go } = useNav();
  const sp = byCat("devices")[0];
  const [playing, setPlaying] = useState(true);
  if (!sp) return <Screen tab="objects"><Back crumb="Room › Objects" /><Title>Speaker</Title><Sub>No speaker found yet.</Sub><Btn onClick={() => go("addDevice")}>Add a device</Btn></Screen>;
  const listen = weekTotal(s.weekly.devices);
  return (
    <Screen tab="objects">
      <Back crumb="Room › Objects" />
      <Title>Speaker</Title>
      <div className="stack">
        <div className="card">
          <div className="h3">Now Playing</div>
          <div className="row-flex" style={{ marginTop: 10, gap: 14 }}>
            <div style={{ width: 96, height: 96, borderRadius: 18, background: "var(--orange)", display: "grid", placeItems: "center", flex: "none" }}><Emoji e="🎧" s={50} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 17, fontWeight: 600 }}>Lo-fi Study Mix</div><div className="small" style={{ opacity: .8 }}>Focus playlist · 1h 12m left</div>
              <div style={{ marginTop: 12 }}><Bar v={0.38} h="thin" /></div><div className="between muted" style={{ color: "#fff", opacity: .7, marginTop: 4 }}><span>27:40</span><span>1:40:00</span></div></div>
          </div>
          <div className="row-flex" style={{ justifyContent: "center", gap: 34, marginTop: 8 }}>
            <button aria-label="Previous"><Ico n="prev" size={30} /></button>
            <button aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)} style={{ width: 48, height: 48, borderRadius: 24, background: "rgba(255,255,255,.9)", display: "grid", placeItems: "center" }}>{playing ? <PauseIcon /> : <PlayIcon />}</button>
            <button aria-label="Next"><Ico n="next" size={30} /></button>
          </div>
        </div>
        <div className="card row-flex">
          <div style={{ flex: 1 }}><div className="h3" style={{ fontSize: 14 }}>{sp.name}</div><div className="muted" style={{ color: "#fff", opacity: .8 }}>{sp.connected ? "Connected" : "Not connected"} · Shelf, left wall</div></div>
          <Emoji e="🔋" s={14} /><div style={{ width: 90 }}><Bar v={sp.battery} c="var(--green)" /></div><span className="small num" style={{ fontWeight: 600 }}>{Math.round(sp.battery * 100)}%</span>
        </div>
        <div className="card stack" style={{ gap: 14 }}>
          <div className="row-flex"><span className="h3" style={{ fontSize: 14, width: 80 }}>Volume</span>
            <input type="range" min="0" max="100" value={Math.round(sp.volume * 100)} onChange={(e) => patchItem(sp.id, { volume: e.target.value / 100 })} aria-label="Volume" style={{ flex: 1, accentColor: "#ffcc00" }} /></div>
          <div className="between"><div><div className="h3" style={{ fontSize: 14 }}>Focus mode</div><div className="muted" style={{ color: "#fff", opacity: .75 }}>Auto-mute 9 AM – 5 PM</div></div><Toggle on={sp.focus} onChange={(v) => patchItem(sp.id, { focus: v })} label="Focus mode" /></div>
          <div className="between"><div><div className="h3" style={{ fontSize: 14 }}>Quiet hours</div><div className="muted" style={{ color: "#fff", opacity: .75 }}>11 PM – 8 AM</div></div><Toggle on={sp.quiet} onChange={(v) => patchItem(sp.id, { quiet: v })} label="Quiet hours" /></div>
        </div>
        <h2 className="h2">Listening this week · {listen} hrs</h2>
        <Weekly data={s.weekly.devices} legend={["Music", "Podcasts"]} onShow={() => go("analytics")} />
        <button className="row" onClick={() => go("devices")}><span className="emoji">🔗</span><span className="grow t">Manage connected devices</span><Ico n="chev" size={16} /></button>
      </div>
    </Screen>
  );
}

/* ---------------- Inventory list ---------------- */
export function Inventory() {
  const { byCat } = useStore(); const { cur, go } = useNav();
  const cat = cur.p.cat; const all = byCat(cat);
  const [q, setQ] = useState(""); const [f, setF] = useState("all");
  const statuses = [...new Set(all.map((i) => i.status).filter(Boolean))];
  let list = all.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
  if (f !== "all") list = list.filter((i) => i.status === f);
  return (
    <Screen tab="objects">
      <Back crumb={CATS[cat].name} />
      <Title sm>{CATS[cat].name.replace(/s$/, "")} Inventory</Title>
      <div className="stack">
        <label className="row-flex field" style={{ padding: "0 14px" }}><Ico n="search" size={18} color="#514340" /><input aria-label="Search inventory" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search your ${CATS[cat].name.toLowerCase()}`} style={{ background: "none", border: 0, outline: "none", flex: 1, color: "#fff" }} /></label>
        {statuses.length > 0 && <Pills value={f} onChange={setF} options={[["all", `All · ${all.length}`], ...statuses.map((st) => [st, `${st} · ${all.filter((i) => i.status === st).length}`])]} />}
        {list.map((it) => (
          <button key={it.id} className="row" onClick={() => go("item", { id: it.id })}>
            {cat === "books" ? <i style={{ width: 26, height: 38, borderRadius: 4, background: it.color, boxShadow: "inset 5px 0 0 rgba(0,0,0,.2)", flex: "none" }} /> : it.img ? <Snack it={it} h={40} /> : <Emoji e={it.emoji} s={24} />}
            <span className="grow"><span className="t">{it.name}</span><span className="s">{it.genre || it.location || (it.qty != null ? plural(it.qty, it.unit) : "")}</span></span>
            {it.status && <Tag tone={statusTone[it.status] || "grey"}>{it.status}</Tag>}
            <Ico n="chev" size={16} />
          </button>
        ))}
        {list.length === 0 && <p className="small center" style={{ opacity: .8, padding: 20 }}>No matches.</p>}
      </div>
    </Screen>
  );
}

/* ---------------- Update inventory ---------------- */
export function Update() {
  const { byCat, setQty, removeItem, addItem, say } = useStore(); const { cur, back, go } = useNav();
  const cat = cur.p.cat; const items = byCat(cat);
  const [draft, setDraft] = useState(() => Object.fromEntries(items.map((i) => [i.id, i.qty ?? 1])));
  const [gone, setGone] = useState([]);
  const [name, setName] = useState(""); const [ncat, setNcat] = useState(cat); const [nq, setNq] = useState(1);
  const counted = cat === "snacks";
  const save = () => { items.forEach((i) => { if (gone.includes(i.id)) removeItem(i.id); else if (counted && draft[i.id] !== i.qty) setQty(i.id, draft[i.id]); }); say("Inventory updated"); back(); };
  return (
    <Screen>
      <Back crumb={CATS[cat].name} right={false} />
      <Title sm>Update Inventory</Title>
      <div className="stack">
        {items.filter((i) => !gone.includes(i.id)).map((it) => (
          <div key={it.id} className="row" style={{ minHeight: 66 }}>
            {it.img ? <Snack it={it} h={48} /> : cat === "books" ? <i style={{ width: 24, height: 36, borderRadius: 4, background: it.color, flex: "none" }} /> : <Emoji e={it.emoji} s={24} />}
            <span className="grow"><span className="t">{it.name}</span><span className="s">{counted ? it.unit + "s" : it.status || it.location || CATS[cat].name}</span></span>
            {counted && <Stepper v={draft[it.id]} onChange={(v) => setDraft({ ...draft, [it.id]: v })} />}
            <button className="mini-circle red" style={{ width: 32, height: 32 }} aria-label={"Remove " + it.name} onClick={() => setGone([...gone, it.id])}><Ico n="trash" size={16} /></button>
          </div>
        ))}
        <div className="card stack" style={{ gap: 10 }}>
          <div className="h3">Add something new</div>
          <input className="field" aria-label="Item name" placeholder={cat === "snacks" ? "e.g. Roasted makhana" : "Name"} value={name} onChange={(e) => setName(e.target.value)} />
          <div className="row-flex">
            <select className="field" aria-label="Category" value={ncat} onChange={(e) => setNcat(e.target.value)} style={{ flex: 1 }}>{["snacks", "books", "sideQuests", "toys", "decor"].map((c) => <option key={c} value={c}>{CATS[c].name}</option>)}</select>
            {ncat === "snacks" && <Stepper v={nq} onChange={setNq} min={1} />}
          </div>
          <div className="grid2">
            <button className="btn" disabled={!name.trim()} onClick={() => {
              const base = { cat: ncat, name: name.trim(), emoji: CATS[ncat].emoji };
              addItem(ncat === "snacks" ? { ...base, qty: nq, unit: "packet", kcal: 150, price: 30, size: "1 pack" } : ncat === "books" ? { ...base, genre: "Unsorted", status: "To read", color: "#b08b6e", page: 0, pages: 300, hrs: 0, location: "Top shelf" } : ncat === "sideQuests" ? { ...base, hrs: 0, progress: 0 } : { ...base, status: "New", location: "Shelf" });
              say(name.trim() + " added"); setName(""); setNq(1);
            }}>Add item</button>
            <button className="pill md" onClick={() => go("scan")}><Emoji e="📷" s={15} /> Rescan shelf</button>
          </div>
        </div>
        <Btn cls="lg" chev={false} onClick={save}>Save changes</Btn>
      </div>
    </Screen>
  );
}

/* ---------------- Order sheet + placed ---------------- */
export function OrderSheet() {
  const { item, placeOrder, s } = useStore(); const { sheet, close, go } = useNav();
  const it = item(sheet.p.id); const [qty, setQty] = useState(3); const [auto, setAuto] = useState(true);
  if (!it) return null;
  return (
    <Sheet>
      <SheetHead title="Order more snacks" sub={`You have ${plural(it.qty, it.unit)} left.`} />
      <div className="card row-flex"><Snack it={it} h={88} /><div style={{ flex: 1 }}><div className="h3">{it.name}</div><div className="small" style={{ opacity: .8, margin: "4px 0 10px" }}>{it.size} · ₹{it.price} each</div><Stepper v={qty} onChange={setQty} min={1} /></div></div>
      <div className="card stack" style={{ gap: 10, marginTop: 12 }}>
        {[["Deliver to", `${s.room.name}`], ["Arrives in", "~15 minutes"], ["Subtotal", "₹" + qty * it.price], ["Delivery", "Free"]].map(([a, b]) => <div key={a} className="between small"><span style={{ opacity: .8 }}>{a}</span><b>{b}</b></div>)}
      </div>
      <div className="between" style={{ margin: "14px 0" }}><span className="h3" style={{ fontSize: 17 }}>Total</span><span style={{ fontSize: 22, fontWeight: 600, color: "var(--yellow)" }}>₹{qty * it.price}</span></div>
      <Check on={auto} onChange={setAuto}>Auto-reorder when I'm down to 1</Check>
      <div className="row-flex" style={{ marginTop: 16 }}><button className="pill lg" style={{ width: 130 }} onClick={close}>Cancel</button><Btn cls="lg" onClick={() => { const id = placeOrder(it.id, qty, auto); go("placed", { id }); }}>Place order</Btn></div>
      <p className="muted center" style={{ marginTop: 10 }}>Demo checkout: no payment is taken.</p>
    </Sheet>
  );
}
export function Placed() {
  const { s } = useStore(); const { cur, reset, go } = useNav();
  const o = s.orders.find((x) => x.id === cur.p.id); const it = o && s.items.find((i) => i.id === o.itemId);
  if (!o) return <Screen><Back right={false} /><p>Order not found.</p></Screen>;
  const steps = ["Placed", "Packed", "On the way", "Delivered"];
  return (
    <Screen>
      <div className="center" style={{ paddingTop: 40 }}><Halo /><Title>{o.status === 3 ? "Delivered!" : "Order placed!"}</Title><Sub>{o.status === 3 ? "Added to your Snacks inventory." : "Arriving in about 15 minutes"}</Sub></div>
      <div className="stack" style={{ marginTop: 6 }}>
        <div className="card row-flex">{it && <Snack it={it} h={70} />}<div><div className="h3" style={{ fontSize: 14 }}>{o.qty} × {it?.name}</div><div className="small" style={{ opacity: .8 }}>Order #{o.id.slice(-5).toUpperCase()} · ₹{o.total}</div></div></div>
        <div className="card">
          <div className="h3" style={{ fontSize: 14, marginBottom: 14 }}>Order status</div>
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
            <i style={{ position: "absolute", left: 20, right: 20, top: 7, height: 3, background: "var(--track)", borderRadius: 2 }} />
            <i style={{ position: "absolute", left: 20, top: 7, height: 3, width: `calc(${(o.status / 3) * 100}% - ${(o.status / 3) * 40}px)`, background: "var(--yellow)", borderRadius: 2, transition: "width .6s" }} />
            {steps.map((st, i) => <div key={st} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1, width: 60 }}><i style={{ width: 16, height: 16, borderRadius: 8, background: i <= o.status ? "var(--yellow)" : "#8a817c" }} /><span style={{ fontSize: 10, fontWeight: 600, opacity: i <= o.status ? 1 : 0.7, textAlign: "center" }}>{st}</span></div>)}
          </div>
        </div>
        <div className="card row-flex"><Emoji e="🔄" s={18} /><span className="small">Your Snacks inventory updates automatically when it arrives.</span></div>
        <Btn cls="lg" onClick={() => { reset("home"); go("snacks"); }}>Back to Snacks</Btn>
      </div>
    </Screen>
  );
}

/* ---------------- Healthy diet ---------------- */
export function Diet() {
  const { s, byCat, addItem, say } = useStore(); const { go } = useNav();
  const snacks = byCat("snacks");
  const swaps = { Chips: ["🥜", "Roasted makhana", "Save 120 kcal"], Cola: ["🍋", "Nimbu pani", "Save 135 kcal"], Chocolate: ["🍫", "70% dark chocolate", "Less sugar"], "Energy drink": ["☕", "Cold coffee", "Save 90 kcal"], "Protein bar": ["🍌", "Banana + peanut butter", "More fibre"] };
  const [added, setAdded] = useState([]);
  return (
    <Screen tab="objects">
      <Back crumb="Snacks" />
      <Title sm>Healthy Diet Ideas</Title>
      <div className="stack">
        <div className="card row-flex" style={{ gap: 16 }}>
          <Ring size={120} pct={s.kcalWeek / s.goals.kcal} color="var(--orange)" stroke={0.12}><div style={{ fontSize: 26, fontWeight: 600 }}>{s.kcalWeek}</div><div style={{ fontSize: 10, opacity: .8 }}>of {s.goals.kcal.toLocaleString()} kcal</div></Ring>
          <div className="stack" style={{ flex: 1, gap: 12 }}>
            {[["Sugar", "High", 0.8, "var(--red)"], ["Protein", "Low", 0.25, "var(--yellow)"], ["Caffeine", "Medium", 0.55, "var(--orange)"]].map(([n, l, v, c]) => <div key={n}><div className="between small"><b>{n}</b><span style={{ opacity: .8 }}>{l}</span></div><div style={{ marginTop: 5 }}><Bar v={v} c={c} h="thin" /></div></div>)}
          </div>
        </div>
        <h2 className="h2">Easy swaps for your shelf</h2>
        {snacks.filter((i) => swaps[i.name]).map((it) => { const [e, n, save] = swaps[it.name]; const done = added.includes(it.id); return (
          <div key={it.id} className="card row-flex" style={{ padding: 10, gap: 8 }}>
            <div className="inner row-flex" style={{ width: 96, padding: 6, gap: 4, flex: "none" }}><Snack it={it} h={44} /><span style={{ fontSize: 10, fontWeight: 600 }}>{it.name}</span></div>
            <Ico n="arrow" size={18} />
            <div className="inner row-flex" style={{ flex: 1, minWidth: 0, padding: 8, gap: 8 }}><Emoji e={e} s={24} /><div className="min0"><div style={{ fontSize: 12, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 10, opacity: .8 }}>{save}</div></div></div>
            <button className="btn sm" style={{ width: 56, padding: 0 }} disabled={done} onClick={() => { addItem({ cat: "snacks", name: n, emoji: e, qty: 0, unit: "pack", kcal: 100, price: 40, size: "1 pack" }); setAdded([...added, it.id]); say(n + " added to your shelf list"); }}>{done ? "Added" : "Add"}</button>
          </div>
        ); })}
        <div className="card row-flex"><Emoji e="💡" s={20} /><span className="small">Keep a water bottle where your energy drinks sit.</span></div>
        <button className="pill md" onClick={() => go("update", { cat: "snacks" })}>Edit snack inventory</button>
      </div>
    </Screen>
  );
}

/* ---------------- Room analysis ---------------- */
export function Analysis() {
  const { s, byCat, patchItem, say, setSetting } = useStore(); const { go } = useNav();
  const score = healthScore(s), lv = levels(s);
  const snackN = sum(byCat("snacks").map((i) => i.qty)), toyN = byCat("toys").length, reading = weekTotal(s.weekly.books);
  const sp = byCat("devices")[0];
  const [done, setDone] = useState([]);
  const sugg = [
    ["snacks", "Move snacks off the desk shelf", "Could raise your score by about 5 pts", () => go("update", { cat: "snacks" })],
    ["focus", sp?.focus ? "Speaker Focus Mode is on" : "Turn on speaker Focus Mode 9–5", "Mutes notifications while you study", () => { if (sp) patchItem(sp.id, { focus: true }); say("Focus mode on"); }],
    ["read", "Read 20 mins before bed", `${Math.max(0, s.goals.reading - reading).toFixed(1)} hrs from your weekly goal`, () => { setSetting("notifications", true); say("Reminder set for 10:30 PM"); }],
  ];
  return (
    <Screen tab="home">
      <Back crumb="Room › Home" />
      <Title sm>Room Analysis</Title>
      <div className="stack">
        <div className="card center">
          <div className="h3" style={{ textAlign: "left" }}>Room Health Score</div>
          <div style={{ display: "grid", placeItems: "center", marginTop: 10 }}><Ring size={150} pct={score / 100}><div style={{ fontSize: 40, fontWeight: 600 }}>{score}</div><div style={{ fontSize: 11, opacity: .8 }}>out of 100</div></Ring></div>
          <span className="tag yellow" style={{ marginTop: 12, color: "var(--yellow)", background: "rgba(255,204,0,.2)", height: 26, padding: "0 12px" }}>Based on {s.scans.length} scan{s.scans.length === 1 ? "" : "s"} and {s.items.length} objects</span>
        </div>
        <div className="card stack" style={{ gap: 12 }}>
          {[["Distraction", lv.distraction, undefined], ["Productivity", lv.productivity, undefined], ["Tidiness", lv.tidiness, "var(--orange)"]].map(([n, v, c]) => <div key={n} className="row-flex"><span className="small" style={{ width: 100, fontWeight: 600 }}>{n}</span><Bar v={v} c={c} /></div>)}
        </div>
        <h2 className="h2">What's pulling focus</h2>
        {[["snacks", "🍿", "Snacks", `${snackN > 15 ? "High" : "Medium"} distraction · ${snackN} items on the shelf`, snackN > 15 ? "var(--red)" : "var(--yellow)"], ["toys", "🧸", "Toys", `Medium · ${toyN} toys in view of the desk`, "var(--yellow)"], ["books", "📚", "Books", `Boosts productivity · ${reading} hrs this week`, "var(--green)"]].map(([c, e, n, sub, col]) => (
          <button key={c} className="row" onClick={() => openCat(go, c)}><span className="emoji" style={{ fontSize: 22 }}>{e}</span><span className="grow"><span className="t">{n}</span><span className="s">{sub}</span></span><i style={{ width: 12, height: 12, borderRadius: 6, background: col }} /></button>
        ))}
        <h2 className="h2">Suggestions</h2>
        {sugg.map(([k, t, sub, act]) => (
          <div key={k} className="card row-flex" style={{ padding: 12 }}><Emoji e={done.includes(k) ? "✅" : "💡"} s={22} /><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{t}</div><div className="muted" style={{ color: "#fff", opacity: .75 }}>{sub}</div></div>
            <button className="pill" disabled={done.includes(k)} onClick={() => { act(); setDone([...done, k]); }}>{done.includes(k) ? "Done" : "Do it"}</button></div>
        ))}
      </div>
    </Screen>
  );
}
