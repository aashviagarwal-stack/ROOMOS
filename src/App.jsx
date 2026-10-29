import { StoreProvider, useStore } from "./store.jsx";
import { NavProvider, useNav } from "./ui.jsx";
import { ROOM_PHOTO } from "./data.js";
import { Splash, Login, SignUp, Forgot, Setup, CameraPerm } from "./screens/onboarding.jsx";
import { Home, Objects, Analytics, Archive } from "./screens/tabs.jsx";
import { Scan, Results, ChooseSheet, Saved, Failed, LiveRoom } from "./screens/scan.jsx";
import { Snacks, Category, Item, Speaker, Inventory, Update, OrderSheet, Placed, Diet, Analysis } from "./screens/objects.jsx";
import { Notifications, Search, ArchiveDetail, Profile, EditProfile, AppSettings, Privacy, ResetApp, Devices, AddDevice, Help, FrequencySheet, RoomNameSheet, LogoutSheet } from "./screens/system.jsx";

const ROUTES = {
  splash: Splash, login: Login, signup: SignUp, forgot: Forgot, setup: Setup, camera: CameraPerm,
  home: Home, objects: Objects, analytics: Analytics, archive: Archive,
  scan: Scan, results: Results, saved: Saved, failed: Failed, live: LiveRoom,
  snacks: Snacks, category: Category, item: Item, speaker: Speaker, inventory: Inventory, update: Update, placed: Placed, diet: Diet, analysis: Analysis,
  notifications: Notifications, search: Search, archiveDetail: ArchiveDetail, profile: Profile, editProfile: EditProfile, appSettings: AppSettings,
  privacy: Privacy, resetApp: ResetApp, devices: Devices, addDevice: AddDevice, help: Help,
};
const SHEETS = { choose: ChooseSheet, order: OrderSheet, frequency: FrequencySheet, roomName: RoomNameSheet, logout: LogoutSheet };

function Device() {
  const { cur, sheet } = useNav(); const { toast } = useStore();
  const S = ROUTES[cur.r] || Home; const Sh = sheet && SHEETS[sheet.r];
  return (
    <div className="device">
      <S key={cur.r + JSON.stringify(cur.p)} />
      {Sh && <Sh key={sheet.r + JSON.stringify(sheet.p)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
function Boot() {
  const { s } = useStore();
  const initial = !s.authed ? "splash" : !s.onboarded ? "setup" : "home";
  return <NavProvider initial={initial}><Device /></NavProvider>;
}
export default function App() {
  return (
    <div className="stage">
      <div className="stage-bg" style={{ backgroundImage: `url(${ROOM_PHOTO})` }} />
      <StoreProvider><Boot /></StoreProvider>
      <div className="stage-note">ROOM.OS · open on your phone for the full experience</div>
    </div>
  );
}
