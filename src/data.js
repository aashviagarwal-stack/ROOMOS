import roomUrl from "./assets/room.jpg";
import chips from "./assets/chips.png";
import cola from "./assets/cola.png";
import bar from "./assets/bar.png";
import choc from "./assets/choc.png";
import rb from "./assets/rb.png";

export const ROOM_PHOTO = roomUrl;
export const IMG = { chips, cola, bar, choc, rb };

export const CATS = {
  snacks: { id: "snacks", name: "Snacks", emoji: "🍿", distraction: "High", tone: "red", unit: "items" },
  books: { id: "books", name: "Books", emoji: "📚", distraction: "Low", tone: "green", unit: "books" },
  sideQuests: { id: "sideQuests", name: "Side Quests", emoji: "⭐", distraction: "Low", tone: "green", unit: "active hobbies" },
  toys: { id: "toys", name: "Toys", emoji: "🧸", distraction: "Medium", tone: "yellow", unit: "toys" },
  devices: { id: "devices", name: "Speaker", emoji: "🔊", distraction: "Low", tone: "green", unit: "device connected" },
  decor: { id: "decor", name: "Decor", emoji: "🖼️", distraction: "Low", tone: "green", unit: "pieces" },
  unsorted: { id: "unsorted", name: "Unsorted", emoji: "❔", distraction: "—", tone: "grey", unit: "items" },
};
export const CAT_ORDER = ["snacks", "books", "sideQuests", "toys", "devices", "decor"];

// COCO-SSD class -> [friendly name, category, emoji]
export const COCO = {
  book: ["Book", "books", "📚"], bottle: ["Bottle", "snacks", "🧴"], cup: ["Cup / can", "snacks", "🥤"],
  "wine glass": ["Glass", "snacks", "🥂"], banana: ["Banana", "snacks", "🍌"], apple: ["Apple", "snacks", "🍎"],
  sandwich: ["Sandwich", "snacks", "🥪"], orange: ["Orange", "snacks", "🍊"], "hot dog": ["Hot dog", "snacks", "🌭"],
  pizza: ["Pizza", "snacks", "🍕"], donut: ["Donut", "snacks", "🍩"], cake: ["Cake", "snacks", "🍰"],
  broccoli: ["Broccoli", "snacks", "🥦"], carrot: ["Carrot", "snacks", "🥕"], bowl: ["Bowl", "snacks", "🥣"],
  "teddy bear": ["Plush toy", "toys", "🧸"], "sports ball": ["Ball", "toys", "⚽"], kite: ["Kite", "toys", "🪁"],
  frisbee: ["Frisbee", "toys", "🥏"], skateboard: ["Skateboard", "toys", "🛹"],
  "cell phone": ["Phone", "devices", "📱"], laptop: ["Laptop", "devices", "💻"], tv: ["Screen", "devices", "🖥️"],
  remote: ["Remote", "devices", "🎛️"], keyboard: ["Keyboard", "devices", "⌨️"], mouse: ["Mouse", "devices", "🖱️"],
  clock: ["Clock", "decor", "🕰️"], vase: ["Vase", "decor", "🏺"], "potted plant": ["Plant", "decor", "🪴"],
  scissors: ["Scissors", "sideQuests", "✂️"], backpack: ["Backpack", "unsorted", "🎒"], handbag: ["Bag", "unsorted", "👜"],
  suitcase: ["Box", "unsorted", "📦"], chair: ["Chair", "decor", "🪑"], bed: ["Bed", "decor", "🛏️"],
  umbrella: ["Umbrella", "unsorted", "☂️"], tie: ["Tie", "unsorted", "👔"], toothbrush: ["Toothbrush", "unsorted", "🪥"],
  "hair drier": ["Hair dryer", "devices", "💨"], person: ["Figure or poster", "unsorted", "🙂"], "dining table": ["Table", "decor", "🪵"],
  couch: ["Sofa", "decor", "🛋️"], sink: ["Sink", "decor", "🚰"], refrigerator: ["Fridge", "devices", "🧊"],
  microwave: ["Microwave", "devices", "📟"], oven: ["Oven", "devices", "🔥"], toaster: ["Toaster", "devices", "🍞"],
};
export const cocoInfo = (cls) => COCO[cls] || [cls.charAt(0).toUpperCase() + cls.slice(1), "unsorted", "❔"];

const DAY = 86400000;
export const now = () => Date.now();

// Boxes are normalised [x, y, w, h] on ROOM_PHOTO (from the Figma live-view outlines).
const SAMPLE_DETECTIONS = [
  { name: "Book stack", cat: "books", emoji: "📚", score: 0.98, box: [0.02, 0.07, 0.25, 0.49] },
  { name: "Energy drink", cat: "snacks", emoji: "🥤", score: 0.92, box: [0.405, 0.27, 0.055, 0.18] },
  { name: "Art print", cat: "decor", emoji: "🖼️", score: 0.81, box: [0.52, 0.12, 0.165, 0.47] },
  { name: "Cow plush", cat: "toys", emoji: "🧸", score: 0.86, box: [0.58, 0.42, 0.12, 0.17] },
  { name: "Toy car", cat: "toys", emoji: "🚗", score: 0.71, box: [0.545, 0.55, 0.065, 0.05] },
  { name: "Coffee bag", cat: "snacks", emoji: "☕", score: 0.88, box: [0.715, 0.28, 0.11, 0.17] },
  { name: "Bluetooth speaker", cat: "devices", emoji: "🔊", score: 0.94, box: [0.72, 0.44, 0.175, 0.16] },
  { name: "Photo strip", cat: "decor", emoji: "🖼️", score: 0.62, box: [0.735, 0.61, 0.15, 0.32] },
];

export function sampleState() {
  const t = now();
  return {
    version: 1,
    authed: true,
    onboarded: true,
    user: { name: "Aashvi Agarwal", email: "aashvi@roomos.app", since: "Feb 2026" },
    room: { name: "Aashvi's Room", type: "Bedroom" },
    track: { snacks: true, books: true, sideQuests: true, toys: true, devices: true, decor: false },
    goals: { reading: 10, sideQuests: 12, kcal: 1000 },
    settings: { notifications: true, scanFreq: "Every 6 hours", awayOnly: true, onDevice: true, savePhotos: true, blur: true, usage: false },
    items: [
      { id: "s1", cat: "snacks", name: "Chips", unit: "packet", qty: 1, img: "chips", kcal: 270, price: 20, size: "52 g" },
      { id: "s2", cat: "snacks", name: "Cola", unit: "can", qty: 4, img: "cola", kcal: 140, price: 40, size: "300 ml" },
      { id: "s3", cat: "snacks", name: "Protein bar", unit: "packet", qty: 2, img: "bar", kcal: 200, price: 60, size: "40 g" },
      { id: "s4", cat: "snacks", name: "Chocolate", unit: "packet", qty: 6, img: "choc", kcal: 230, price: 45, size: "50 g" },
      { id: "s5", cat: "snacks", name: "Energy drink", unit: "can", qty: 8, img: "rb", kcal: 110, price: 125, size: "250 ml" },
      { id: "b1", cat: "books", name: "Set on You", genre: "Romance", status: "Reading", color: "#d9545c", page: 186, pages: 320, hrs: 2.1, location: "Top shelf" },
      { id: "b2", cat: "books", name: "The Unhoneymooners", genre: "Romance", status: "Reading", color: "#338c8c", page: 140, pages: 400, hrs: 1.8, location: "Top shelf" },
      { id: "b3", cat: "books", name: "The Maid", genre: "Mystery", status: "Reading", color: "#3a8a5c", page: 90, pages: 290, hrs: 1.4, location: "Top shelf" },
      { id: "b4", cat: "books", name: "The Boyfriend", genre: "Thriller", status: "To read", color: "#c9473f", page: 0, pages: 336, hrs: 0, location: "Top shelf" },
      { id: "b5", cat: "books", name: "Red Flags and Rishtas", genre: "Romance", status: "To read", color: "#8c66bf", page: 0, pages: 304, hrs: 0, location: "Top shelf" },
      { id: "b6", cat: "books", name: "What I Really Meant to Say", genre: "Essays", status: "Done", color: "#2fa3a8", page: 256, pages: 256, hrs: 0.9, location: "Top shelf" },
      { id: "b7", cat: "books", name: "If We Ever Meet Again", genre: "Romance", status: "Done", color: "#7a2f4c", page: 368, pages: 368, hrs: 0.6, location: "Top shelf" },
      { id: "q1", cat: "sideQuests", name: "Crochet tote bag", emoji: "🧶", hrs: 4.5, progress: 0.7 },
      { id: "q2", cat: "sideQuests", name: "Embroidery hoop", emoji: "🪡", hrs: 3.2, progress: 0.45 },
      { id: "q3", cat: "sideQuests", name: "Clay keychains", emoji: "🏺", hrs: 2.3, progress: 0.2 },
      { id: "t1", cat: "toys", name: "Panda plush", emoji: "🐼", location: "Top shelf", status: "On shelf" },
      { id: "t2", cat: "toys", name: "Cow plush", emoji: "🐄", location: "Lower shelf", status: "On shelf" },
      { id: "t3", cat: "toys", name: "Mini toy car", emoji: "🚗", location: "Lower shelf", status: "Moved" },
      { id: "t4", cat: "toys", name: "Teddy keychain", emoji: "🧸", location: "Desk", status: "New" },
      { id: "t5", cat: "toys", name: "Dice set", emoji: "🎲", location: "Last seen Jun 15", status: "Missing" },
      { id: "d1", cat: "devices", name: "Bluetooth speaker", emoji: "🔊", battery: 0.76, connected: true, focus: true, quiet: false, volume: 0.6 },
      { id: "x1", cat: "decor", name: "Art print", emoji: "🖼️", location: "Lower shelf" },
      { id: "x2", cat: "decor", name: "Photo strip", emoji: "📸", location: "Lower shelf" },
    ],
    weekly: {
      books: [[0.6, 0.4], [0.8, 0.6], [0.3, 0.3], [0.9, 0.7], [0.2, 0.2], [0.6, 0.9], [0.2, 0.6]],
      sideQuests: [[0.8, 0.5], [0.9, 0.7], [0.5, 0.5], [1.0, 0.8], [0.6, 0.6], [0.5, 1.1], [0.8, 0.7]],
      snacks: [[1, 1], [2, 1], [1, 0], [1, 2], [1, 0], [2, 1], [0, 1]],
      toys: [[0.2, 0.1], [0.1, 0.15], [0.3, 0.1], [0.05, 0.1], [0.2, 0.2], [0.4, 0.3], [0.35, 0.2]],
      devices: [[0.6, 0.5], [0.9, 0.6], [0.4, 0.4], [1.0, 0.7], [0.7, 0.4], [0.4, 1.0], [0.3, 0.6]],
      screen: [2.1, 3.2, 2.5, 3.6, 1.8, 2.9, 3.4, 2.2, 2.7, 3.9, 2.4, 3.1],
    },
    kcalWeek: 687,
    scans: [
      { id: "sc1", ts: t - 2 * DAY, place: "Shelf, left wall", photo: "sample", count: 18, added: 3, missing: 0, detections: SAMPLE_DETECTIONS },
      { id: "sc2", ts: t - 8 * DAY, place: "Shelf, left wall", photo: "sample", count: 12, added: 0, missing: 0, detections: SAMPLE_DETECTIONS.slice(0, 5) },
      { id: "sc3", ts: t - 17 * DAY, place: "Desk", photo: "sample", count: 21, added: 2, missing: 1, detections: SAMPLE_DETECTIONS.slice(2) },
    ],
    orders: [],
    devices: [
      { id: "dv1", name: "Phone camera", emoji: "📱", sub: "Used for scans", connected: true },
      { id: "dv2", name: "Bluetooth speaker", emoji: "🔊", sub: "Focus mode on", connected: true, battery: 0.76 },
      { id: "dv3", name: "Room camera", emoji: "📹", sub: "Auto-scan every 6 hours", connected: false },
    ],
    notifications: [
      { id: "n1", emoji: "🍿", title: "Chips are running low", body: "Only 1 packet left on the shelf.", ts: t - 2 * 60000, read: false, action: ["Order now", "order", { id: "s1" }], kind: "order" },
      { id: "n2", emoji: "✅", title: "Scan complete", body: "18 objects found on the left wall shelf.", ts: t - 2 * DAY, read: false, action: ["View", "archiveDetail", { id: "sc1" }] },
      { id: "n3", emoji: "📚", title: "Reading streak: 5 days!", body: "You've read 7.3 hrs this week.", ts: t - 3 * 3600000, read: false },
      { id: "n4", emoji: "🔋", title: "Speaker battery at 20%", body: "Charge it before your evening playlist.", ts: t - DAY, read: true },
    ],
    recent: ["snacks", "speaker", "set on you"],
  };
}

export function emptyState() {
  const s = sampleState();
  return {
    ...s, authed: false, onboarded: false,
    user: { name: "", email: "", since: monthYear() },
    items: s.items.filter((i) => i.cat === "devices"),
    scans: [], orders: [], notifications: [], kcalWeek: 0,
    weekly: { books: zeros(), sideQuests: zeros(), snacks: zeros(), toys: zeros(), devices: zeros(), screen: s.weekly.screen },
    recent: [],
  };
}
function zeros() { return Array.from({ length: 7 }, () => [0, 0]); }
export function monthYear(ts = Date.now()) { return new Date(ts).toLocaleDateString("en-GB", { month: "short", year: "numeric" }); }
export function fmtDate(ts) { return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
export function fmtTime(ts) { return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }
export function ago(ts) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "now"; if (m < 60) return m + "m"; const h = Math.round(m / 60);
  if (h < 24) return h + "h"; const d = Math.round(h / 24); if (d === 1) return "Yesterday"; return d + "d";
}
export const sum = (a) => a.reduce((x, y) => x + y, 0);
export const weekTotal = (w) => +sum(w.map((d) => d[0] + d[1])).toFixed(1);

export function healthScore(s) {
  const reading = weekTotal(s.weekly.books);
  const sq = weekTotal(s.weekly.sideQuests);
  const snackQty = sum(s.items.filter((i) => i.cat === "snacks").map((i) => i.qty));
  if (!s.scans.length) return 0;
  return Math.max(0, Math.min(100, Math.round(66 + Math.min(reading, 10) * 1.5 + Math.min(sq, 12) * 0.8 - snackQty * 0.15)));
}
export function levels(s) {
  const snackQty = sum(s.items.filter((i) => i.cat === "snacks").map((i) => i.qty));
  const toys = s.items.filter((i) => i.cat === "toys").length;
  const reading = weekTotal(s.weekly.books), sq = weekTotal(s.weekly.sideQuests);
  return {
    distraction: Math.min(1, (snackQty * 0.025 + toys * 0.04)),
    productivity: Math.min(1, (reading / s.goals.reading) * 0.5 + (sq / s.goals.sideQuests) * 0.5),
    tidiness: s.scans.length ? 0.66 : 0,
  };
}
