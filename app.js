/**
 * 頂樓尋物 — UI：把 game.js 的純狀態畫成可點的場景。
 * 一切確認／輸入都在頁內完成（不使用 alert／confirm／prompt）。
 */

import { sceneArt } from "./art.js";
import { AtticAudio } from "./audio.js";
import {
  CHAPTERS,
  EPILOGUE,
  INTRO,
  ITEMS,
  NOTES,
  RECIPIENTS,
  SCENES,
  SCENE_ORDER,
  STORM_MAX,
} from "./content.js";
import * as G from "./game.js";
import { loadProgress, mergeRecord, saveProgress } from "./persist.js";

const $ = (id) => document.getElementById(id);
const audio = new AtticAudio();

let state = G.createGame();
let record = { sent: 0, bestScore: 0, bestRating: null };
let confirmingRestart = false;
let saveTimer = null;

/* ---------- 存檔 ---------- */

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveProgress({ save: G.serialize(state), record });
  }, 350);
}

function commitRecord() {
  record = mergeRecord(record, {
    phase: state.phase,
    score: G.score(state),
    rating: G.rating(state),
  });
}

/* ---------- 動作 ---------- */

function act(next) {
  const before = state.phase;
  state = next;
  const sound = state.event?.sound;
  if (sound) void audio.play(sound, sound === "solved" || sound === "sent" ? 0.7 : 1);
  if (before === "playing" && state.phase !== "playing") commitRecord();
  render();
  scheduleSave();
}

/* ---------- 風雨計 ---------- */

function renderGauge() {
  const box = $("gauge");
  box.hidden = false;
  const share = state.storm / STORM_MAX;
  $("gauge-label").textContent = G.stormStage(state);
  $("gauge-fill").style.width = `${share * 100}%`;
  $("gauge-read").textContent =
    state.shelter > 0 ? `${state.storm}／${STORM_MAX}・加固 ${state.shelter}` : `${state.storm}／${STORM_MAX}`;
  box.dataset.panic = String(state.storm >= STORM_MAX - 2);
  $("rainfall").style.setProperty("--rain", String(share));
  audio.duckBgm(share);
}

/* ---------- 場景 ---------- */

function renderScenes() {
  const host = $("scenes");
  host.replaceChildren();
  for (const id of SCENE_ORDER) {
    const scene = SCENES[id];
    const open = G.canEnter(state, id);
    const left = G.pendingCount(state, id);
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "scene-tab";
    tab.dataset.locked = String(!open);
    if (id === state.scene) tab.setAttribute("aria-current", "true");
    tab.innerHTML =
      `<span>${scene.short}</span>` +
      (!open
        ? `<span class="lock" aria-hidden="true">🔒</span>`
        : state.seen[id] && left > 0
          ? `<span class="dot" aria-hidden="true">${left}</span>`
          : "");
    tab.setAttribute(
      "aria-label",
      open
        ? `${scene.name}${state.seen[id] && left > 0 ? `，還有 ${left} 處可查` : ""}`
        : `${scene.name}（還沒打通）`
    );
    tab.addEventListener("click", () => act(G.travel(state, id)));
    host.append(tab);
  }
}

function renderStage() {
  const scene = SCENES[state.scene];
  $("art").innerHTML = sceneArt(state.scene);
  $("scene-name").textContent = scene.name;

  const host = $("spots");
  host.replaceChildren();
  for (const spot of scene.hotspots) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "spot";
    button.style.left = `${spot.cx}%`;
    button.style.top = `${spot.cy}%`;
    button.style.width = `${spot.w}%`;
    button.style.height = `${spot.h}%`;
    button.dataset.done = String(!G.spotPending(state, state.scene, spot));
    button.dataset.armed = String(Boolean(state.selected));
    button.dataset.gate = String(Boolean(spot.requires || spot.needsFlag));
    button.setAttribute(
      "aria-label",
      state.selected ? `對${spot.name}使用${ITEMS[state.selected].name}` : `搜查${spot.name}`
    );
    button.innerHTML = `<span class="label">${spot.name}</span>`;
    button.addEventListener("click", () => act(G.tapHotspot(state, spot.id)));
    host.append(button);
  }
}

/* ---------- 章節／敘述 ---------- */

function renderChapter() {
  const chapter = G.currentChapter(state);
  $("chapter-title").textContent = chapter
    ? `${chapter.title}　(${G.chapterNo(state)}／${CHAPTERS.length})`
    : EPILOGUE.title;
  $("chapter-goal").textContent = chapter ? chapter.goal : EPILOGUE.goal;
}

function renderNarration() {
  const node = $("narration");
  node.textContent = state.event?.text ?? "";
  node.dataset.kind = state.event?.kind ?? "info";
}

function renderTutorial() {
  const text = G.tutorialText(state);
  const box = $("tutorial");
  box.hidden = !text;
  if (text) $("tutorial-text").textContent = text;
}

/* ---------- 背包 ---------- */

function renderItems() {
  const host = $("items");
  host.replaceChildren();
  if (state.inventory.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-bag";
    empty.textContent = "背包還是空的。點場景裡發亮的光點開始搜。";
    host.append(empty);
  }
  for (const id of state.inventory) {
    const item = ITEMS[id];
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item";
    button.setAttribute("aria-pressed", String(state.selected === id));
    button.innerHTML = `<span class="glyph" aria-hidden="true">${item.icon}</span><span class="name">${item.name}</span>`;
    button.addEventListener("click", () => act(G.tapItem(state, id)));
    li.append(button);
    host.append(li);
  }
  $("bag-hint").textContent = state.selected
    ? `拿著「${ITEMS[state.selected].name}」——點光點使用，或點另一件道具組合`
    : "點道具拿起來，再點光點使用；連點兩件可組合";
}

/* ---------- 面板 ---------- */

function activeNotes() {
  return NOTES.filter((note) => state.flags[note.flag]);
}

function sectionTitle(text) {
  const node = document.createElement("p");
  node.className = "section-title";
  node.textContent = text;
  return node;
}

function renderNotesPanel(body) {
  const stat = G.progress(state);
  body.append(
    sectionTitle(
      `第 ${stat.chapter}／${stat.chapterTotal} 章 · 已搜 ${stat.searched}／${stat.total} 處 · ` +
        `走過 ${stat.scenes}／${stat.sceneTotal} 個場景 · 背包 ${stat.items} 件`
    )
  );

  body.append(sectionTitle("抄到的線索"));
  const list = document.createElement("ul");
  list.className = "note-list";
  const notes = activeNotes();
  if (notes.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-bag";
    li.textContent = "還沒抄到任何可用的線索。";
    list.append(li);
  }
  for (const note of notes) {
    const li = document.createElement("li");
    li.textContent = note.text;
    list.append(li);
  }
  body.append(list);

  body.append(sectionTitle("行動紀錄"));
  const log = document.createElement("ul");
  log.className = "log-list";
  for (const entry of [...state.log].reverse().slice(0, 8)) {
    const li = document.createElement("li");
    li.dataset.kind = entry.kind;
    li.textContent = entry.text;
    log.append(li);
  }
  body.append(log);
}

function renderLetterPanel(body) {
  const text = G.letterText(state);
  const note = document.createElement("p");
  note.className = "letter-paper";
  note.textContent = text ?? "紅鐵盒還沒打開。";
  body.append(note);
}

function renderHintPanel(body) {
  const line = document.createElement("p");
  line.className = "hint-text";
  line.textContent = G.hint(state) ?? "這一局已經結束了。";
  body.append(line);
  body.append(sectionTitle("這一章要做的事"));
  const goal = document.createElement("p");
  goal.className = "hint-goal";
  goal.textContent = G.currentChapter(state)?.goal ?? EPILOGUE.goal;
  body.append(goal);
}

function renderWritePanel(body) {
  const lead = document.createElement("p");
  lead.className = "write-lead";
  lead.textContent = G.canWriteName(state)
    ? "信封是空白的。從線索本裡的每一條對起來，這封信該寄給誰？"
    : "你手上的線索還不夠。挑一個名字寫下去，只會白白撕掉一個信封。";
  body.append(lead);

  const list = document.createElement("ul");
  list.className = "name-list";
  for (const person of RECIPIENTS) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "name-choice";
    button.disabled = state.wrongNames.includes(person.id);
    button.innerHTML =
      `<span class="name-main">${person.name}</span>` +
      `<span class="name-side">${person.place} · ${person.note}</span>`;
    button.addEventListener("click", () => act(G.writeName(state, person.id)));
    li.append(button);
    list.append(li);
  }
  body.append(list);

  if (state.wrongNames.length > 0) {
    body.append(sectionTitle(`已經寫壞 ${state.wrongNames.length} 個信封`));
  }
}

function renderEndingPanel(body) {
  const won = state.phase === "won";
  const mark = document.createElement("p");
  mark.className = "verdict-mark";
  mark.dataset.lost = String(!won);
  mark.textContent = won ? "寄出去了" : "沒能寄出去";
  body.append(mark);

  const text = document.createElement("p");
  text.className = "verdict-text";
  text.textContent = state.event?.text ?? "";
  body.append(text);

  const stat = G.progress(state);
  body.append(
    sectionTitle(
      won
        ? `評價「${G.rating(state)}」 · 分數 ${G.score(state)} · 線索 ${stat.notes} 條 · 行動 ${state.moves} 次`
        : `走到第 ${stat.chapter} 章 · 搜過 ${stat.searched}／${stat.total} 處 · 行動 ${state.moves} 次`
    )
  );

  const again = document.createElement("button");
  again.type = "button";
  again.className = "primary";
  again.textContent = won ? "再爬一次頂樓" : "再試一次";
  again.addEventListener("click", () => restart());
  body.append(again);
}

const PANEL_TITLES = {
  notes: "線索本",
  letter: "那封信",
  hint: "卡住了",
  write: "寫信封",
  ending: "這一局",
};

function renderPanel() {
  const panel = $("panel");
  if (!state.panel) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  const body = $("panel-body");
  body.replaceChildren();
  $("panel-title").textContent = PANEL_TITLES[state.panel] ?? "";
  if (state.panel === "notes") renderNotesPanel(body);
  else if (state.panel === "letter") renderLetterPanel(body);
  else if (state.panel === "hint") renderHintPanel(body);
  else if (state.panel === "write") renderWritePanel(body);
  else renderEndingPanel(body);
  $("btn-panel-close").hidden = state.panel === "ending";
}

/** 重來會丟掉這一局，所以在頁內問一次（不使用 confirm）。 */
function renderRestartConfirm() {
  document.getElementById("confirm-strip")?.remove();
  $("btn-restart").hidden = confirmingRestart;
  if (!confirmingRestart) return;

  const strip = document.createElement("div");
  strip.id = "confirm-strip";
  strip.className = "confirm-strip";
  strip.innerHTML = `<span>重來會丟掉這一局的進度。</span>`;

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "ghost";
  cancel.textContent = "取消";
  cancel.addEventListener("click", () => {
    confirmingRestart = false;
    void audio.play("click");
    render();
  });

  const go = document.createElement("button");
  go.type = "button";
  go.className = "danger";
  go.textContent = "確定重來";
  go.addEventListener("click", () => restart());

  strip.append(cancel, go);
  $("toolbar").append(strip);
  go.focus();
}

function render() {
  renderChapter();
  renderScenes();
  renderStage();
  renderNarration();
  renderTutorial();
  renderItems();
  renderPanel();
  renderRestartConfirm();
  renderGauge();
  $("notes-count").textContent = String(activeNotes().length);
  $("btn-letter").hidden = !state.flags.readLetter;
  $("btn-write").hidden = !G.isEpilogue(state) || state.phase !== "playing";
}

function restart() {
  confirmingRestart = false;
  state = G.skipTutorial(G.createGame());
  void audio.play("door");
  render();
  scheduleSave();
}

/* ---------- 綁定 ---------- */

function bind() {
  $("btn-sound").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const on = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(on));
    button.setAttribute("aria-label", on ? "關閉音效" : "開啟音效");
    audio.setEnabled(on);
    if (on) void audio.playBgm();
  });

  $("btn-tut-next").addEventListener("click", () => {
    void audio.play("click");
    state = G.advanceTutorial(state);
    render();
    scheduleSave();
  });

  $("btn-tut-skip").addEventListener("click", () => {
    void audio.play("click");
    state = G.skipTutorial(state);
    render();
    scheduleSave();
  });

  $("btn-notes").addEventListener("click", () => act(G.openPanel(state, "notes")));
  $("btn-letter").addEventListener("click", () => act(G.openPanel(state, "letter")));
  $("btn-hint").addEventListener("click", () => act(G.openPanel(state, "hint")));
  $("btn-write").addEventListener("click", () => act(G.openPanel(state, "write")));
  $("btn-panel-close").addEventListener("click", () => act(G.closePanel(state)));

  $("btn-restart").addEventListener("click", () => {
    confirmingRestart = true;
    void audio.play("click");
    render();
  });

  document.addEventListener("keydown", (event) => {
    if ($("play").hidden || event.key !== "Escape") return;
    if (confirmingRestart) {
      confirmingRestart = false;
      render();
    } else if (state.panel && state.phase === "playing") act(G.closePanel(state));
    else if (state.selected) act(G.tapItem(state, state.selected));
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      void saveProgress({ save: G.serialize(state), record });
    }
  });
}

async function enterGame() {
  await audio.unlock();
  void audio.playBgm();
  void audio.preload();
  $("intro").hidden = true;
  $("play").hidden = false;
  render();
}

async function boot() {
  $("brief").textContent = INTRO;
  bind();

  const stored = await loadProgress();
  record = mergeRecord(stored.record, null);
  if (record.sent > 0) {
    const line = $("record");
    line.hidden = false;
    line.textContent = `已經替阿嬤寄出 ${record.sent} 次 · 最高分 ${record.bestScore} · 最佳評價「${record.bestRating}」`;
  }

  const resumed = G.restore(stored.save);
  const worthResuming = resumed && resumed.phase === "playing" && resumed.moves > 0;
  if (worthResuming) {
    const button = $("btn-continue");
    button.hidden = false;
    button.textContent = `接續上一次（${SCENES[resumed.scene].name}・第 ${G.chapterNo(resumed)} 章）`;
    button.addEventListener("click", () => {
      state = resumed;
      void enterGame();
    });
  }

  $("btn-start").addEventListener("click", () => {
    state = G.createGame();
    void enterGame();
  });
}

void boot();
