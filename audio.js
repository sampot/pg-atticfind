/**
 * 音效：實際載入並播放 `assets/audio/*.ogg`（背景樂 loop ＋ 動作音）。
 */

const SFX = [
  "click",
  "cloth",
  "door",
  "error",
  "found",
  "gust",
  "latch",
  "metal",
  "paper",
  "sent",
  "sheet",
  "slam",
  "solved",
  "step",
  "stone",
];

export class AtticAudio {
  constructor(base = "assets/audio") {
    this.base = base;
    this.ctx = null;
    this.enabled = true;
    this.vol = 0.55;
    this.cache = new Map();
    this.bgmBuf = null;
    this.bgmPending = null;
    this.bgmSrc = null;
    this.bgmGain = null;
    this.last = new Map();
  }

  ensure() {
    if (this.ctx) return;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (AC) this.ctx = new AC();
  }

  async unlock() {
    this.ensure();
    if (this.ctx?.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        /* ignore */
      }
    }
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.bgmGain) this.bgmGain.gain.value = on ? this.vol * 0.28 : 0;
  }

  /** 同一個音效只抓一次：cache 存的是 Promise，避免併發重複下載。 */
  load(name) {
    if (!this.cache.has(name)) this.cache.set(name, this.fetchSfx(name));
    return this.cache.get(name);
  }

  async fetchSfx(name) {
    this.ensure();
    if (!this.ctx) return null;
    try {
      const res = await fetch(`${this.base}/${name}.ogg`);
      if (!res.ok) throw new Error(`fetch ${name} ${res.status}`);
      const bytes = await res.arrayBuffer();
      return await Promise.race([
        this.ctx.decodeAudioData(bytes),
        new Promise((_, reject) => setTimeout(() => reject(new Error("decode timeout")), 6000)),
      ]);
    } catch {
      return null;
    }
  }

  async preload() {
    await Promise.all([...SFX.map((name) => this.load(name)), this.loadBgm()]);
  }

  async play(name, gain = 1) {
    if (!this.enabled || !name) return;
    const now = Date.now();
    if (now - (this.last.get(name) ?? 0) < 60) return;
    this.last.set(name, now);
    const buf = await this.load(name);
    if (!buf || !this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const node = this.ctx.createGain();
    node.gain.value = this.vol * gain;
    src.connect(node).connect(this.ctx.destination);
    src.start();
  }

  loadBgm() {
    this.bgmPending ??= this.fetchBgm();
    return this.bgmPending;
  }

  async fetchBgm() {
    if (this.bgmBuf) return this.bgmBuf;
    this.ensure();
    if (!this.ctx) return null;
    try {
      const res = await fetch(`${this.base}/music.ogg`);
      if (!res.ok) throw new Error(`fetch music ${res.status}`);
      const bytes = await res.arrayBuffer();
      this.bgmBuf = await Promise.race([
        this.ctx.decodeAudioData(bytes),
        new Promise((_, reject) => setTimeout(() => reject(new Error("decode timeout")), 8000)),
      ]);
      return this.bgmBuf;
    } catch {
      return null;
    }
  }

  async playBgm() {
    const buf = await this.loadBgm();
    if (!buf || !this.ctx || this.bgmSrc) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const node = this.ctx.createGain();
    node.gain.value = this.enabled ? this.vol * 0.28 : 0;
    src.connect(node).connect(this.ctx.destination);
    src.start();
    this.bgmSrc = src;
    this.bgmGain = node;
  }

  /** 風雨越大，背景樂讓位給風聲越多。 */
  duckBgm(intensity) {
    if (!this.bgmGain) return;
    const scale = Math.max(0.35, 1 - intensity * 0.7);
    this.bgmGain.gain.value = this.enabled ? this.vol * 0.28 * scale : 0;
  }

  stopBgm() {
    if (!this.bgmSrc) return;
    try {
      this.bgmSrc.stop();
    } catch {
      /* ignore */
    }
    this.bgmSrc = null;
    this.bgmGain = null;
  }
}
