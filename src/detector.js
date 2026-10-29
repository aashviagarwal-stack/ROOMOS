// On-device object detection: COCO-SSD (MobileNet v2) shipped with the app, run with TensorFlow.js.
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { cocoInfo } from "./data.js";

let modelP = null;
export function loadModel(onStatus) {
  if (!modelP) {
    modelP = (async () => {
      onStatus?.("Starting AI engine…");
      try { await tf.setBackend("webgl"); } catch (e) { /* fall back */ }
      await tf.ready();
      if (tf.getBackend() !== "webgl") { await tf.setBackend("cpu"); await tf.ready(); }
      onStatus?.("Loading object model (18 MB, first time only)…");
      const url = new URL("models/coco-ssd/model.json", document.baseURI).href;
      const m = await cocoSsd.load({ base: "mobilenet_v2", modelUrl: url });
      onStatus?.("Ready");
      return m;
    })().catch((e) => { modelP = null; throw e; });
  }
  return modelP;
}
export const backendName = () => tf.getBackend();

function iou(a, b) {
  const x1 = Math.max(a[0], b[0]), y1 = Math.max(a[1], b[1]);
  const x2 = Math.min(a[0] + a[2], b[0] + b[2]), y2 = Math.min(a[1] + a[3], b[1] + b[3]);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  return inter / (a[2] * a[3] + b[2] * b[3] - inter || 1);
}

/** Quick single pass, for the live camera preview. Returns normalised boxes. */
export async function detectFast(model, el, w, h) {
  const p = await model.detect(el, 12, 0.4);
  return p.map((d) => toRow(d.class, d.score, [d.bbox[0] / w, d.bbox[1] / h, d.bbox[2] / w, d.bbox[3] / h]));
}

/** Thorough pass on a still photo: whole frame + overlapping tiles, merged with per-class NMS. */
export async function detectPhoto(model, img, onProgress) {
  const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
  const tiles = [[0, 0, W, H]];
  const cols = W >= H ? 3 : 2, rows = W >= H ? 2 : 3;
  const tw = W / cols * 1.25, th = H / rows * 1.25;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    tiles.push([Math.min(W - tw, Math.max(0, c * W / cols - tw * 0.1)), Math.min(H - th, Math.max(0, r * H / rows - th * 0.1)), tw, th]);
  }
  const all = [];
  for (let i = 0; i < tiles.length; i++) {
    const [x, y, w, h] = tiles[i];
    const c = document.createElement("canvas"); c.width = Math.round(w); c.height = Math.round(h);
    c.getContext("2d").drawImage(img, x, y, w, h, 0, 0, c.width, c.height);
    const p = await model.detect(c, 20, 0.22);
    p.forEach((d) => all.push({ cls: d.class, score: d.score, bbox: [d.bbox[0] + x, d.bbox[1] + y, d.bbox[2], d.bbox[3]] }));
    onProgress?.((i + 1) / tiles.length, all.length);
    await new Promise((r) => setTimeout(r, 0));
  }
  all.sort((a, b) => b.score - a.score);
  const keep = [];
  for (const d of all) {
    if (d.bbox[2] * d.bbox[3] > W * H * 0.6) continue; // ignore "the whole shelf" boxes
    if (keep.some((k) => (k.cls === d.cls && iou(k.bbox, d.bbox) > 0.35) || iou(k.bbox, d.bbox) > 0.7)) continue;
    keep.push(d);
  }
  return keep.slice(0, 14).map((d) => toRow(d.cls, d.score, [d.bbox[0] / W, d.bbox[1] / H, d.bbox[2] / W, d.bbox[3] / H]));
}

function toRow(cls, score, box) {
  const [name, cat, emoji] = cocoInfo(cls);
  return { cls, name, cat, emoji, score: +score.toFixed(2), box: box.map((v) => +Math.max(0, Math.min(1, v)).toFixed(4)), keep: true };
}

/** Load a File/URL into an <img>, downscaled to maxDim, and also produce a small JPEG thumbnail. */
export async function prepImage(src, maxDim = 1280) {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  const img = new Image(); img.src = url; await img.decode();
  const s = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  const full = c.toDataURL("image/jpeg", 0.85);
  const ts = Math.min(1, 520 / Math.max(c.width, c.height));
  const t = document.createElement("canvas"); t.width = Math.round(c.width * ts); t.height = Math.round(c.height * ts);
  t.getContext("2d").drawImage(c, 0, 0, t.width, t.height);
  const out = new Image(); out.src = full; await out.decode();
  if (typeof src !== "string") URL.revokeObjectURL(url);
  return { img: out, full, thumb: t.toDataURL("image/jpeg", 0.7), w: c.width, h: c.height };
}
