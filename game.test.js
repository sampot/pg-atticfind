import { describe, expect, it } from "vitest";

import { ART_HEIGHT, ART_WIDTH, sceneArt } from "./art.js";
import {
  CHAPTERS,
  ITEMS,
  NOTES,
  RECIPIENTS,
  SCENES,
  SCENE_ORDER,
  STORM_MAX,
  STORM_PER_WRONG_NAME,
} from "./content.js";
import * as G from "./game.js";

/* ---------- 測試用小工具 ---------- */

const take = (state, hotspotId) => G.tapHotspot(state, hotspotId);
const hold = (state, itemId) => G.tapItem(state, itemId);

/** 先拿起道具再點熱點＝使用（用錯時道具還在手上，不必重撿）。 */
function useOn(state, itemId, hotspotId) {
  const held = state.selected === itemId ? state : hold(state, itemId);
  return G.tapHotspot(held, hotspotId);
}

/** 第一章：拆收音機拿電池，點亮手電筒，拉開平台鐵門。 */
function throughAttic(state = G.createGame()) {
  let s = take(state, "bed"); // 手電筒
  s = take(s, "tin"); // 十字起子
  s = useOn(s, "screwdriver", "radio"); // 乾電池
  s = G.combine(s, "torch", "battery"); // 亮著的手電筒 → hasLight
  return take(s, "door_deck"); // deckOpen → 第一章完
}

/** 第二章：壓住浪板、拿到紅膠帶鑰匙、打開樓梯間，走下去。 */
function throughDeck(state = throughAttic()) {
  let s = G.travel(state, "deck");
  s = take(s, "pots"); // 紅磚
  s = useOn(s, "brick", "panel"); // panelWeighted
  s = take(s, "tank"); // 紅膠帶鑰匙
  s = useOn(s, "storagekey", "door_storage"); // stairOpen → 第二章完
  return G.travel(s, "storage");
}

/** 第三章：湊齊三張紙（照片在加蓋），順手拿銅鑰匙，撬開前廳。 */
function throughStorage(state = throughDeck()) {
  let s = take(state, "shelf"); // 戶口名簿
  s = take(s, "suitcase"); // 明信片
  s = take(s, "coat"); // 小銅鑰匙
  s = G.travel(s, "attic");
  s = take(s, "boxes"); // 黑白合照
  s = G.travel(s, "storage");
  s = useOn(s, "screwdriver", "door_hall"); // hallOpen → 第三章完
  return G.travel(s, "hall");
}

/** 第四章：翻出紅鐵盒並打開，拿到那封信 → 進入尾聲。 */
function throughBox(state = throughStorage()) {
  const s = take(state, "altar"); // 紅鐵盒
  return G.combine(s, "tinbox", "brasskey"); // 沒寄出的信 → 尾聲
}

/** 尾聲前最後一塊：電話簿確認人還在台南。 */
function readyToWrite(state = throughBox()) {
  return take(state, "phone");
}

/** 同一條路，但沿途把屋頂顧好：壓磚、綁繩、清排水口。 */
function carefulRun() {
  let s = G.travel(throughAttic(), "deck");
  s = take(s, "pots");
  s = useOn(s, "brick", "panel"); // 壓住
  s = take(s, "line");
  s = useOn(s, "rope", "panel"); // 綁緊
  s = take(s, "drain"); // 清排水
  s = take(s, "tank");
  s = useOn(s, "storagekey", "door_storage");
  return readyToWrite(throughBox(throughStorage(G.travel(s, "storage"))));
}

/* ---------- 開局 ---------- */

describe("開局", () => {
  it("從頂樓加蓋開始，背包空的，風雨還沒起來", () => {
    const s = G.createGame();
    expect(s.scene).toBe("attic");
    expect(s.inventory).toEqual([]);
    expect(s.phase).toBe("playing");
    expect(s.storm).toBe(0);
    expect(s.chapter).toBe(0);
  });

  it("只有加蓋是一開始就進得去的", () => {
    const s = G.createGame();
    expect(SCENE_ORDER.filter((id) => G.canEnter(s, id))).toEqual(["attic"]);
  });

  it("開場停在第一章，而且說得出這一章要做什麼", () => {
    const s = G.createGame();
    expect(G.chapterNo(s)).toBe(1);
    expect(G.currentChapter(s).id).toBe("light");
    expect(G.isEpilogue(s)).toBe(false);
  });
});

/* ---------- 搜查熱點 ---------- */

describe("搜查熱點", () => {
  it("搜床頭櫃會撿到手電筒", () => {
    const s = take(G.createGame(), "bed");
    expect(s.inventory).toContain("torch");
    expect(s.event.kind).toBe("found");
  });

  it("同一個熱點不會給第二份", () => {
    const s = take(take(G.createGame(), "bed"), "bed");
    expect(s.inventory.filter((id) => id === "torch")).toHaveLength(1);
  });

  it("沒有光就翻不動紙箱山，也不會偷偷給照片", () => {
    const s = take(G.createGame(), "boxes");
    expect(s.inventory).not.toContain("photo");
    expect(s.event.kind).toBe("fail");
    expect(s.flags.knowsAnping).toBeFalsy();
  });

  it("空手搜鎖著的收音機不算失誤，風雨不會漲", () => {
    const s = take(G.createGame(), "radio");
    expect(s.event.kind).toBe("fail");
    expect(s.storm).toBe(0);
    expect(s.mistakes).toBe(0);
  });

  it("熱點做完就不再是待辦，場景的待辦數會減少", () => {
    const before = G.pendingCount(G.createGame(), "attic");
    const after = G.pendingCount(take(G.createGame(), "bed"), "attic");
    expect(after).toBe(before - 1);
  });

  it("純敘事的熱點看過一次就不再閃，但還點得動", () => {
    const s = take(G.createGame(), "calendar");
    const spot = SCENES.attic.hotspots.find((x) => x.id === "calendar");
    expect(G.spotPending(s, "attic", spot)).toBe(false);
    expect(take(s, "calendar").event.text).toBe(spot.repeat);
  });
});

/* ---------- 使用道具 ---------- */

describe("使用道具", () => {
  it("用起子拆收音機才拿得到電池，而且道具會放回背包", () => {
    let s = take(take(G.createGame(), "bed"), "tin");
    s = useOn(s, "screwdriver", "radio");
    expect(s.inventory).toContain("battery");
    expect(s.inventory).toContain("screwdriver");
    expect(s.selected).toBeNull();
  });

  it("拿錯道具去用會被打回票，而且算一次失誤", () => {
    const s = useOn(take(G.createGame(), "bed"), "torch", "calendar");
    expect(s.event.kind).toBe("fail");
    expect(s.mistakes).toBe(1);
    expect(s.storm).toBe(1);
  });

  it("壓住浪板會把已經淋到的風雨壓回去", () => {
    let s = G.travel(throughAttic(), "deck");
    expect(s.storm).toBe(1);
    s = take(s, "pots");
    s = useOn(s, "brick", "panel");
    expect(s.flags.panelWeighted).toBe(true);
    expect(s.storm).toBe(0);
  });

  it("壓不掉的部分會存成加固，之後風雨要漲會先扣它", () => {
    let s = G.travel(throughAttic(), "deck");
    s = useOn(take(s, "pots"), "brick", "panel"); // −2：先扣掉 1 格風雨，剩的存起來
    expect(s.storm).toBe(0);
    expect(s.shelter).toBe(1);
    s = take(s, "line");
    s = useOn(s, "rope", "panel"); // 追加動作再 −1，全部存成加固
    expect(s.flags.panelTied).toBe(true);
    expect(s.shelter).toBe(2);
    expect(s.storm).toBe(0);
  });

  it("手上已經有繩子的話，壓浪板那一下會連綁一起做完", () => {
    let s = G.travel(throughAttic(), "deck");
    s = take(take(s, "pots"), "line");
    s = useOn(s, "brick", "panel");
    expect(s.flags.panelWeighted).toBe(true);
    expect(s.flags.panelTied).toBe(true);
    expect(s.event.text).toContain("死結");
  });

  it("同一段追加動作不會重複領獎，再綁一次只是白費力氣", () => {
    let s = G.travel(throughAttic(), "deck");
    s = take(take(s, "pots"), "line");
    s = useOn(s, "brick", "panel");
    const after = useOn(s, "rope", "panel");
    expect(after.flags.panelTied).toBe(true);
    expect(after.mistakes).toBe(s.mistakes + 1);
    expect(after.shelter).toBe(s.shelter - 1);
  });

  it("清排水口不必道具，但一樣算加固，而且只算一次", () => {
    let s = G.travel(throughAttic(), "deck");
    s = take(s, "drain");
    expect(s.flags.drainClear).toBe(true);
    expect(s.storm).toBe(0);
    const again = take(s, "drain");
    expect(again.storm).toBe(s.storm);
    expect(again.shelter).toBe(s.shelter);
  });

  it("用錯的道具會自動放回背包，不會一路連環扣", () => {
    let s = take(G.createGame(), "bed");
    s = useOn(s, "torch", "calendar");
    expect(s.selected).toBeNull();
    expect(s.mistakes).toBe(1);
    const next = take(s, "tin"); // 這一下該是搜查，不是再用一次手電筒
    expect(next.inventory).toContain("screwdriver");
    expect(next.mistakes).toBe(1);
  });
});

/* ---------- 組合道具 ---------- */

describe("組合道具", () => {
  const withParts = () => useOn(take(take(G.createGame(), "bed"), "tin"), "screwdriver", "radio");

  it("手電筒加電池就亮了，並吃掉兩件原料", () => {
    const s = G.combine(withParts(), "torch", "battery");
    expect(s.inventory).toContain("lamp");
    expect(s.inventory).not.toContain("torch");
    expect(s.inventory).not.toContain("battery");
    expect(s.flags.hasLight).toBe(true);
  });

  it("連點兩件背包道具＝組合（不必另外按鈕）", () => {
    const s = hold(hold(withParts(), "torch"), "battery");
    expect(s.inventory).toContain("lamp");
  });

  it("兜不起來的兩件東西不會變出新道具，還會記一次失誤", () => {
    const s = G.combine(withParts(), "torch", "screwdriver");
    expect(s.inventory).not.toContain("lamp");
    expect(s.event.kind).toBe("fail");
    expect(s.mistakes).toBe(1);
  });

  it("紅鐵盒配小銅鑰匙才打得開，開了才讀得到信", () => {
    const before = throughStorage();
    expect(G.letterText(before)).toBeNull();
    const s = throughBox(before);
    expect(s.inventory).toContain("letter");
    expect(s.flags.readLetter).toBe(true);
    expect(G.letterText(s)).toContain("秀英");
  });
});

/* ---------- 場景移動 ---------- */

describe("場景移動", () => {
  it("鎖著的場景進不去，而且會說出下一步該做什麼", () => {
    const s = G.travel(G.createGame(), "deck");
    expect(s.scene).toBe("attic");
    expect(s.event.kind).toBe("fail");
    expect(s.event.text).toBe(SCENES.deck.lockedHint);
  });

  it("四個場景照章節依序解鎖", () => {
    expect(G.canEnter(G.createGame(), "deck")).toBe(false);
    expect(G.canEnter(throughAttic(), "deck")).toBe(true);
    expect(G.canEnter(throughAttic(), "storage")).toBe(false);
    expect(G.canEnter(throughDeck(), "storage")).toBe(true);
    expect(G.canEnter(throughDeck(), "hall")).toBe(false);
    expect(G.canEnter(throughStorage(), "hall")).toBe(true);
  });

  it("走過去就記下這個場景去過了", () => {
    const s = throughDeck();
    expect(s.scene).toBe("storage");
    expect(s.seen.storage).toBe(true);
  });
});

/* ---------- 章節推進 ---------- */

describe("章節推進", () => {
  it("光還沒亮，第一章就不會過", () => {
    const s = G.combine(take(take(G.createGame(), "bed"), "tin"), "torch", "battery");
    expect(s.inventory).not.toContain("lamp");
    expect(G.chapterNo(s)).toBe(1);
  });

  it("點亮手電筒又拉開鐵門，第一章才推進並打開平台", () => {
    const s = throughAttic();
    expect(s.chapter).toBe(1);
    expect(s.flags.openDeck).toBe(true);
    expect(s.event.kind).toBe("chapter");
    expect(s.event.text).toContain(CHAPTERS[0].title);
  });

  it("每推進一章，風雨就往上一格", () => {
    expect(throughAttic().storm).toBe(1);
    expect(throughStorage().chapter).toBe(3);
  });

  it("第三章要三張紙齊全，缺一張就不推進", () => {
    let s = take(take(throughDeck(), "shelf"), "suitcase");
    s = useOn(s, "screwdriver", "door_hall");
    expect(s.flags.hallOpen).toBe(true);
    expect(s.chapter).toBe(2);
    expect(G.canEnter(s, "hall")).toBe(false);
  });

  it("第三章推進時會交出鐵盒的位置", () => {
    const s = throughStorage();
    expect(s.flags.knowsHiding).toBe(true);
    expect(G.canEnter(s, "hall")).toBe(true);
  });

  it("不知道位置就翻不出神明桌下的鐵盒", () => {
    const blind = { ...throughStorage(), flags: { ...throughStorage().flags, knowsHiding: false } };
    const s = take(blind, "altar");
    expect(s.inventory).not.toContain("tinbox");
    expect(s.event.kind).toBe("fail");
  });

  it("讀到信就走完四章，進入尾聲", () => {
    const s = throughBox();
    expect(s.chapter).toBe(CHAPTERS.length);
    expect(G.isEpilogue(s)).toBe(true);
    expect(G.chapterNo(s)).toBe(CHAPTERS.length);
  });
});

/* ---------- 寫信封（推理） ---------- */

describe("寫信封", () => {
  it("還沒讀到信之前，根本不能寫信封", () => {
    const s = throughStorage();
    expect(G.canWriteName(s)).toBe(false);
    expect(G.writeName(s, "sister")).toBe(s);
  });

  it("只知道三十年前遷去哪還不夠，會被擋下來並說明缺什麼", () => {
    const s = throughBox();
    expect(G.canWriteName(s)).toBe(false);
    expect(G.missingNameClues(s)).toEqual(["knowsPhonebook"]);
    const blocked = G.writeName(s, "sister");
    expect(blocked.phase).toBe("playing");
    expect(blocked.event.kind).toBe("fail");
  });

  it("翻過電話簿之後線索就齊了", () => {
    const s = readyToWrite();
    expect(s.flags.knowsPhonebook).toBe(true);
    expect(G.canWriteName(s)).toBe(true);
    expect(G.missingNameClues(s)).toEqual([]);
  });

  it("寫錯名字不會直接輸，但雨會灌進來一大段", () => {
    const before = readyToWrite();
    const s = G.writeName(before, "landlord");
    expect(s.phase).toBe("playing");
    expect(s.storm).toBe(before.storm + STORM_PER_WRONG_NAME);
    expect(s.wrongNames).toEqual(["landlord"]);
    expect(s.event.text).toContain("房租");
  });

  it("每個錯的候選人都有自己的反駁，不是同一句罐頭", () => {
    const before = readyToWrite();
    const texts = RECIPIENTS.filter((p) => !p.correct).map(
      (p) => G.writeName(before, p.id).event.text
    );
    expect(new Set(texts).size).toBe(texts.length);
  });

  it("寫對名字＝把信寄出去，通關", () => {
    const s = G.writeName(readyToWrite(), "sister");
    expect(s.phase).toBe("won");
    expect(s.event.text).toContain("林秀英");
    expect(G.score(s)).toBeGreaterThan(0);
    expect(G.rating(s)).not.toBe("沒寄出去");
  });
});

/* ---------- 風雨與失敗 ---------- */

describe("風雨與失敗", () => {
  it("風雨會照級距換說法", () => {
    const base = G.createGame();
    expect(G.stormStage({ ...base, storm: 0 })).toBe("風起");
    expect(G.stormStage({ ...base, storm: 4 })).toBe("落雨");
    expect(G.stormStage({ ...base, storm: 7 })).toBe("鐵皮在跳");
  });

  it("一直用錯道具，風雨滿格就守不住", () => {
    let s = take(G.createGame(), "bed");
    for (let i = 0; i < STORM_MAX; i += 1) s = useOn(s, "torch", "calendar");
    expect(s.storm).toBe(STORM_MAX);
    expect(s.phase).toBe("lost");
    expect(s.event.text).toContain("掀走");
  });

  it("信封連寫錯兩次也會輸", () => {
    let s = G.writeName(readyToWrite(), "landlord");
    expect(s.phase).toBe("playing");
    s = G.writeName(s, "zhou");
    expect(s.phase).toBe("lost");
  });

  it("結束之後任何操作都不再生效", () => {
    let s = take(G.createGame(), "bed");
    for (let i = 0; i < STORM_MAX; i += 1) s = useOn(s, "torch", "calendar");
    expect(take(s, "tin").inventory).not.toContain("screwdriver");
    expect(G.travel(s, "attic")).toBe(s);
    expect(G.score(s)).toBe(0);
    expect(G.rating(s)).toBe("沒寄出去");
  });

  it("一路顧著屋頂走，通關時完全沒淋到雨", () => {
    const plain = G.writeName(readyToWrite(), "sister");
    const won = G.writeName(carefulRun(), "sister");
    expect(won.phase).toBe("won");
    expect(won.storm).toBe(0);
    expect(won.storm).toBeLessThan(plain.storm);
    expect(G.rating(won)).toBe("沒淋到雨");
    expect(G.rating(plain)).toBe("趕在雨前");
    expect(G.score(won)).toBeGreaterThan(G.score(plain));
  });
});

/* ---------- 卡關提示 ---------- */

describe("卡關提示", () => {
  it("開局就指得出第一步", () => {
    expect(G.hint(G.createGame())).toContain("床頭櫃");
  });

  it("手電筒沒電的時候會指向起子跟收音機", () => {
    const s = take(G.createGame(), "bed");
    expect(G.hint(s)).toContain("起子");
    expect(G.hint(take(s, "tin"))).toContain("收音機");
  });

  it("提示會跟著章節走", () => {
    expect(G.hint(throughAttic())).toContain("平台");
    expect(G.hint(G.travel(throughAttic(), "deck"))).toContain("浪板");
    expect(G.hint(throughDeck())).toContain("相片");
    expect(G.hint(throughStorage())).toContain("神明桌");
  });

  it("尾聲缺線索時會指向電話簿，齊了就叫你寫信封", () => {
    expect(G.hint(throughBox())).toContain("電話簿");
    expect(G.hint(readyToWrite())).toContain("寫信封");
  });

  it("結束之後就沒有提示了", () => {
    expect(G.hint(G.writeName(readyToWrite(), "sister"))).toBeNull();
  });
});

/* ---------- 進度與教學 ---------- */

describe("進度與教學", () => {
  it("進度會算出搜過幾處、走過幾個場景、抄到幾條線索", () => {
    const s = throughStorage();
    const stat = G.progress(s);
    expect(stat.total).toBe(SCENE_ORDER.reduce((n, id) => n + SCENES[id].hotspots.length, 0));
    expect(stat.searched).toBeGreaterThan(0);
    expect(stat.scenes).toBe(4);
    expect(stat.notes).toBe(G.noteCount(s));
    expect(stat.chapterTotal).toBe(CHAPTERS.length);
  });

  it("教學只有三步，可以一路看完或直接略過", () => {
    let s = G.createGame();
    expect(G.tutorialText(s)).toBeTruthy();
    s = G.advanceTutorial(G.advanceTutorial(G.advanceTutorial(s)));
    expect(G.tutorialText(s)).toBeNull();
    expect(G.tutorialText(G.skipTutorial(G.createGame()))).toBeNull();
  });
});

/* ---------- 存檔 ---------- */

describe("存檔", () => {
  it("序列化再讀回來，進度不會掉", () => {
    const s = throughStorage();
    const back = G.restore(G.serialize(s));
    expect(back.scene).toBe(s.scene);
    expect(back.inventory).toEqual(s.inventory);
    expect(back.flags).toEqual(s.flags);
    expect(back.chapter).toBe(s.chapter);
    expect(back.storm).toBe(s.storm);
  });

  it("版本不合或壞掉的存檔一律當作沒有", () => {
    expect(G.restore(null)).toBeNull();
    expect(G.restore({ ...G.serialize(G.createGame()), version: 99 })).toBeNull();
    expect(G.restore({ ...G.serialize(G.createGame()), scene: "地下室" })).toBeNull();
  });

  it("讀檔會濾掉不存在的道具，章節與風雨也夾回合法範圍", () => {
    const raw = {
      ...G.serialize(G.createGame()),
      inventory: ["torch", "幽靈道具"],
      chapter: 99,
      storm: -5,
    };
    const back = G.restore(raw);
    expect(back.inventory).toEqual(["torch"]);
    expect(back.chapter).toBe(CHAPTERS.length);
    expect(back.storm).toBe(0);
  });
});

/* ---------- 資料完整性 ---------- */

describe("資料完整性", () => {
  it("四個場景都有熱點，座標都落在畫面內", () => {
    expect(SCENE_ORDER).toHaveLength(4);
    for (const sceneId of SCENE_ORDER) {
      expect(SCENES[sceneId].hotspots.length).toBeGreaterThanOrEqual(6);
      for (const spot of SCENES[sceneId].hotspots) {
        expect(spot.look, `${sceneId}.${spot.id}`).toBeTruthy();
        expect(spot.cx).toBeGreaterThanOrEqual(0);
        expect(spot.cx).toBeLessThanOrEqual(100);
        expect(spot.cy).toBeGreaterThanOrEqual(0);
        expect(spot.cy).toBeLessThanOrEqual(100);
      }
    }
  });

  it("熱點提到的道具都真的存在，鎖著的熱點都寫得出上鎖說明", () => {
    for (const sceneId of SCENE_ORDER) {
      for (const spot of SCENES[sceneId].hotspots) {
        const where = `${sceneId}.${spot.id}`;
        if (spot.gives) expect(ITEMS[spot.gives], where).toBeTruthy();
        if (spot.requires) {
          expect(ITEMS[spot.requires], where).toBeTruthy();
          expect(spot.lockedText, where).toBeTruthy();
          expect(spot.useText, where).toBeTruthy();
        }
        if (spot.needsFlag) expect(spot.needsFlagText, where).toBeTruthy();
      }
    }
  });

  it("每個上鎖的場景都剛好由一個章節打開", () => {
    const opened = CHAPTERS.map((chapter) => chapter.opens).filter(Boolean);
    for (const sceneId of SCENE_ORDER) {
      if (!SCENES[sceneId].needs) continue;
      expect(opened.filter((id) => id === sceneId), sceneId).toHaveLength(1);
    }
  });

  it("線索本上的每一條，都有地方真的設得出那個旗標", () => {
    const settable = new Set();
    for (const sceneId of SCENE_ORDER) {
      for (const spot of SCENES[sceneId].hotspots) {
        if (spot.sets) settable.add(spot.sets);
        if (spot.bonus?.sets) settable.add(spot.bonus.sets);
      }
    }
    for (const chapter of CHAPTERS) if (chapter.sets) settable.add(chapter.sets);
    settable.add("hasLight").add("readLetter");
    for (const note of NOTES) expect(settable.has(note.flag), note.flag).toBe(true);
  });

  it("收件人剛好一個是對的，其他三個都寫得出反駁", () => {
    expect(RECIPIENTS.filter((person) => person.correct)).toHaveLength(1);
    for (const person of RECIPIENTS) {
      if (!person.correct) expect(person.wrong, person.id).toBeTruthy();
    }
  });

  it("四個場景都畫得出圖，畫布尺寸跟熱點座標系一致", () => {
    for (const sceneId of SCENE_ORDER) {
      const svg = sceneArt(sceneId);
      expect(svg, sceneId).toContain(`viewBox="0 0 ${ART_WIDTH} ${ART_HEIGHT}"`);
      expect(svg.match(/<svg/g), sceneId).toHaveLength(1);
      expect(svg.trim().endsWith("</svg>"), sceneId).toBe(true);
    }
  });

  it("認不得的場景會退回開場那張圖，不會畫出空白", () => {
    expect(sceneArt("不存在的場景")).toBe(sceneArt("attic"));
  });

  // 手機上熱點要點得到，又不能互相搶點：360px 寬時每個熱點都撐得起 44×44 的觸控區。
  it("360px 手機上，任兩個熱點的 44px 觸控區不會重疊", () => {
    const stageWidth = 344; // 360 扣掉版面左右留白
    const stageHeight = (stageWidth * ART_HEIGHT) / ART_WIDTH;
    const touch = 44;

    for (const sceneId of SCENE_ORDER) {
      const spots = SCENES[sceneId].hotspots;
      for (let i = 0; i < spots.length; i += 1) {
        for (let j = i + 1; j < spots.length; j += 1) {
          const a = spots[i];
          const b = spots[j];
          const dx = (Math.abs(a.cx - b.cx) / 100) * stageWidth;
          const dy = (Math.abs(a.cy - b.cy) / 100) * stageHeight;
          expect(
            Math.max(dx, dy),
            `${sceneId}: ${a.name} / ${b.name} 靠太近`
          ).toBeGreaterThanOrEqual(touch);
        }
      }
    }
  });

  it("熱點都待在畫面裡，不會有一半被裁掉", () => {
    for (const sceneId of SCENE_ORDER) {
      for (const spot of SCENES[sceneId].hotspots) {
        const where = `${sceneId}.${spot.name}`;
        expect(spot.cx - spot.w / 2, where).toBeGreaterThanOrEqual(0);
        expect(spot.cx + spot.w / 2, where).toBeLessThanOrEqual(100);
        expect(spot.cy - spot.h / 2, where).toBeGreaterThanOrEqual(0);
        expect(spot.cy + spot.h / 2, where).toBeLessThanOrEqual(100);
      }
    }
  });
});
