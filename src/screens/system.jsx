import { useState, useEffect } from "react";
import { Screen, Back, Title, Sub, Bar, Tag, Emoji, Btn, Stepper, Toggle, Sheet, SheetHead, Check, Pills, Row, useNav, Field } from "../ui.jsx";
import { Ico, Glyph } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { CATS, ago, fmtDate, fmtTime, weekTotal } from "../data.js";
import { photoOf, openCat } from "./tabs.jsx";
import { PhotoBoxes } from "./scan.jsx";

export function Notifications() {
  const { s, markRead } = useStore(); const { go, open } = useNav();
  const [f, setF] = useState("all");
  let list = s.notifications;
  if (f === "unread") list = list.filter((n) => !n.read); if (f === "orders") list = list.filter((n) => n.kind === "order");
  const act = (n) => { markRead(n.id); if (!n.action) return; const [, r, p] = n.action; r === "order" ? open("order", p) : go(r, p); };
  return (
    <Screen tab="home">
      <Back crumb="Home" right={false}><button className="small link" onClick={() => markRead()}>Mark all read</button></Back>
      <Title>Notifications</Title>
      <div className="stack">
        <Pills value={f} onChange={setF} options={[["all", "All"], ["unread", `Unread · ${s.notifications.filter((n) => !n.read).length}`], ["orders", "Orders"]]} />
        {list.length === 0 && <div className="dashed center" style={{ padding: 26 }}><Emoji e="🔔" s={30} /><p className="small" style={{ marginTop: 8 }}>You're all caught up.</p></div>}
        {list.map((n) => (
          <div key={n.id} className="card row-flex" style={{ alignItems: "flex-start", background: n.read ? "rgba(217,217,217,.09)" : undefined }}>
            <Emoji e={n.emoji} s={24} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="between"><span style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</span><span className="muted" style={{ color: "#fff", opacity: .7 }}>{ago(n.ts)}{!n.read && <i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: "var(--yellow)", marginLeft: 6 }} />}</span></div>
              <div className="small" style={{ opacity: .85, marginTop: 3 }}>{n.body}</div>
              {n.action && <button className="pill" style={{ marginTop: 8, height: 26, fontSize: 11 }} onClick={() => act(n)}>{n.action[0]}</button>}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

export function Search() {
  const { s, addRecent, clearRecent } = useStore(); const { back, go } = useNav();
  const [q, setQ] = useState(""); const [f, setF] = useState("all");
  const t = q.trim().toLowerCase();
  const objects = t ? s.items.filter((i) => i.name.toLowerCase().includes(t) || (i.genre || "").toLowerCase().includes(t)) : [];
  const cats = t ? Object.values(CATS).filter((c) => c.id !== "unsorted" && c.name.toLowerCase().includes(t)) : [];
  const scans = t ? s.scans.filter((x) => x.detections?.some((d) => d.name.toLowerCase().includes(t)) || x.place.toLowerCase().includes(t) || fmtDate(x.ts).toLowerCase().includes(t)) : [];
  const total = objects.length + cats.length + scans.length;
  const hl = (name) => { const i = name.toLowerCase().indexOf(t); if (i < 0 || !t) return name; return <>{name.slice(0, i)}<span style={{ color: "var(--yellow)" }}>{name.slice(i, i + t.length)}</span>{name.slice(i + t.length)}</>; };
  const pick = (fn) => { addRecent(q); fn(); };
  return (
    <Screen tab="home">
      <div className="hdr">
        <label className="row-flex field" style={{ padding: "0 12px", flex: 1, minWidth: 0, borderColor: "var(--yellow)", background: "rgba(255,255,255,.3)" }}>
          <Ico n="search" size={18} color="#514340" />
          <input autoFocus aria-label="Search your room" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addRecent(q)} placeholder="Search objects, scans…" style={{ background: "none", border: 0, outline: "none", flex: 1, minWidth: 0, color: "#fff", fontSize: 15 }} />
          {q && <button aria-label="Clear" className="mini-circle grey" style={{ width: 20, height: 20 }} onClick={() => setQ("")}><Ico n="x" size={12} /></button>}
        </label>
        <button style={{ fontWeight: 600, fontSize: 15, flex: "none" }} onClick={back}>Cancel</button>
      </div>
      <div className="stack">
        {t && <Pills value={f} onChange={setF} options={[["all", `All · ${total}`], ["objects", `Objects · ${objects.length + cats.length}`], ["scans", `Scans · ${scans.length}`]]} />}
        {t && total === 0 && <p className="small center" style={{ padding: 24, opacity: .85 }}>Nothing called “{q}” in your room yet.</p>}
        {(f === "all" || f === "objects") && (cats.length + objects.length > 0) && <span className="lbl">Objects</span>}
        {(f === "all" || f === "objects") && cats.map((c) => <Row key={c.id} emoji={c.emoji} title={hl(c.name)} sub="Category" chev onClick={() => pick(() => openCat(go, c.id))} />)}
        {(f === "all" || f === "objects") && objects.map((i) => <Row key={i.id} emoji={i.emoji || CATS[i.cat].emoji} title={hl(i.name)} sub={`${CATS[i.cat].name}${i.status ? " · " + i.status : ""}`} chev onClick={() => pick(() => (i.cat === "snacks" ? go("snacks") : i.cat === "devices" ? go("speaker") : go("item", { id: i.id })))} />)}
        {(f === "all" || f === "scans") && scans.length > 0 && <span className="lbl">Scans</span>}
        {(f === "all" || f === "scans") && scans.map((x) => <Row key={x.id} emoji="🗂️" title={fmtDate(x.ts)} sub={`${x.count} objects · ${x.place}`} chev onClick={() => pick(() => go("archiveDetail", { id: x.id }))} />)}
        {!t && <>
          <span className="lbl">Recent</span>
          <div className="row-flex" style={{ flexWrap: "wrap", gap: 8 }}>{s.recent.length ? s.recent.map((r) => (
            <span key={r} className="pill" style={{ paddingRight: 6 }}><button className="row-flex" style={{ gap: 6 }} onClick={() => setQ(r)}><Ico n="clock" size={14} />{r}</button><button aria-label={"Remove " + r} onClick={() => clearRecent(r)} style={{ marginLeft: 4 }}><Ico n="x" size={12} /></button></span>
          )) : <span className="small" style={{ opacity: .7 }}>No recent searches.</span>}</div>
          <span className="lbl" style={{ marginTop: 8 }}>Try</span>
          <div className="row-flex" style={{ flexWrap: "wrap", gap: 8 }}>{["chips", "books", "speaker", "plush", "shelf"].map((r) => <button key={r} className="pill" onClick={() => setQ(r)}>{r}</button>)}</div>
        </>}
      </div>
    </Screen>
  );
}

export function ArchiveDetail() {
  const { s, up, say } = useStore(); const { cur, back, go } = useNav();
  const x = s.scans.find((v) => v.id === cur.p.id);
  const [confirm, setConfirm] = useState(false);
  if (!x) return <Screen tab="archive"><Back /><p>This scan was deleted.</p></Screen>;
  const byCat = {}; (x.detections || []).forEach((d) => { byCat[d.cat] = (byCat[d.cat] || 0) + 1; });
  const idx = s.scans.indexOf(x); const prev = s.scans[idx + 1];
  return (
    <Screen tab="archive">
      <Back crumb="Archive" />
      <Title sm>{fmtDate(x.ts)}</Title>
      <Sub>{fmtTime(x.ts)} · {x.place} · {x.count} objects</Sub>
      <div className="stack">
        <div className="panel"><PhotoBoxes src={photoOf(x)} boxes={x.detections || []} maxH={240} /></div>
        <div className="card">
          <div className="h3" style={{ fontSize: 14, marginBottom: 10 }}>{prev ? `Changes since ${new Date(prev.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "First scan of this room"}</div>
          <div className="grid3">{[["+" + x.added, "new", "var(--green)"], ["−" + x.missing, "missing", "var(--red)"], [(x.count - (prev?.count ?? x.count) >= 0 ? "+" : "") + (x.count - (prev?.count ?? x.count)), "net change", "var(--yellow)"]].map(([v, l, c]) => <div key={l} className="inner center"><div style={{ fontSize: 22, fontWeight: 600, color: c }}>{v}</div><div style={{ fontSize: 10, opacity: .8 }}>{l}</div></div>)}</div>
        </div>
        <h2 className="h2">Objects found</h2>
        {Object.entries(byCat).map(([c, n]) => <Row key={c} emoji={CATS[c]?.emoji} title={CATS[c]?.name || c} sub={`${n} item${n === 1 ? "" : "s"}`} chev onClick={() => openCat(go, c)} />)}
        {confirm ? (
          <div className="card stack" style={{ gap: 10 }}><span className="small">Delete this scan? Objects stay in your room; only the scan record and photo are removed.</span>
            <div className="grid2"><button className="pill md" onClick={() => setConfirm(false)}>Keep it</button><button className="btn danger" onClick={() => { up((d) => { d.scans = d.scans.filter((v) => v.id !== x.id); return d; }); say("Scan deleted"); back(); }}>Delete scan</button></div></div>
        ) : (
          <div className="grid2"><button className="pill md" onClick={() => go("live")}>Explore room</button><button className="btn danger" onClick={() => setConfirm(true)}>Delete scan</button></div>
        )}
      </div>
    </Screen>
  );
}

export function Profile() {
  const { s } = useStore(); const { go, open } = useNav();
  const reading = weekTotal(s.weekly.books), sq = weekTotal(s.weekly.sideQuests);
  return (
    <Screen tab="home">
      <Back crumb="Home" right={false} />
      <div className="center">
        <div className="circle-btn" style={{ width: 96, height: 96, margin: "0 auto", border: "1.5px solid rgba(255,255,255,.5)" }}>{s.user.photo ? <img src={s.user.photo} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : <Glyph name="avatar" size={48} color="#51433C" />}</div>
        <div style={{ fontSize: 22, fontWeight: 600, marginTop: 12 }}>{s.user.name || "Your name"}</div>
        <div className="small" style={{ opacity: .8, marginTop: 4 }}>{s.user.email}</div>
        <span className="pill" style={{ marginTop: 10, height: 26, fontSize: 11 }}>Member since {s.user.since}</span>
      </div>
      <div className="stack" style={{ marginTop: 14 }}>
        <div className="grid3">{[[1, "Room"], [s.scans.length, "Scans"], [s.items.length, "Objects"]].map(([v, l]) => <div key={l} className="card tight center"><div style={{ fontSize: 26, fontWeight: 600 }}>{v}</div><div style={{ fontSize: 11, opacity: .8 }}>{l}</div></div>)}</div>
        <Btn onClick={() => go("editProfile")}>Edit profile</Btn>
        <h2 className="h2">Your goals</h2>
        {[["📚", `Read ${s.goals.reading} hrs a week`, `${reading} / ${s.goals.reading} hrs`, reading / s.goals.reading], ["⭐", `Side quests ${s.goals.sideQuests} hrs a week`, `${sq} / ${s.goals.sideQuests} hrs`, sq / s.goals.sideQuests], ["🍿", `Under ${s.goals.kcal.toLocaleString()} kcal of snacks`, `${s.kcalWeek} / ${s.goals.kcal.toLocaleString()} kcal`, s.kcalWeek / s.goals.kcal]].map(([e, t, sub, v]) => (
          <div key={t} className="row"><span className="emoji" style={{ fontSize: 22 }}>{e}</span><span className="grow"><span className="t">{t}</span><span className="s">{sub}</span></span><div style={{ width: 80 }}><Bar v={v} h="thin" /></div></div>
        ))}
        <h2 className="h2">Account</h2>
        <Row emoji="⚙️" title="Settings" chev onClick={() => go("appSettings")} />
        <Row emoji="🔗" title="Connected devices" value={`${s.devices.filter((d) => d.connected).length} devices`} chev onClick={() => go("devices")} />
        <Row emoji="💬" title="Help & feedback" chev onClick={() => go("help")} />
        <Row emoji="🚪" title="Log out" tone="var(--red)" onClick={() => open("logout")} />
      </div>
    </Screen>
  );
}

export function EditProfile() {
  const { s, setUser, setGoals, say } = useStore(); const { back } = useNav();
  const [name, setName] = useState(s.user.name); const [email, setEmail] = useState(s.user.email); const [g, setG] = useState(s.goals); const [photo, setPhoto] = useState(s.user.photo);
  const pickPhoto = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 160; const sc = Math.max(160 / img.width, 160 / img.height); c.getContext("2d").drawImage(img, (160 - img.width * sc) / 2, (160 - img.height * sc) / 2, img.width * sc, img.height * sc); setPhoto(c.toDataURL("image/jpeg", 0.8)); }; img.src = r.result; }; r.readAsDataURL(f); };
  return (
    <Screen>
      <Back crumb="Profile" right={false} />
      <Title sm>Edit profile</Title>
      <div className="center" style={{ margin: "8px 0 16px" }}>
        <label style={{ position: "relative", display: "inline-block", cursor: "pointer" }}>
          <div className="circle-btn" style={{ width: 96, height: 96, border: "1.5px solid rgba(255,255,255,.5)" }}>{photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : <Glyph name="avatar" size={48} color="#51433C" />}</div>
          <span className="circle-btn" style={{ position: "absolute", right: -4, bottom: 0, width: 32, height: 32, background: "var(--tan)" }}><Emoji e="📷" s={15} /></span>
          <input type="file" accept="image/*" className="vh" onChange={pickPhoto} aria-label="Change photo" />
        </label>
        <div className="small link" style={{ marginTop: 8 }}>Change photo</div>
      </div>
      <div className="stack">
        <Field id="ep-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field id="ep-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <span className="lbl">Weekly goals</span>
        <div className="row"><span className="emoji">📚</span><span className="grow t">Reading</span><Stepper v={g.reading} onChange={(v) => setG({ ...g, reading: v })} min={1} suffix=" h" /></div>
        <div className="row"><span className="emoji">⭐</span><span className="grow t">Side quests</span><Stepper v={g.sideQuests} onChange={(v) => setG({ ...g, sideQuests: v })} min={1} suffix=" h" /></div>
        <div className="row"><span className="emoji">🍿</span><span className="grow t">Snack limit</span><Stepper v={g.kcal} onChange={(v) => setG({ ...g, kcal: v })} min={100} step={100} /></div>
        <Btn cls="lg" chev={false} onClick={() => { setUser({ name: name.trim(), email: email.trim(), photo }); setGoals(g); say("Profile saved"); back(); }}>Save changes</Btn>
      </div>
    </Screen>
  );
}

export function AppSettings() {
  const { s, setSetting } = useStore(); const { go, open } = useNav();
  return (
    <Screen tab="home">
      <Back crumb="Profile" />
      <Title>Settings</Title>
      <div className="stack" style={{ gap: 8 }}>
        <span className="lbl" style={{ marginTop: 6 }}>Room</span>
        <Row title="Room name" value={s.room.name} chev onClick={() => open("roomName")} />
        <Row title="Room type" value={s.room.type} chev onClick={() => open("roomName")} />
        <Row title="Scan frequency" value={s.settings.scanFreq} chev onClick={() => open("frequency")} />
        <Row title="Notifications"><Toggle on={s.settings.notifications} onChange={(v) => setSetting("notifications", v)} label="Notifications" /></Row>
        <Row title="What ROOM.OS tracks" value={Object.values(s.track).filter(Boolean).length + " categories"} chev onClick={() => go("setup")} />
        <span className="lbl" style={{ marginTop: 10 }}>Privacy & devices</span>
        <Row title="Privacy & data" chev onClick={() => go("privacy")} />
        <Row title="Connected devices" value={`${s.devices.filter((d) => d.connected).length} devices`} chev onClick={() => go("devices")} />
        <span className="lbl" style={{ marginTop: 10 }}>App</span>
        <Row title="Theme" value="Glass (dark)" />
        <Row title="About ROOM.OS" value="v1.0 · COCO-SSD on device" />
      </div>
    </Screen>
  );
}

export function Privacy() {
  const { s, setSetting, up, say } = useStore(); const { go } = useNav();
  const [confirm, setConfirm] = useState(false);
  const photos = s.scans.filter((x) => x.photo && x.photo !== "sample").length;
  let bytes = 0; try { bytes = (localStorage.getItem("roomos-app-v1") || "").length; } catch (e) { /* blocked */ }
  return (
    <Screen tab="home">
      <Back crumb="Settings" />
      <Title sm>Privacy & data</Title><Sub>Choose what ROOM.OS keeps.</Sub>
      <div className="stack" style={{ gap: 8 }}>
        <span className="lbl">Scanning</span>
        {[["onDevice", "Process scans on device", "Photos never leave your phone"], ["savePhotos", "Save scan photos", "Needed to compare scans over time"], ["blur", "Blur faces & screens", "Hides people in saved scans"], ["usage", "Share usage data", "Helps improve detection"]].map(([k, t, sub]) => (
          <Row key={k} title={t} sub={sub}><Toggle on={s.settings[k]} onChange={(v) => setSetting(k, v)} label={t} /></Row>
        ))}
        <span className="lbl" style={{ marginTop: 10 }}>Your data</span>
        <div className="row"><span className="grow"><span className="t">Storage used</span><span className="s">{(bytes / 1024).toFixed(0)} KB on this phone · {photos} scan photo{photos === 1 ? "" : "s"}</span></span><div style={{ width: 120 }}><Bar v={Math.min(1, bytes / 4.5e6)} /></div></div>
        <Row title="Delete all scans" sub="Objects stay; scan records and photos are removed" tone="var(--red)" chev onClick={() => setConfirm(true)} />
        {confirm && <div className="card stack" style={{ gap: 10 }}><span className="small">Delete all {s.scans.length} scans? This can't be undone.</span>
          <div className="grid2"><button className="pill md" onClick={() => setConfirm(false)}>Cancel</button><button className="btn danger" onClick={() => { up((d) => { d.scans = []; return d; }); setConfirm(false); say("All scans deleted"); }}>Delete all</button></div></div>}
        <Row title="Reset the app" sub="Start over with an empty room" tone="var(--red)" chev onClick={() => go("resetApp")} />
      </div>
    </Screen>
  );
}

export function ResetApp() {
  const { reset } = useStore(); const nav = useNav();
  return (
    <Screen>
      <Back crumb="Privacy & data" right={false} />
      <div className="center" style={{ marginTop: 40 }}><Emoji e="🧹" s={60} /><Title sm>Reset ROOM.OS?</Title><Sub>Your scans, objects, goals and orders on this phone will be erased.</Sub></div>
      <div className="stack" style={{ marginTop: 20 }}><button className="btn lg danger" onClick={() => { reset(); nav.reset("splash"); }}>Erase and start over</button><button className="pill lg" onClick={nav.back}>Cancel</button></div>
    </Screen>
  );
}

export function Devices() {
  const { s, up, say } = useStore(); const { go } = useNav();
  const toggle = (id) => up((d) => { const v = d.devices.find((x) => x.id === id); v.connected = !v.connected; const sp = d.items.find((i) => i.cat === "devices" && i.name === v.name); if (sp) sp.connected = v.connected; return d; });
  return (
    <Screen tab="home">
      <Back crumb="Settings" />
      <Title sm>Connected devices</Title><Sub>{s.devices.filter((d) => d.connected).length} devices connected to {s.room.name}.</Sub>
      <div className="stack">
        {s.devices.map((d) => (
          <div key={d.id} className="card">
            <div className="row-flex" style={{ alignItems: "flex-start" }}>
              <div className="inner" style={{ width: 56, height: 56, display: "grid", placeItems: "center", flex: "none" }}><Emoji e={d.emoji} s={28} /></div>
              <div style={{ flex: 1 }}><div className="between"><span style={{ fontSize: 16, fontWeight: 600 }}>{d.name}</span><Tag tone={d.connected ? "green" : "grey"}>{d.connected ? "Connected" : "Not connected"}</Tag></div>
                <div className="small" style={{ opacity: .8, marginTop: 3 }}>{d.sub}</div>
                {d.battery != null && <div className="row-flex" style={{ marginTop: 8 }}><Emoji e="🔋" s={12} /><Bar v={d.battery} c="var(--green)" h="thin" /><span className="small">{Math.round(d.battery * 100)}%</span></div>}</div>
            </div>
            <div className="grid2" style={{ marginTop: 12 }}>
              {d.connected ? <><button className="pill md" onClick={() => (d.name.includes("speaker") ? go("speaker") : say("Camera is used during scans"))}>Settings</button><button className="pill md red" onClick={() => { toggle(d.id); say(d.name + " disconnected"); }}>Disconnect</button></>
                : <button className="btn" style={{ gridColumn: "1 / -1" }} onClick={() => { toggle(d.id); say(d.name + " connected"); }}>Connect <Ico n="chev" size={16} /></button>}
            </div>
          </div>
        ))}
        <button className="dashed center tap" style={{ padding: 20 }} onClick={() => go("addDevice")}><span className="circle-btn" style={{ width: 48, height: 48, margin: "0 auto" }}><Ico n="plus" size={24} /></span><div style={{ fontWeight: 600, marginTop: 8 }}>Add a device</div><div className="small" style={{ opacity: .75 }}>Turn on Bluetooth and keep it close.</div></button>
      </div>
    </Screen>
  );
}

export function AddDevice() {
  const { up, say } = useStore(); const { back } = useNav();
  const [found, setFound] = useState([]);
  useEffect(() => { const t1 = setTimeout(() => setFound((f) => [...f, ["💡", "Desk lamp", "Smart bulb · strong signal"]]), 1200); const t2 = setTimeout(() => setFound((f) => [...f, ["⌚", "Fitness band", "Bluetooth · medium signal"]]), 2600); return () => { clearTimeout(t1); clearTimeout(t2); }; }, []);
  return (
    <Screen tab="home">
      <Back crumb="Connected devices" />
      <Title sm>Add a device</Title><Sub>{found.length < 2 ? "Searching for devices nearby…" : `Found ${found.length} devices nearby`}</Sub>
      <div style={{ position: "relative", height: 220, display: "grid", placeItems: "center" }}>
        {[200, 150, 100].map((sz, i) => <i key={sz} style={{ position: "absolute", width: sz, height: sz, borderRadius: "50%", border: `1.5px solid rgba(255,204,0,${0.3 + i * 0.2})`, background: `rgba(255,204,0,${0.04 + i * 0.04})`, animation: found.length < 2 ? `glow 1.8s ${i * 0.3}s infinite` : "none" }} />)}
        <span className="circle-btn" style={{ width: 60, height: 60, background: "var(--tan)", border: "1.5px solid rgba(255,255,255,.6)" }}><Ico n="bt" size={30} /></span>
      </div>
      <div className="stack">
        <h2 className="h2">Found nearby</h2>
        {found.map(([e, n, sub]) => (
          <div key={n} className="card row-flex"><div className="inner" style={{ width: 48, height: 48, display: "grid", placeItems: "center", flex: "none" }}><Emoji e={e} s={24} /></div><div style={{ flex: 1 }}><div className="h3">{n}</div><div className="small" style={{ opacity: .8 }}>{sub}</div></div>
            <button className="pill" onClick={() => { up((d) => { d.devices.push({ id: "dv" + Date.now(), name: n, emoji: e, sub, connected: true }); return d; }); say(n + " connected"); back(); }}>Connect</button></div>
        ))}
        <div className="card row-flex"><Emoji e="💡" s={20} /><span className="small">Can't see your device? Turn its Bluetooth on and keep it within 2 metres.</span></div>
      </div>
    </Screen>
  );
}

export function Help() {
  const { say, addFeedback } = useStore(); const [msg, setMsg] = useState("");
  return (
    <Screen tab="home">
      <Back crumb="Profile" />
      <Title sm>Help & feedback</Title>
      <div className="stack">
        {[["How does scanning work?", "ROOM.OS runs a COCO-SSD object detection model on your phone. It checks the whole photo, then zooms into each part, and outlines everything it recognises."], ["What can it recognise?", "80 everyday things: books, bottles, cups, plush toys, phones, laptops, plants, vases, clocks and more. Anything else you can name yourself on the results screen."], ["Where is my data?", "Everything is saved on this phone only. Nothing is uploaded."]].map(([q, a]) => (
          <details key={q} className="card"><summary style={{ fontWeight: 600, cursor: "pointer" }}>{q}</summary><p className="small" style={{ marginTop: 8, lineHeight: 1.5, opacity: .9 }}>{a}</p></details>
        ))}
        <label className="fieldwrap" htmlFor="fb"><span className="lbl">Send feedback</span><textarea id="fb" className="field" rows={4} style={{ height: "auto", borderRadius: 18, padding: 14 }} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="What should ROOM.OS do better?" /></label>
        <Btn disabled={!msg.trim()} onClick={() => { addFeedback(msg.trim()); setMsg(""); say("Thanks! Feedback saved on this phone"); }}>Send</Btn>
      </div>
    </Screen>
  );
}

/* ---------------- sheets ---------------- */
export function FrequencySheet() {
  const { s, setSetting, say } = useStore(); const { close } = useNav();
  const [v, setV] = useState(s.settings.scanFreq); const [away, setAway] = useState(s.settings.awayOnly);
  return (
    <Sheet>
      <SheetHead title="Scan frequency" sub="How often should ROOM.OS check your room?" />
      <div className="stack" style={{ gap: 8 }}>
        {["Every hour", "Every 6 hours", "Twice a day", "Once a day", "Only when I scan"].map((o) => (
          <button key={o} className={"row" + (v === o ? " warn" : "")} onClick={() => setV(o)} role="radio" aria-checked={v === o}><span className="grow t">{o}</span>{o === "Every 6 hours" && <Tag tone="yellow">Recommended</Tag>}<span className={"radio" + (v === o ? " on" : "")} /></button>
        ))}
      </div>
      <div className="between" style={{ margin: "16px 0" }}><div><div className="h3" style={{ fontSize: 14 }}>Only while I'm away</div><div className="muted" style={{ color: "#fff", opacity: .75 }}>Pauses scans when your phone is in the room</div></div><Toggle on={away} onChange={setAway} label="Only while away" /></div>
      <Btn cls="lg" chev={false} onClick={() => { setSetting("scanFreq", v); setSetting("awayOnly", away); say("Scan frequency: " + v); close(); }}>Done</Btn>
      <p className="muted center" style={{ marginTop: 8 }}>Automatic scans need a connected room camera.</p>
    </Sheet>
  );
}
export function RoomNameSheet() {
  const { s, setRoom, say } = useStore(); const { close } = useNav();
  const [n, setN] = useState(s.room.name); const [t, setT] = useState(s.room.type);
  return (
    <Sheet>
      <SheetHead title="Your room" />
      <div className="stack">
        <Field id="rn" label="Room name" value={n} onChange={(e) => setN(e.target.value)} />
        <span className="lbl">Room type</span>
        <div className="row-flex" style={{ gap: 6 }}>{["Bedroom", "Study", "Dorm", "Studio"].map((x) => <button key={x} className={"chip" + (t === x ? " on" : "")} style={{ flex: 1, padding: 0 }} onClick={() => setT(x)}>{x}</button>)}</div>
        <Btn cls="lg" chev={false} onClick={() => { setRoom({ name: n.trim() || s.room.name, type: t }); say("Room updated"); close(); }}>Save</Btn>
      </div>
    </Sheet>
  );
}
export function LogoutSheet() {
  const { logOut } = useStore(); const { close, reset } = useNav(); const [all, setAll] = useState(false);
  return (
    <Sheet>
      <div className="center">
        <span className="circle-btn" style={{ width: 60, height: 60, margin: "0 auto", background: "rgba(255,140,128,.3)" }}><Ico n="logout" size={30} /></span>
        <div className="title sm" style={{ marginTop: 12 }}>Log out of ROOM.OS?</div>
        <p className="small" style={{ opacity: .85, lineHeight: 1.45, margin: "6px 10px 14px" }}>Your room, scans and inventory stay saved on this phone. You'll need to log in again to see them.</p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Check on={all} onChange={setAll}>Log out on all devices</Check></div>
      </div>
      <div className="grid2"><button className="pill lg" onClick={close}>Cancel</button><button className="btn lg danger" onClick={() => { logOut(); reset("splash"); }}>Log out</button></div>
    </Sheet>
  );
}
