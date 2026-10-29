import { useState } from "react";
import { Screen, Back, Title, Sub, Btn, Field, Check, Emoji, useNav, Halo } from "../ui.jsx";
import { Ico } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { ROOM_PHOTO, CATS } from "../data.js";

const Steps = ({ n }) => (
  <div style={{ textAlign: "right" }}>
    <div className="lbl">Step {n} of 3</div>
    <div className="row-flex" style={{ gap: 4, marginTop: 6, justifyContent: "flex-end" }}>{[1, 2, 3].map((i) => <i key={i} style={{ width: 24, height: 5, borderRadius: 3, background: i <= n ? "var(--yellow)" : "var(--track)" }} />)}</div>
  </div>
);

export function Splash() {
  const { go, reset } = useNav(); const { loadSample } = useStore();
  return (
    <Screen>
      <div style={{ minHeight: "calc(100% - 10px)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "34%" }}>
        <div className="logo" style={{ fontSize: 52 }}>ROOM.OS</div>
        <div style={{ fontSize: 17, marginTop: 10 }}>Your room, organized.</div>
        <div className="bar thin" style={{ width: 100, flex: "none", marginTop: 26 }}><i style={{ width: "60%" }} /></div>
        <div className="spacer" />
        <div className="stack" style={{ width: "100%", paddingBottom: 10 }}>
          <Btn cls="lg" onClick={() => go("signup")}>Get started</Btn>
          <button className="small" style={{ fontWeight: 600, padding: 8 }} onClick={() => go("login")}>I already have an account</button>
          <button className="small link" style={{ padding: 4 }} onClick={() => { loadSample(); reset("home"); }}>Explore the sample room</button>
        </div>
      </div>
    </Screen>
  );
}

export function Login() {
  const { go, reset } = useNav(); const { logIn } = useStore();
  const [email, setEmail] = useState("aashvi@roomos.app"); const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = (e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address."); if (pw.length < 6) return setErr("Your password needs at least 6 characters."); logIn(email); reset("home"); };
  return (
    <Screen>
      <Back right={false} crumb="" />
      <Title>Welcome back</Title><Sub>Log in to check on your room.</Sub>
      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="photo" style={{ height: 138 }}><img src={ROOM_PHOTO} alt="Your shelf" />
          <div className="card tight" style={{ position: "absolute", left: 10, right: 10, bottom: 10, padding: "8px 12px", background: "rgba(0,0,0,.35)" }}><span className="small">ROOM.OS keeps track of everything in your room.</span></div>
        </div>
      </div>
      <form className="stack" onSubmit={submit}>
        <Field id="login-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Field id="login-pw" label="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 6 characters" autoComplete="current-password" />
        <div className="between"><span className="small" style={{ color: "var(--red)" }} role="alert">{err}</span><button type="button" className="small" style={{ fontWeight: 600 }} onClick={() => go("forgot")}>Forgot password?</button></div>
        <button className="btn lg" type="submit">Log In <Ico n="chev" size={16} /></button>
      </form>
      <div className="row-flex" style={{ margin: "18px 0" }}><i style={{ flex: 1, height: 1, background: "rgba(255,255,255,.3)" }} /><span className="small" style={{ opacity: .7 }}>or</span><i style={{ flex: 1, height: 1, background: "rgba(255,255,255,.3)" }} /></div>
      <button className="pill lg" style={{ width: "100%" }} onClick={() => { logIn(); reset("home"); }}><Emoji e="🔵" s={16} /> Continue with Google</button>
      <p className="center small" style={{ fontWeight: 600, marginTop: 22 }}>New here? <button className="link" onClick={() => go("signup")}>Create an account</button></p>
    </Screen>
  );
}

export function SignUp() {
  const { go, replace } = useNav(); const { signUp } = useStore();
  const [f, setF] = useState({ name: "", email: "", pw: "" }); const [agree, setAgree] = useState(false); const [err, setErr] = useState("");
  const strength = Math.min(4, (f.pw.length >= 6) + (f.pw.length >= 10) + /[0-9]/.test(f.pw) + /[^A-Za-z0-9]/.test(f.pw));
  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr("Add your name.");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Enter a valid email address.");
    if (f.pw.length < 6) return setErr("Use at least 6 characters for your password.");
    if (!agree) return setErr("Agree to the Terms to continue.");
    signUp({ name: f.name.trim(), email: f.email.trim() }); replace("setup");
  };
  return (
    <Screen>
      <Back right={false} crumb=""><Steps n={1} /></Back>
      <Title sm>Create account</Title><Sub>Takes less than a minute.</Sub>
      <form className="stack" onSubmit={submit}>
        <Field id="su-name" label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Aashvi Agarwal" autoComplete="name" />
        <Field id="su-email" label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
        <Field id="su-pw" label="Password" type="password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} placeholder="At least 6 characters" autoComplete="new-password" />
        <div>
          <div className="row-flex" style={{ gap: 6 }}>{[0, 1, 2, 3].map((i) => <i key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < strength ? "var(--yellow)" : "var(--track)" }} />)}</div>
          <div className="small" style={{ marginTop: 6, color: "var(--yellow)", fontWeight: 600, minHeight: 16 }}>{f.pw && ["Too short", "Weak password", "Okay password", "Strong password", "Very strong password"][strength]}</div>
        </div>
        <Check on={agree} onChange={setAgree}>I agree to the <span className="link">Terms</span> and <span className="link">Privacy Policy</span></Check>
        <span className="small" role="alert" style={{ color: "var(--red)", minHeight: 16 }}>{err}</span>
        <button className="btn lg" type="submit">Continue <Ico n="chev" size={16} /></button>
      </form>
      <p className="center small" style={{ fontWeight: 600, marginTop: 20 }}>Already have an account? <button className="link" onClick={() => go("login")}>Log in</button></p>
    </Screen>
  );
}

export function Forgot() {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const { back } = useNav();
  return (
    <Screen>
      <Back right={false} crumb="Log in" />
      <div className="center" style={{ marginTop: 20 }}>
        <div className="circle-btn" style={{ width: 120, height: 120, margin: "0 auto", background: "rgba(255,255,255,.18)" }}><Emoji e="🔒" s={56} /></div>
        <Title>Forgot password?</Title>
        <p className="sub" style={{ maxWidth: 300, margin: "0 auto 18px" }}>Enter your email and we'll send you a link to reset it.</p>
      </div>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); if (/^\S+@\S+\.\S+$/.test(email)) setSent(true); }}>
        <Field id="fp-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <button className="btn lg" type="submit">{sent ? "Resend link" : "Send reset link"} <Ico n="chev" size={16} /></button>
      </form>
      {sent && <div className="card row-flex" style={{ marginTop: 14 }} role="status">
        <span className="mini-circle green" style={{ width: 36, height: 36 }}><Ico n="check" size={20} /></span>
        <div><div className="h3" style={{ fontSize: 14 }}>Check your inbox</div><div className="small" style={{ opacity: .8 }}>We sent a link to {email}. It expires in 15 minutes.</div></div>
      </div>}
      <p className="center" style={{ marginTop: 40 }}><button className="small" style={{ fontWeight: 600 }} onClick={back}>Back to log in</button></p>
    </Screen>
  );
}

export function Setup() {
  const { s, setRoom } = useStore(); const { go } = useNav();
  const [name, setName] = useState(s.room.name || (s.user.name ? s.user.name.split(" ")[0] + "'s Room" : "My Room"));
  const [type, setType] = useState(s.room.type || "Bedroom");
  const [track, setTrack] = useState(s.track);
  const opts = [["snacks", "🍿", "Snacks"], ["books", "📚", "Books"], ["sideQuests", "⭐", "Side Quests"], ["devices", "🔊", "Devices"], ["toys", "🧸", "Toys"], ["decor", "🖼️", "Decor"]];
  return (
    <Screen>
      <Back right={false} crumb=""><Steps n={2} /></Back>
      <Title sm>Set up your room</Title><Sub>Tell ROOM.OS about your space before the first scan.</Sub>
      <div className="stack">
        <Field id="setup-name" label="Room name" value={name} onChange={(e) => setName(e.target.value)} />
        <span className="lbl">What kind of room is it?</span>
        <div className="row-flex" style={{ gap: 6 }}>{["Bedroom", "Study", "Dorm", "Studio"].map((t) => <button key={t} className={"chip" + (type === t ? " on" : "")} style={{ flex: 1, padding: 0 }} onClick={() => setType(t)} aria-pressed={type === t}>{t}</button>)}</div>
        <span className="lbl">What should ROOM.OS track?</span>
        <div className="grid3">
          {opts.map(([k, e, l]) => (
            <button key={k} className="card tight tap" aria-pressed={track[k]} onClick={() => setTrack({ ...track, [k]: !track[k] })} style={{ height: 100, display: "grid", placeItems: "center", position: "relative", borderColor: track[k] ? "var(--yellow)" : undefined, background: track[k] ? undefined : "rgba(217,217,217,.08)" }}>
              <Emoji e={e} s={30} /><span className="small" style={{ fontWeight: 600 }}>{l}</span>
              {track[k] && <span className="check on" style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 10 }}><Ico n="check" size={14} color="#514340" sw={3} /></span>}
            </button>
          ))}
        </div>
        <div className="card row-flex"><Emoji e="💡" s={20} /><span className="small">You can change these anytime in Settings.</span></div>
        <Btn cls="lg" onClick={() => { setRoom({ name: name.trim() || "My Room", type }); go("camera", { track }); }}>Continue</Btn>
      </div>
    </Screen>
  );
}

export function CameraPerm() {
  const { cur, reset } = useNav(); const { s, finishSetup, say } = useStore();
  const [state, setState] = useState("idle");
  const done = () => { finishSetup({}, cur.p.track || s.track); reset("home"); };
  const allow = async () => {
    setState("asking");
    try {
      const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      st.getTracks().forEach((t) => t.stop()); say("Camera ready"); setState("ok"); setTimeout(done, 500);
    } catch (e) {
      say("Live camera isn't available here — you'll scan with photos"); setState("photo"); setTimeout(done, 1400);
    }
  };
  return (
    <Screen>
      <Back right={false} crumb=""><Steps n={3} /></Back>
      <div className="center" style={{ marginTop: 10 }}>
        {state === "ok" ? <Halo /> : <div className="circle-btn" style={{ width: 160, height: 160, margin: "0 auto", background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.4)" }}><Emoji e="📷" s={72} /></div>}
        <Title>Allow camera access</Title>
        <p className="sub" style={{ maxWidth: 300, margin: "0 auto 18px" }}>ROOM.OS uses your camera to spot and outline the objects in your room.</p>
      </div>
      <div className="stack">
        {[["📱", "Processed on your phone", "The AI model runs on this device; photos never leave it"], ["🙈", "Faces are blurred", "People and screens are hidden in saved scans"], ["🎛️", "You're in control", "Turn it off anytime in Privacy & data"]].map(([e, t, sub]) => (
          <div className="row" key={t} style={{ minHeight: 64 }}><Emoji e={e} s={22} /><span className="grow"><span className="t">{t}</span><span className="s">{sub}</span></span></div>
        ))}
        <Btn cls="lg" onClick={allow} disabled={state === "asking"}>{state === "asking" ? "Waiting for permission…" : "Allow camera"}</Btn>
        <button className="small" style={{ fontWeight: 600, padding: 8, opacity: .85 }} onClick={done}>Maybe later</button>
      </div>
    </Screen>
  );
}
export { CATS };
