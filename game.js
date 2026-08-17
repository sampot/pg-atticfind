/**
 * 頂樓尋物 — 遊戲規則（純函式，無 DOM）。
 *
 * 每個操作都回傳新的 state，要播的音效寫在 `state.event.sound`，
 * 讓 UI 只管畫面與聲音，規則本身可以單獨測試。
 *
 * 兩條會自己推進的線：
 *   章節 `chapter` — 當前章節的條件一滿足就往前跳，並解鎖下一個場景。
 *   風雨 `storm`  — 推進章節、用錯東西會往上加；壓鐵皮、清排水口會往下壓。滿格＝輸。
 */

import {
  CHAPTERS,
  COMBOS,
  ITEMS,
  LETTER_TEXT,
  LOSE_TEXT,
  NAME_NEEDS,
  NAME_NEEDS_TEXT,
  NOTES,
  RECIPIENTS,
  SCENES,
  SCENE_ORDER,
  SHELTER_MAX,
  STORM_MAX,
  STORM_PER_CHAPTER,
  STORM_PER_MISTAKE,
  STORM_PER_WRONG_NAME,
  STORM_STAGES,
  TUTORIAL,
  WIN_TEXT,
} from "./content.js";

export const SAVE_VERSION = 1;
const LOG_LIMIT = 24;
const START_SCENE = SCENE_ORDER[0];

export function hotspotKey(sceneId, hotspotId) {
  return `${sceneId}.${hotspotId}`;
}

export function findHotspot(sceneId, hotspotId) {
  return SCENES[sceneId]?.hotspots.find((spot) => spot.id === hotspotId) ?? null;
}

export function createGame() {
  return {
    version: SAVE_VERSION,
    scene: START_SCENE,
    seen: { [START_SCENE]: true },
    spots: {},
    inventory: [],
    flags: {},
    selected: null,
    chapter: 0,
    storm: 0,
    shelter: 0,
    mistakes: 0,
    moves: 0,
    wrongNames: [],
    phase: "playing",
    panel: null,
    tutorial: 0,
    log: [{ text: SCENES[START_SCENE].line, kind: "info" }],
    event: { sound: null, text: SCENES[START_SCENE].line, kind: "info" },
  };
}

function clone(state) {
  return {
    ...state,
    seen: { ...state.seen },
    spots: Object.fromEntries(Object.entries(state.spots).map(([k, v]) => [k, { ...v }])),
    inventory: [...state.inventory],
    flags: { ...state.flags },
    wrongNames: [...state.wrongNames],
    log: [...state.log],
  };
}

function emit(state, text, kind = "info", sound = null) {
  state.event = { sound, text, kind };
  state.log = [...state.log, { text, kind }].slice(-LOG_LIMIT);
  return state;
}

function spotOf(state, key) {
  return state.spots[key] ?? { examined: 0, cleared: false };
}

function markSpot(state, key, { cleared = null } = {}) {
  const record = spotOf(state, key);
  state.spots = {
    ...state.spots,
    [key]: { examined: record.examined + 1, cleared: cleared ?? record.cleared },
  };
  return record;
}

function giveItem(state, itemId) {
  if (!itemId || state.inventory.includes(itemId)) return false;
  state.inventory = [...state.inventory, itemId];
  return true;
}

export function itemName(itemId) {
  return ITEMS[itemId]?.name ?? itemId;
}

/* ---------- 風雨 ---------- */

/** 風雨要漲，先扣掉先前存下來的加固。 */
function raiseStorm(state, amount) {
  const absorbed = Math.min(state.shelter, amount);
  state.shelter -= absorbed;
  state.storm = Math.min(STORM_MAX, state.storm + (amount - absorbed));
  return state;
}

/** 先把已經淋到的壓回去，壓不掉的存成加固——早做的工不會白做。 */
function easeStorm(state, amount) {
  const cut = Math.min(state.storm, amount);
  state.storm -= cut;
  state.shelter = Math.min(SHELTER_MAX, state.shelter + (amount - cut));
  return state;
}

/** 記一次失誤：風雨往上跳一格。 */
function slip(state) {
  state.mistakes += 1;
  return raiseStorm(state, STORM_PER_MISTAKE);
}

export function stormStage(state) {
  let label = STORM_STAGES[0].label;
  for (const stage of STORM_STAGES) if (state.storm >= stage.at) label = stage.label;
  return label;
}

/** 風雨滿格就守不住了；所有會動到 `storm` 的路徑都要走這裡收尾。 */
function settleStorm(state) {
  if (state.phase !== "playing" || state.storm < STORM_MAX) return state;
  state.phase = "lost";
  state.panel = "ending";
  state.selected = null;
  return emit(state, LOSE_TEXT, "verdict", "slam");
}

/* ---------- 章節 ---------- */

function chapterMet(state, chapter) {
  const needs = chapter.needs ?? {};
  const flagsOk = (needs.flags ?? []).every((flag) => Boolean(state.flags[flag]));
  const itemsOk = (needs.items ?? []).every((id) => state.inventory.includes(id));
  return flagsOk && itemsOk;
}

/** 條件滿足就往下一章跳（可能一次連跳），並把該章解鎖的場景打開。 */
function settleChapter(state) {
  let guard = 0;
  while (
    state.phase === "playing" &&
    state.chapter < CHAPTERS.length &&
    chapterMet(state, CHAPTERS[state.chapter]) &&
    guard < CHAPTERS.length + 1
  ) {
    guard += 1;
    const done = CHAPTERS[state.chapter];
    state.chapter += 1;
    if (done.sets) state.flags = { ...state.flags, [done.sets]: true };
    if (done.opens) state.flags = { ...state.flags, [SCENES[done.opens].needs]: true };
    raiseStorm(state, STORM_PER_CHAPTER);

    const head = `〔${done.title}〕`;
    const before = state.event?.text ?? "";
    state.event = {
      sound: "solved",
      text: before ? `${before}\n\n${head}\n${done.text}` : `${head}\n${done.text}`,
      kind: "chapter",
    };
    state.log = [...state.log, { text: `${head} ${done.text.split("\n")[0]}`, kind: "chapter" }].slice(
      -LOG_LIMIT
    );
  }
  return state;
}

/** 每個動作的收尾：先看章節有沒有推進，再看風雨有沒有滿格。 */
function settle(state) {
  return settleStorm(settleChapter(state));
}

export function chapterNo(state) {
  return Math.min(state.chapter + 1, CHAPTERS.length);
}

export function currentChapter(state) {
  return state.chapter < CHAPTERS.length ? CHAPTERS[state.chapter] : null;
}

export function isEpilogue(state) {
  return state.chapter >= CHAPTERS.length;
}

/* ---------- 移動場景 ---------- */

export function canEnter(state, sceneId) {
  const scene = SCENES[sceneId];
  if (!scene) return false;
  return !scene.needs || Boolean(state.flags[scene.needs]);
}

export function travel(state, sceneId) {
  if (state.phase !== "playing" || !SCENES[sceneId]) return state;
  if (state.scene === sceneId) return state;
  if (!canEnter(state, sceneId)) {
    return emit(clone(state), SCENES[sceneId].lockedHint, "fail", "error");
  }
  const next = clone(state);
  next.scene = sceneId;
  next.seen = { ...next.seen, [sceneId]: true };
  next.moves += 1;
  return emit(next, `${SCENES[sceneId].name}——${SCENES[sceneId].line}`, "info", "step");
}

/* ---------- 熱點 ---------- */

/** 收穫：道具、旗標、壓下去的風雨。回傳附加說明。 */
function collect(state, spot) {
  const extra = [];
  if (spot.gives && giveItem(state, spot.gives)) extra.push(`〔收進背包〕${itemName(spot.gives)}`);
  if (spot.sets) state.flags = { ...state.flags, [spot.sets]: true };
  if (spot.relief) {
    easeStorm(state, spot.relief);
    extra.push(`〔風雨壓下〕${spot.relief} 格`);
  }
  return extra;
}

/** 追加線索：手上剛好有對的東西，同一個熱點會再吐出一段。只會發生一次。 */
function tryBonus(state, spot, record) {
  const bonus = spot.bonus;
  if (!bonus || state.flags[bonus.sets]) return null;
  if (spot.requires && !record.cleared) return null;
  if (!bonus.needs.every((need) => state.inventory.includes(need))) return null;
  state.flags = { ...state.flags, [bonus.sets]: true };
  if (bonus.relief) easeStorm(state, bonus.relief);
  return bonus.relief ? `${bonus.text}\n〔風雨壓下〕${bonus.relief} 格` : bonus.text;
}

/** 點熱點：手上拿著道具就是「使用」，空手就是「搜查」。 */
export function tapHotspot(state, hotspotId) {
  if (state.phase !== "playing") return state;
  if (!findHotspot(state.scene, hotspotId)) return state;
  if (state.selected) return useItem(state, state.selected, hotspotId);
  return examine(state, hotspotId);
}

export function examine(state, hotspotId) {
  if (state.phase !== "playing") return state;
  const spot = findHotspot(state.scene, hotspotId);
  if (!spot) return state;

  const next = clone(state);
  const key = hotspotKey(next.scene, hotspotId);
  const record = spotOf(next, key);
  next.moves += 1;

  if (spot.requires && !record.cleared) {
    markSpot(next, key);
    const held = next.inventory.includes(spot.requires);
    const text = held
      ? `${spot.lockedText}\n（背包裡的${itemName(spot.requires)}也許就是——先點它，再點這裡。）`
      : spot.lockedText;
    return emit(next, text, held ? "info" : "fail", held ? "click" : "error");
  }

  if (spot.needsFlag && !next.flags[spot.needsFlag] && !record.cleared) {
    markSpot(next, key);
    return emit(next, spot.needsFlagText, "fail", "error");
  }

  if (record.cleared || record.examined > 0) {
    markSpot(next, key);
    const bonus = tryBonus(next, spot, record);
    if (bonus) return settle(emit(next, bonus, "solve", "found"));
    return emit(next, spot.repeat ?? spot.look, "info", "click");
  }

  const rewarding = Boolean(spot.gives || spot.sets || spot.relief);
  markSpot(next, key, { cleared: rewarding });
  const extra = collect(next, spot);
  const bonus = tryBonus(next, spot, { ...record, cleared: rewarding });
  if (bonus) extra.push(bonus);
  const found = extra.length > 0;
  return settle(
    emit(
      next,
      [spot.look, ...extra].join("\n"),
      found ? "found" : "info",
      found ? (spot.sound ?? "found") : (spot.sound ?? "click")
    )
  );
}

export function useItem(state, itemId, hotspotId) {
  if (state.phase !== "playing") return state;
  if (!state.inventory.includes(itemId)) return state;
  const spot = findHotspot(state.scene, hotspotId);
  if (!spot) return state;

  const next = clone(state);
  const key = hotspotKey(next.scene, hotspotId);
  const record = spotOf(next, key);
  next.moves += 1;

  if (spot.requires === itemId && !record.cleared) {
    markSpot(next, key, { cleared: true });
    next.selected = null;
    const extra = collect(next, spot);
    const bonus = tryBonus(next, spot, { ...record, cleared: true });
    if (bonus) extra.push(bonus);
    return settle(emit(next, [spot.useText, ...extra].join("\n"), "solve", spot.sound ?? "solved"));
  }

  if (spot.bonus?.needs.includes(itemId)) {
    const bonus = tryBonus(next, spot, record);
    if (bonus) {
      next.selected = null;
      markSpot(next, key);
      return settle(emit(next, bonus, "solve", "found"));
    }
  }

  // 用錯就把東西放回背包：不然下一次點光點還會被當成「再用一次」，一路連環扣。
  slip(next);
  next.selected = null;
  return settle(
    emit(next, `「${itemName(itemId)}」在${spot.name}上派不上用場。（放回背包）`, "fail", "error")
  );
}

/* ---------- 背包 ---------- */

/** 點道具：第一下拿起來，點第二件就嘗試組合，點同一件放下。 */
export function tapItem(state, itemId) {
  if (state.phase !== "playing") return state;
  if (!state.inventory.includes(itemId)) return state;
  if (state.selected === itemId) {
    const next = clone(state);
    next.selected = null;
    return emit(next, `放下${itemName(itemId)}。`, "info", "click");
  }
  if (state.selected) return combine(state, state.selected, itemId);
  const next = clone(state);
  next.selected = itemId;
  return emit(
    next,
    `${ITEMS[itemId].desc}\n（拿著它點光點＝使用；點另一件道具＝組合。）`,
    "info",
    "click"
  );
}

export function findCombo(a, b) {
  return (
    COMBOS.find((combo) => (combo.a === a && combo.b === b) || (combo.a === b && combo.b === a)) ??
    null
  );
}

export function combine(state, a, b) {
  if (state.phase !== "playing") return state;
  if (a === b) return state;
  if (!state.inventory.includes(a) || !state.inventory.includes(b)) return state;

  const next = clone(state);
  next.moves += 1;
  next.selected = null;
  const combo = findCombo(a, b);
  if (!combo) {
    slip(next);
    return settle(emit(next, `${itemName(a)}跟${itemName(b)}兜不起來。`, "fail", "error"));
  }

  next.inventory = next.inventory.filter((id) => !combo.consumes.includes(id));
  giveItem(next, combo.result);
  if (combo.sets) next.flags = { ...next.flags, [combo.sets]: true };
  return settle(
    emit(
      next,
      `${combo.text}\n〔收進背包〕${itemName(combo.result)}`,
      "solve",
      combo.sound ?? "solved"
    )
  );
}

/* ---------- 讀信與寫信封 ---------- */

export function letterText(state) {
  return state.flags.readLetter ? LETTER_TEXT : null;
}

export function findRecipient(id) {
  return RECIPIENTS.find((person) => person.id === id) ?? null;
}

/** 手上的線索夠不夠把名字寫上信封。 */
export function canWriteName(state) {
  if (!state.flags.readLetter) return false;
  return NAME_NEEDS.every((flag) => Boolean(state.flags[flag]));
}

export function missingNameClues(state) {
  return NAME_NEEDS.filter((flag) => !state.flags[flag]);
}

export function writeName(state, recipientId) {
  if (state.phase !== "playing") return state;
  if (!isEpilogue(state)) return state;
  const person = findRecipient(recipientId);
  if (!person) return state;

  const next = clone(state);
  next.moves += 1;

  if (!canWriteName(next)) {
    return emit(next, NAME_NEEDS_TEXT, "fail", "error");
  }

  if (person.correct) {
    next.phase = "won";
    next.panel = "ending";
    next.selected = null;
    return emit(next, WIN_TEXT, "verdict", "sent");
  }

  next.wrongNames = [...next.wrongNames, person.id];
  next.mistakes += 1;
  raiseStorm(next, STORM_PER_WRONG_NAME);
  return settleStorm(emit(next, person.wrong, "fail", "gust"));
}

/* ---------- 面板／教學 ---------- */

export function openPanel(state, panel) {
  const next = clone(state);
  next.panel = panel;
  next.selected = null;
  return next;
}

export function closePanel(state) {
  const next = clone(state);
  next.panel = null;
  return next;
}

export function advanceTutorial(state) {
  const next = clone(state);
  next.tutorial = Math.min(TUTORIAL.length, next.tutorial + 1);
  return next;
}

export function skipTutorial(state) {
  const next = clone(state);
  next.tutorial = TUTORIAL.length;
  return next;
}

export function tutorialText(state) {
  return state.tutorial < TUTORIAL.length ? TUTORIAL[state.tutorial] : null;
}

/* ---------- 卡關提示 ---------- */

const has = (state, id) => state.inventory.includes(id);

/** 依當前章節推出「下一步該做什麼」。不會直接講答案，但一定指得出方向。 */
export function hint(state) {
  if (state.phase !== "playing") return null;

  if (isEpilogue(state)) {
    if (!state.flags.knowsPhonebook) {
      return "信裡只喊了「秀英」。前廳電話桌上壓著一本電話簿，翻開的那頁有人畫過線。";
    }
    return "按「寫信封」，把線索本裡的四條對起來，挑一個名字寫上去。";
  }

  switch (currentChapter(state).id) {
    case "light":
      if (!state.flags.hasLight) {
        if (!has(state, "torch")) return "屋裡太暗了。阿嬤的床頭櫃抽屜通常放手電筒。";
        if (!has(state, "battery")) {
          return has(state, "screwdriver")
            ? "手電筒沒電。桌上那台收音機的背板，用起子就拆得開。"
            : "手電筒沒電。餅乾盒裡除了鈕釦，還有一把小起子。";
        }
        return "電池跟手電筒都在背包裡了——連點兩件道具就會組起來。";
      }
      return "有光了。加蓋最右邊那道鐵門通往曬衣平台，門閂就在腰的高度。";

    case "storm":
      if (!state.flags.panelWeighted) {
        return has(state, "brick")
          ? "屋頂那片浪板一直跳。拿紅磚點它，把它壓住。"
          : "屋頂那片浪板一直跳，要有重量壓住。平台角落的花盆底下墊了東西。";
      }
      if (!state.flags.stairOpen) {
        return has(state, "storagekey")
          ? "紅膠帶那把鑰匙，拿去開平台邊的樓梯間鐵門。"
          : "樓梯間的鐵門鎖著。水塔爬梯的掛鉤上，阿嬤習慣掛鑰匙。";
      }
      return "浪板壓住了，門也開了。往樓梯間走。";

    case "trail": {
      if (!state.flags.hasLight) return "樓梯間沒有窗。沒有光，什麼都翻不動。";
      if (!has(state, "photo")) return "加蓋的紙箱山最底下那箱寫著「相片　勿丟」。";
      if (!has(state, "census")) return "儲藏室的木層架上，有一本藍皮的戶口名簿。";
      if (!has(state, "postcard")) return "儲藏室那只舊皮箱，扣環一扳就開。";
      if (!state.flags.hallOpen) return "前廳木門的門把壞了，卡榫斷在裡面。用起子撬。";
      return "三張紙都在手上了，門也開了。";
    }

    case "letter":
      if (!has(state, "brasskey")) return "鐵盒有鎖。儲藏室牆上那件舊外套，右邊口袋裡有東西。";
      if (!has(state, "tinbox")) return "位置圖說得很清楚：前廳神明桌下，第二格。";
      return "紅鐵盒跟小銅鑰匙都在背包裡了——連點兩件就會打開。";

    default:
      return null;
  }
}

/* ---------- 結算 ---------- */

export function noteCount(state) {
  return NOTES.filter((note) => state.flags[note.flag]).length;
}

export function score(state) {
  if (state.phase !== "won") return 0;
  const base = 900 - state.storm * 70 - state.mistakes * 40 + noteCount(state) * 25;
  return Math.max(100, base + state.shelter * 20);
}

export function rating(state) {
  if (state.phase !== "won") return "沒寄出去";
  if (state.mistakes === 0 && state.storm === 0) return "沒淋到雨";
  if (state.storm <= 3) return "趕在雨前";
  if (state.storm <= 6) return "淋成落湯雞";
  return "擦線寄出";
}

/** 這個熱點還有沒有事可做（含手上道具剛好能觸發的追加線索）。 */
export function spotPending(state, sceneId, spot) {
  const record = spotOf(state, hotspotKey(sceneId, spot.id));
  const rewarding = Boolean(spot.gives || spot.sets || spot.relief || spot.requires);
  if (rewarding && !record.cleared) return true;
  if (
    spot.bonus &&
    !state.flags[spot.bonus.sets] &&
    (!spot.requires || record.cleared) &&
    spot.bonus.needs.every((need) => state.inventory.includes(need))
  ) {
    return true;
  }
  return record.examined === 0;
}

export function pendingCount(state, sceneId) {
  if (!canEnter(state, sceneId)) return 0;
  return SCENES[sceneId].hotspots.filter((spot) => spotPending(state, sceneId, spot)).length;
}

export function progress(state) {
  const total = SCENE_ORDER.reduce((sum, id) => sum + SCENES[id].hotspots.length, 0);
  const searched = Object.values(state.spots).filter((spot) => spot.examined > 0).length;
  return {
    searched,
    total,
    scenes: SCENE_ORDER.filter((id) => state.seen[id]).length,
    sceneTotal: SCENE_ORDER.length,
    items: state.inventory.length,
    notes: noteCount(state),
    storm: state.storm,
    shelter: state.shelter,
    chapter: chapterNo(state),
    chapterTotal: CHAPTERS.length,
  };
}

/* ---------- 存檔 ---------- */

export function serialize(state) {
  return {
    version: SAVE_VERSION,
    scene: state.scene,
    seen: state.seen,
    spots: state.spots,
    inventory: state.inventory,
    flags: state.flags,
    chapter: state.chapter,
    storm: state.storm,
    shelter: state.shelter,
    mistakes: state.mistakes,
    moves: state.moves,
    wrongNames: state.wrongNames,
    phase: state.phase,
    tutorial: state.tutorial,
    log: state.log.slice(-6),
  };
}

export function restore(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.version !== SAVE_VERSION) return null;
  if (!SCENES[raw.scene]) return null;
  if (!Array.isArray(raw.inventory)) return null;
  const base = createGame();
  const clampInt = (value, min, max, fallback) =>
    Number.isFinite(value) ? Math.min(max, Math.max(min, Math.trunc(value))) : fallback;
  return {
    ...base,
    scene: raw.scene,
    seen: { ...base.seen, ...(raw.seen ?? {}) },
    spots: raw.spots && typeof raw.spots === "object" ? raw.spots : {},
    inventory: raw.inventory.filter((id) => ITEMS[id]),
    flags: { ...(raw.flags ?? {}) },
    chapter: clampInt(raw.chapter, 0, CHAPTERS.length, 0),
    storm: clampInt(raw.storm, 0, STORM_MAX, 0),
    shelter: clampInt(raw.shelter, 0, SHELTER_MAX, 0),
    mistakes: clampInt(raw.mistakes, 0, Number.MAX_SAFE_INTEGER, 0),
    moves: clampInt(raw.moves, 0, Number.MAX_SAFE_INTEGER, 0),
    wrongNames: Array.isArray(raw.wrongNames) ? raw.wrongNames.filter((id) => findRecipient(id)) : [],
    phase: ["playing", "won", "lost"].includes(raw.phase) ? raw.phase : "playing",
    tutorial: clampInt(raw.tutorial, 0, TUTORIAL.length, 0),
    log: Array.isArray(raw.log) && raw.log.length ? raw.log : base.log,
  };
}
