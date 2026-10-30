import { useEffect, useRef, useState } from "react";
import { Screen, Back, Title, Sub, Btn, Emoji, Halo, Sheet, SheetHead, Check, Tag, useNav, Pills } from "../ui.jsx";
import { Ico } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { ROOM_PHOTO, CATS, CAT_ORDER, healthScore, weekTotal } from "../data.js";
import { loadModel, detectFast, detectPhoto, prepImage, backendName } from "../detector.js";
import { photoOf, openCat } from "./tabs.jsx";

const PLACES = ["Shelf, left wall", "Desk", "Bedside", "Wardrobe"];

/** An image with normalised detection boxes drawn on top. */
export function PhotoBoxes({ src, boxes, sel, onSel, maxH, radius = 16 }) {
  const [ratio, setRatio] = useState(16 / 9);
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: ratio, maxHeight: maxH, borderRadius: radius, overflow: "hidden", margin: "0 auto" }}>
      <img src={src} alt="Scanned area" onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)} style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }} />
      {boxes.map((b, i) => (
        <button key={i} className={"box" + (sel === i ? " sel" : "")} onClick={() => onSel?.(i)} aria-label={b.name}
          style={{ left: b.box[0] * 100 + "%", top: b.box[1] * 100 + "%", width: b.box[2] * 100 + "%", height: b.box[3] * 100 + "%", opacity: b.keep === false ? 0.35 : 1, cursor: onSel ? "pointer" : "default" }}>
          <span className="lab" style={b.box[1] < 0.14 ? { bottom: "auto", top: 2, left: 2 } : null}>{b.name}{b.score != null ? ` · ${Math.round(b.score * 100)}%` : ""}</span>
        </button>
      ))}
    </div>
  );
}

export function Scan() {
  const { back, replace } = useNav(); const { setPending, s } = useStore();
  const [mode, setMode] = useState("starting"); // starting | live | pick | analyzing
  const [status, setStatus] = useState("Starting camera…");
  const [model, setModel] = useState(null);
  const [live, setLive] = useState([]);
  const [prog, setProg] = useState(0);
  const [still, setStill] = useState(null);
  const [found, setFound] = useState(0);
  const [err, setErr] = useState("");
  const vid = useRef(null), wrap = useRef(null), stream = useRef(null), alive = useRef(true);
  const fileCam = useRef(null), fileLib = useRef(null);

  useEffect(() => {
    alive.current = true;
    loadModel((m) => alive.current && setStatus(m)).then((m) => alive.current && setModel(m)).catch(() => alive.current && setErr("The AI model couldn't load. Check your connection and try again."));
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera api");
        const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } }, audio: false });
        if (!alive.current) { st.getTracks().forEach((t) => t.stop()); return; }
        stream.current = st; vid.current.srcObject = st; await vid.current.play(); setMode("live");
      } catch (e) { if (alive.current) setMode("pick"); }
    })();
    return () => { alive.current = false; stream.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  // live preview detections
  useEffect(() => {
    if (mode !== "live" || !model) return;
    let stop = false;
    (async function loop() {
      while (!stop && alive.current) {
        const v = vid.current;
        if (v && v.videoWidth) { try { setLive(await detectFast(model, v, v.videoWidth, v.videoHeight)); } catch (e) { /* frame skipped */ } }
        await new Promise((r) => setTimeout(r, 450));
      }
    })();
    return () => { stop = true; };
  }, [mode, model]);

  async function analyze(src) {
    setMode("analyzing"); setProg(0); setFound(0);
    try {
      const p = await prepImage(src);
      setStill(p.full);
      const m = model || (await loadModel(setStatus));
      const rows = await detectPhoto(m, p.img, (f, n) => { setProg(f); setFound(n); });
      stream.current?.getTracks().forEach((t) => t.stop());
      if (!rows.length) return replace("failed");
      rows.forEach((r) => { if (r.score < 0.45 || r.cat === "unsorted") r.review = true; });
      setPending({ photo: p.full, thumb: p.thumb, rows, place: s.scans[0]?.place || PLACES[0] });
      replace("results");
    } catch (e) { setErr("Something went wrong reading that photo. Try another one."); setMode(stream.current ? "live" : "pick"); }
  }
  function captureFrame() {
    const v = vid.current; const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0); analyze(c.toDataURL("image/jpeg", 0.9));
  }
  const onFile = (e) => { const f = e.target.files?.[0]; if (f) analyze(f); e.target.value = ""; };

  // map normalised video boxes into the cover-fitted element
  const W = wrap.current?.clientWidth || 390, H = wrap.current?.clientHeight || 844;
  const vw = vid.current?.videoWidth || 16, vh = vid.current?.videoHeight || 9;
  const sc = Math.max(W / vw, H / vh), ox = (W - vw * sc) / 2, oy = (H - vh * sc) / 2;

  return (
    <div className="screen" ref={wrap}>
      <div className="cam">
        <video ref={vid} playsInline muted style={{ display: mode === "live" ? "block" : "none" }} />
        {mode !== "live" && !still && <div className="room-bg" style={{ backgroundImage: `url(${ROOM_PHOTO})` }} />}
        {mode === "analyzing" && still && <img className="frame" src={still} alt="" style={{ objectFit: "contain", background: "#111" }} />}
        <div className="topshade" />
        {mode === "live" && live.map((b, i) => (
          <div key={i} className="box" style={{ left: ox + b.box[0] * vw * sc, top: oy + b.box[1] * vh * sc, width: b.box[2] * vw * sc, height: b.box[3] * vh * sc }}><span className="lab">{b.name} · {Math.round(b.score * 100)}%</span></div>
        ))}
        {(mode === "live" || mode === "analyzing") && <>
          <span className="corner" style={{ top: 120, left: 24, borderRight: 0, borderBottom: 0 }} /><span className="corner" style={{ top: 120, right: 24, borderLeft: 0, borderBottom: 0 }} />
          <span className="corner" style={{ bottom: 300, left: 24, borderRight: 0, borderTop: 0 }} /><span className="corner" style={{ bottom: 300, right: 24, borderLeft: 0, borderTop: 0 }} />
          <div className="scanline" />
        </>}
      </div>
      <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top,0px) + 14px)", left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 3 }}>
        <button className="circle-btn" style={{ width: 40, height: 40, background: "rgba(0,0,0,.35)" }} aria-label="Close scan" onClick={back}><Ico n="x" size={20} /></button>
        <div className="pill md" style={{ background: "rgba(0,0,0,.45)" }}><i style={{ width: 8, height: 8, borderRadius: 4, background: mode === "analyzing" || mode === "live" ? "var(--yellow)" : "var(--track)" }} />{mode === "analyzing" ? "Scanning…" : mode === "live" ? (model ? "Live detection" : "Loading AI…") : "New scan"}</div>
        <span style={{ width: 40 }} />
      </div>

      <div className="sheet" style={{ animation: "none", zIndex: 4 }}>
        {err && <p className="small" role="alert" style={{ color: "var(--red)", marginBottom: 10 }}>{err}</p>}
        {mode === "starting" && <div className="row-flex"><span className="spinner" /><span className="small">{status}</span></div>}
        {mode === "live" && <>
          <div className="between"><div><div className="h3">{model ? `${live.length} objects in view` : "Loading AI model…"}</div><div className="small" style={{ opacity: .8, marginTop: 2 }}>{model ? "Hold steady, then tap Scan for a full check." : status}</div></div>{!model && <span className="spinner" />}</div>
          <div className="pills" style={{ marginTop: 12 }}>{live.slice(0, 6).map((b, i) => <span key={i} className="chip" style={{ height: 34 }}><Emoji e={b.emoji} s={15} />{b.name}</span>)}</div>
          <div className="row-flex" style={{ marginTop: 14 }}>
            <button className="pill lg" style={{ flex: "none", width: 120 }} onClick={() => fileLib.current.click()}>Photos</button>
            <Btn cls="lg" onClick={captureFrame} disabled={!model}>Scan & review</Btn>
          </div>
        </>}
        {mode === "pick" && <>
          <div className="h3" style={{ fontSize: 18 }}>Scan a shelf or desk</div>
          <p className="small" style={{ opacity: .85, margin: "6px 0 14px", lineHeight: 1.45 }}>Take a photo with your camera. The AI model runs on this phone and outlines every object it finds.</p>
          <div className="stack" style={{ gap: 10 }}>
            <button className="btn lg" onClick={() => fileCam.current.click()}><Ico n="camera" size={20} /> Take photo</button>
            <div className="row-flex">
              <button className="pill lg" style={{ flex: 1 }} onClick={() => fileLib.current.click()}><Ico n="image" size={18} /> Choose photo</button>
              <button className="pill lg" style={{ flex: 1 }} onClick={() => analyze(ROOM_PHOTO)}>Try sample</button>
            </div>
            <div className="row-flex small" style={{ opacity: .75 }}>{model ? <><Ico n="check" size={14} color="#73cc80" /> AI model ready ({backendName() === "webgl" ? "GPU" : "CPU"})</> : <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> {status}</>}</div>
          </div>
        </>}
        {mode === "analyzing" && <>
          <div className="row-flex"><span className="big">{Math.round(prog * 100)}%</span><div><div className="h3">{model ? "Finding objects" : status}</div><div className="small" style={{ opacity: .8 }}>{found} candidate{found === 1 ? "" : "s"} so far</div></div></div>
          <div className="bar thick" style={{ marginTop: 12 }}><i style={{ width: prog * 100 + "%" }} /><i className="o" style={{ width: prog * 60 + "%" }} /></div>
          <p className="small" style={{ opacity: .7, marginTop: 10 }}>Checking the whole frame, then zooming into each part of it.</p>
        </>}
        <input ref={fileCam} type="file" accept="image/*" capture="environment" className="vh" onChange={onFile} aria-label="Take a photo" />
        <input ref={fileLib} type="file" accept="image/*" className="vh" onChange={onFile} aria-label="Choose a photo" />
      </div>
    </div>
  );
}

export function Results() {
  const { pending, setPending, saveScan } = useStore(); const { open, replace, back } = useNav();
  const [sel, setSel] = useState(null);
  if (!pending) return <Screen><Back right={false} /><p>No scan to review.</p></Screen>;
  const rows = pending.rows;
  const setRow = (i, patch) => setPending({ ...pending, rows: rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const kept = rows.filter((r) => r.keep);
  const cats = new Set(kept.map((r) => r.cat).filter((c) => c !== "unsorted"));
  const review = kept.filter((r) => r.review).length;
  return (
    <Screen>
      <Back right={false} crumb="Scan" onBack={() => { setPending(null); back(); }} />
      <Title sm>Scan complete</Title>
      <Sub>{rows.length} objects found. Check them before saving.</Sub>
      <div className="stack">
        <div className="panel"><PhotoBoxes src={pending.photo} boxes={rows} sel={sel} onSel={(i) => { setSel(i); open("choose", { i }); }} maxH={260} /></div>
        <div className="grid3">
          {[[kept.length, "objects", ""], [cats.size, "categories", ""], [review, "to review", review ? "var(--yellow)" : ""]].map(([v, l, c]) => (
            <div key={l} className="card tight center"><div style={{ fontSize: 24, fontWeight: 600, color: c || undefined }}>{v}</div><div style={{ fontSize: 11, opacity: .8 }}>{l}</div></div>
          ))}
        </div>
        <div><span className="lbl">Where is this?</span><div style={{ marginTop: 8 }}><Pills value={pending.place} onChange={(p) => setPending({ ...pending, place: p })} options={PLACES.map((p) => [p, p.split(",")[0]])} /></div></div>
        <div className="between"><h2 className="h2">Detected objects</h2><button className="pill" onClick={() => setPending({ ...pending, rows: rows.map((r) => ({ ...r, keep: true, review: false })) })}>Confirm all</button></div>
        {rows.map((r, i) => (
          <div key={i} className={"row" + (r.review && r.keep ? " warn" : "")} style={{ opacity: r.keep ? 1 : 0.5 }}>
            <Emoji e={r.emoji} s={24} />
            <button className="grow" style={{ textAlign: "left" }} onClick={() => open("choose", { i })}>
              <span className="t">{r.name}</span><span className="s">{r.cat === "unsorted" ? "Unsorted · tap to choose" : CATS[r.cat].name}{!r.keep ? " · removed" : ""}</span>
            </button>
            <span className="v" style={{ color: r.score < 0.45 ? "var(--yellow)" : undefined }}>{Math.round(r.score * 100)}%</span>
            <button className={"mini-circle green" + (r.keep && !r.review ? " on" : "")} aria-label={"Confirm " + r.name} onClick={() => setRow(i, { keep: true, review: false })}><Ico n="check" size={16} /></button>
            <button className="mini-circle red" aria-label={"Remove " + r.name} onClick={() => setRow(i, { keep: false })}><Ico n="x" size={16} /></button>
          </div>
        ))}
        <div className="row-flex" style={{ marginTop: 6 }}>
          <button className="pill lg" style={{ width: 120 }} onClick={() => { setPending(null); replace("scan"); }}>Rescan</button>
          <Btn cls="lg" disabled={!kept.length} onClick={() => { const r = saveScan(pending); setPending(null); replace("saved", r); }}>Save to room</Btn>
        </div>
      </div>
    </Screen>
  );
}

export function ChooseSheet() {
  const { pending, setPending } = useStore(); const { sheet, close } = useNav();
  const i = sheet.p.i; const r = pending?.rows[i];
  const [name, setName] = useState(r?.name || ""); const [cat, setCat] = useState(r?.cat || "unsorted"); const [ignore, setIgnore] = useState(r ? !r.keep : false);
  if (!r) return null;
  const save = () => { setPending({ ...pending, rows: pending.rows.map((x, j) => (j === i ? { ...x, name: name.trim() || x.name, cat, emoji: cat !== x.cat && CATS[cat] ? CATS[cat].emoji : x.emoji, keep: !ignore, review: false } : x)) }); close(); };
  return (
    <Sheet>
      <SheetHead title="What is this?" />
      <div className="card row-flex" style={{ padding: 10 }}><Emoji e={r.emoji} s={30} /><div><div className="h3">{r.name}</div><div className="small" style={{ opacity: .8 }}>{Math.round(r.score * 100)}% sure · detected as “{r.cls}”</div></div></div>
      <label className="fieldwrap" style={{ marginTop: 14 }} htmlFor="ch-name"><span className="lbl">Name</span><input id="ch-name" className="field" value={name} onChange={(e) => setName(e.target.value)} /></label>
      <div className="lbl" style={{ margin: "14px 0 8px" }}>Category</div>
      <div className="grid3">{[...CAT_ORDER, "unsorted"].map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)} aria-pressed={cat === c}><Emoji e={CATS[c].emoji} s={16} />{CATS[c].name}</button>)}</div>
      <div style={{ margin: "14px 0" }}><Check on={ignore} onChange={setIgnore}>Don't track this object</Check></div>
      <div className="row-flex"><button className="pill lg" style={{ width: 140 }} onClick={close}>Cancel</button><Btn cls="lg" chev={false} onClick={save}>Save</Btn></div>
    </Sheet>
  );
}

export function Saved() {
  const { cur, reset } = useNav(); const { s } = useStore(); const r = cur.p;
  return (
    <Screen>
      <div style={{ paddingTop: 50 }} className="center">
        <Halo />
        <Title>Saved to your room!</Title>
        <Sub>{r.count} objects added to {s.room.name}</Sub>
      </div>
      <div className="card stack" style={{ gap: 8, marginTop: 10 }}>
        <div className="row"><span className="emoji">✨</span><span className="grow t">New objects</span><span className="v" style={{ color: "var(--green)" }}>+{r.added}</span></div>
        <div className="row"><span className="emoji">🔄</span><span className="grow t">Objects updated</span><span className="v">{r.updated}</span></div>
        <div className="row"><span className="emoji">📊</span><span className="grow t">Room Health Score</span><span className="v" style={{ color: "var(--yellow)" }}>{healthScore(s)}</span></div>
      </div>
      <div className="stack" style={{ marginTop: 40 }}>
        <Btn cls="lg" onClick={() => reset("home")}>Go to Home</Btn>
        <button className="small" style={{ fontWeight: 600, padding: 8 }} onClick={() => reset("objects")}>View objects</button>
      </div>
    </Screen>
  );
}

export function Failed() {
  const { replace, back } = useNav(); const [tips, setTips] = useState(false);
  return (
    <Screen>
      <div className="hdr"><button className="circle-btn" aria-label="Close" onClick={back}><Ico n="x" size={20} /></button></div>
      <div className="card center" style={{ background: "rgba(0,0,0,.3)", padding: 22, marginTop: 30 }}>
        <Emoji e="⚠️" s={56} />
        <div style={{ fontSize: 22, fontWeight: 600, margin: "12px 0 6px" }}>We couldn't see your room clearly</div>
        <p className="small" style={{ opacity: .85, marginBottom: 14 }}>ROOM.OS found 0 objects. This usually happens when:</p>
        <div className="stack" style={{ gap: 8, textAlign: "left" }}>
          {[["💡", "The room is too dark"], ["🤳", "The camera moved too fast"], ["🙈", "The lens is covered or smudged"]].map(([e, t]) => <div key={t} className="row"><Emoji e={e} s={20} /><span className="t">{t}</span></div>)}
        </div>
        {tips && <p className="small" style={{ textAlign: "left", marginTop: 12, lineHeight: 1.5 }}>Stand about 1–2 metres back, fill the frame with one shelf, and turn on the room light. Books, bottles, cups, plush toys and phones are easiest to spot.</p>}
        <p className="small" style={{ opacity: .7, margin: "12px 0" }}>Nothing was saved from this scan.</p>
        <div className="row-flex"><button className="pill lg" style={{ width: 140 }} onClick={() => setTips(!tips)}>{tips ? "Hide tips" : "Scan tips"}</button><Btn cls="lg" onClick={() => replace("scan")}>Try again</Btn></div>
      </div>
    </Screen>
  );
}

export function LiveRoom() {
  const { s, byCat } = useStore(); const { go, back } = useNav();
  const scan = s.scans[0]; const boxes = scan?.detections || [];
  const [sel, setSel] = useState(boxes.findIndex((b) => b.cat === "devices"));
  const b = boxes[sel];
  const match = b && byCat(b.cat).find((i) => i.name.toLowerCase() === b.name.toLowerCase());
  return (
    <div className="screen" style={{ background: "#111" }}>
      <div className="topshade" style={{ zIndex: 2 }} />
      <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top,0px) + 14px)", left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 3 }}>
        <button className="circle-btn" style={{ width: 40, height: 40, background: "rgba(0,0,0,.35)" }} aria-label="Back" onClick={back}><Ico n="back" size={20} /></button>
        <div className="pill md" style={{ background: "rgba(0,0,0,.45)" }}><i style={{ width: 8, height: 8, borderRadius: 4, background: "var(--red)" }} />Your room</div>
        <span className="pill" style={{ background: "rgba(0,0,0,.45)", fontSize: 10 }}>{boxes.length} objects</span>
      </div>
      <div style={{ position: "absolute", inset: "90px 0 260px", display: "grid", placeItems: "center", padding: "0 8px" }}>
        {scan ? <PhotoBoxes src={photoOf(scan)} boxes={boxes} sel={sel} onSel={setSel} radius={12} /> : <p className="small">Scan your room to explore it here.</p>}
      </div>
      <div className="sheet" style={{ animation: "none" }}>
        {b ? <>
          <div className="row-flex">
            <div className="circle-btn" style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,.15)" }}><Emoji e={b.emoji} s={28} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 600 }}>{b.name}</div><div className="small" style={{ opacity: .8 }}>{CATS[b.cat]?.name} · {scan.place}</div></div>
            <Tag tone="green">{Math.round(b.score * 100)}% sure</Tag>
          </div>
          <div className="grid3" style={{ marginTop: 14 }}>
            {(b.cat === "devices" && match ? [["🔋", Math.round((match.battery || 0) * 100) + "% battery"], ["🎧", weekTotal(s.weekly.devices) + " hrs this week"], ["🎯", match.focus ? "Focus mode on" : "Focus mode off"]] :
              b.cat === "snacks" && match ? [["📦", match.qty + " left"], ["🔥", match.kcal + " kcal each"], ["🛒", "₹" + match.price]] :
              [["📍", scan.place.split(",")[0]], ["🗓️", "Seen " + new Date(scan.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })], ["🔍", CATS[b.cat]?.distraction + " distraction"]]).map(([e, t]) => (
              <div key={t} className="row" style={{ padding: 8, gap: 6, minHeight: 50 }}><Emoji e={e} s={16} /><span style={{ fontSize: 11, fontWeight: 600 }}>{t}</span></div>
            ))}
          </div>
          <div className="row-flex" style={{ marginTop: 14 }}><button className="pill lg" style={{ width: 130 }} onClick={() => go("scan")}>Rescan</button><Btn cls="lg" onClick={() => openCat(go, b.cat)}>Open {CATS[b.cat]?.name}</Btn></div>
        </> : <p className="small">Tap an outlined object to see what ROOM.OS knows about it.</p>}
      </div>
    </div>
  );
}
