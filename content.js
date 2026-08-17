/**
 * 頂樓尋物 — 場景／熱點／道具／章節（純資料，無 DOM）。
 *
 * 座標系：熱點以場景畫布的百分比表示（cx／cy＝中心，w／h＝寬高），
 * 對應 `art.js` 的 viewBox 0 0 320 200。
 */

export const TITLE = "頂樓尋物";
export const SUBTITLE = "一九九九・夏末・颱風前的頂樓加蓋";

export const INTRO =
  "阿嬤走了三個月，房子下個月就要交出去。" +
  "你趁颱風登陸前最後半天，爬上這棟老公寓的頂樓加蓋清東西。" +
  "阿嬤最後一次還清醒的時候，反覆交代同一句話：「紅色那個鐵盒，裡面那封信，要幫我寄出去。」" +
  "她沒說盒子在哪，也沒說要寄給誰。";

/* ---------- 風雨計 ---------- */

/** 風雨滿格＝鐵皮被掀走，這一夜什麼都寄不出去。 */
export const STORM_MAX = 8;
/**
 * 加固：壓鐵皮、清排水口先把風雨壓下去，壓不掉的部分存成「加固」。
 * 之後每次風雨要漲，先扣加固——早一點顧屋頂，後面才有本錢。
 */
export const SHELTER_MAX = 4;
/** 每推進一章，時間就過去一點，風就更大一點。 */
export const STORM_PER_CHAPTER = 1;
/** 用錯道具、亂兜東西：+1。 */
export const STORM_PER_MISTAKE = 1;
/** 收件人寫錯：撕掉信封重寫，代價大得多。 */
export const STORM_PER_WRONG_NAME = 3;

export const STORM_STAGES = [
  { at: 0, label: "風起" },
  { at: 3, label: "落雨" },
  { at: 5, label: "雨勢轉強" },
  { at: 7, label: "鐵皮在跳" },
];

/* ---------- 道具 ---------- */

export const ITEMS = {
  torch: {
    name: "手電筒",
    icon: "⌁",
    desc: "黑色塑膠殼的老手電筒，按鈕按下去只有「喀」一聲。電池槽是空的。",
  },
  screwdriver: {
    name: "十字起子",
    icon: "✜",
    desc: "柄上纏著電火布的小十字起子，尖端磨得發亮。",
  },
  battery: {
    name: "乾電池",
    icon: "▰",
    desc: "兩顆從收音機裡挖出來的碳鋅電池，外皮鏽了一點，還有一格電。",
  },
  lamp: {
    name: "亮著的手電筒",
    icon: "☀",
    desc: "光柱不算亮，邊緣泛黃，但夠你看清楚一個紙箱裡有什麼。",
  },
  rope: {
    name: "曬衣繩",
    icon: "∽",
    desc: "從平台上解下來的尼龍曬衣繩，曬到發白，還很韌。",
  },
  brick: {
    name: "紅磚",
    icon: "▣",
    desc: "墊花盆用的半塊紅磚，沾著乾掉的泥。壓東西剛剛好。",
  },
  storagekey: {
    name: "紅膠帶鑰匙",
    icon: "⚷",
    desc: "一串鑰匙裡最大的那把，鑰匙頭纏著褪色的紅膠帶——阿嬤的標記法。",
  },
  photo: {
    name: "黑白合照",
    icon: "▤",
    desc: "兩個女孩站在鹽田邊，瞇著眼笑。背面鉛筆字：民國五十二年　與秀英　攝於安平。",
  },
  postcard: {
    name: "明信片",
    icon: "✉",
    desc: "郵戳糊了一半，還讀得出「台南　安平」。背面署名只剩一個「英」字。",
  },
  census: {
    name: "戶口名簿",
    icon: "❏",
    desc: "藍皮的舊戶口名簿。妹妹林秀英在民國五十四年遷出，遷往台南市安平區。",
  },
  brasskey: {
    name: "小銅鑰匙",
    icon: "⚿",
    desc: "扁扁的小銅鑰匙，齒很淺，開的不是門——是那種餅乾鐵盒的小鎖。",
  },
  tinbox: {
    name: "紅鐵盒",
    icon: "▩",
    desc: "印著早就倒了的餅乾廠商標，盒緣有一個很小的鎖孔。搖起來裡面有東西在滑。",
  },
  letter: {
    name: "沒寄出的信",
    icon: "✍",
    desc: "寫了一半的信，摺痕已經脆了。信封是空白的——阿嬤始終沒寫上收件人。",
  },
};

/* ---------- 組合 ---------- */

export const COMBOS = [
  {
    a: "torch",
    b: "battery",
    result: "lamp",
    consumes: ["torch", "battery"],
    sets: "hasLight",
    text: "電池塞進去，尾蓋旋緊。第三下按鈕才亮——一圈昏黃的光落在牆上的壁癌。",
    sound: "latch",
  },
  {
    a: "tinbox",
    b: "brasskey",
    result: "letter",
    consumes: ["tinbox", "brasskey"],
    sets: "readLetter",
    text:
      "小銅鑰匙轉了四分之一圈，鎖舌彈開。盒子裡是一疊剪報、一枚生鏽的髮夾，" +
      "還有一封摺好的信，跟一個空白的信封。",
    sound: "solved",
  },
];

/** 讀完信才知道要寄給誰——信的內容本身就是最後一段線索。 */
export const LETTER_TEXT =
  "秀英：\n" +
  "　　鹽田那年妳說要回來看我，我等到現在。我這裡屋頂會漏，人也漏。\n" +
  "　　妳若還在原來那個地方，就回一張明信片給我。地址我寫在後面——\n" +
  "（信就停在這裡。後面那一頁是空白的，信封上也什麼都沒寫。）";

/* ---------- 場景 ---------- */

export const SCENE_ORDER = ["attic", "deck", "storage", "hall"];

export const SCENES = {
  attic: {
    name: "頂樓加蓋",
    short: "加蓋",
    line: "鐵皮屋頂壓得很低。電表跳了，屋裡只剩氣窗透進來的一線灰光。",
    needs: null,
    lockedHint: "",
    hotspots: [
      {
        id: "bed",
        name: "床頭櫃",
        cx: 13,
        cy: 62,
        w: 17,
        h: 24,
        look: "阿嬤的床頭櫃。檯面上是老花眼鏡跟一杯沒喝完的水，抽屜裡躺著一支黑色手電筒。",
        repeat: "抽屜裡剩下藥袋跟一疊選舉傳單。",
        gives: "torch",
        sound: "cloth",
      },
      {
        id: "tin",
        name: "大同餅乾盒",
        cx: 34,
        cy: 76,
        w: 16,
        h: 14,
        look: "鐵餅乾盒裡不是餅乾——是針線、鈕釦，跟一把柄上纏電火布的小十字起子。",
        repeat: "其他都是鈕釦。阿嬤留了一輩子的鈕釦。",
        gives: "screwdriver",
        sound: "metal",
      },
      {
        id: "radio",
        name: "老收音機",
        cx: 57,
        cy: 58,
        w: 17,
        h: 17,
        look: "桌上一台木殼收音機，旋鈕停在中廣。背板用兩顆十字螺絲鎖著。",
        requires: "screwdriver",
        lockedText: "背板鎖著兩顆十字螺絲，指甲轉不開。要有起子。",
        useText: "起子把兩顆螺絲轉開，背板整片掉下來。電池槽裡躺著兩顆乾電池——還有一格電。",
        gives: "battery",
        sound: "metal",
      },
      {
        id: "calendar",
        name: "日曆",
        cx: 44,
        cy: 24,
        w: 13,
        h: 20,
        look: "日曆撕到五月十八號就停了。那天之後，沒有人再撕它。",
        repeat: "五月十八號。紙邊已經卷起來了。",
        sound: "paper",
      },
      {
        id: "window",
        name: "氣窗",
        cx: 66,
        cy: 20,
        w: 16,
        h: 16,
        look: "氣窗的玻璃裂了一道，風從縫裡擠進來，帶著海的味道。廣播說晚上八點登陸。",
        repeat: "風更大了。玻璃在框裡輕輕地敲。",
        sound: "cloth",
      },
      {
        id: "boxes",
        name: "紙箱山",
        cx: 79,
        cy: 64,
        w: 22,
        h: 32,
        look:
          "你把紙箱一箱一箱搬下來。最底下那箱用奇異筆寫著「相片　勿丟」，" +
          "裡面是一張黑白合照：兩個女孩站在鹽田邊。背面有鉛筆字。",
        repeat: "其他箱子是舊衣服跟過期的月餅盒。",
        needsFlag: "hasLight",
        needsFlagText: "紙箱疊到天花板，最裡面那幾箱黑得看不見標籤。要有光才翻得動。",
        gives: "photo",
        sets: "knowsAnping",
        sound: "paper",
      },
      {
        id: "door_deck",
        name: "平台鐵門",
        cx: 95,
        cy: 58,
        w: 10,
        h: 46,
        look: "光柱掃過門邊，門閂就在腰的高度。你把它拉開——風立刻頂著門板推了你一把。",
        repeat: "門開著，外面的天色比屋裡還暗。",
        needsFlag: "hasLight",
        needsFlagText: "門邊全黑。你摸了半天只摸到牆跟一手灰。",
        sets: "deckOpen",
        sound: "door",
      },
    ],
  },

  deck: {
    name: "曬衣平台",
    short: "平台",
    line: "風已經有味道了。水塔架在頭上，鐵皮浪板一片一片被掀得砰砰響。",
    needs: "openDeck",
    lockedHint: "通往平台的鐵門還關著。先讓手電筒亮起來，再去把門閂拉開。",
    hotspots: [
      {
        id: "line",
        name: "曬衣繩",
        cx: 42,
        cy: 28,
        w: 34,
        h: 14,
        look: "三件襯衫還夾在繩子上，早就被吹得皺成一團。你把衣服收下來，順手解了繩子。",
        repeat: "繩子已經在背包裡了。",
        gives: "rope",
        sound: "cloth",
      },
      {
        id: "pots",
        name: "花盆",
        cx: 16,
        cy: 78,
        w: 17,
        h: 18,
        look: "一排長壽花，盆底墊著半塊紅磚。花早枯了，磚還在。",
        repeat: "剩下的磚都埋在土裡，摳不出來。",
        gives: "brick",
        sound: "stone",
      },
      {
        id: "panel",
        name: "翹起的浪板",
        cx: 66,
        cy: 20,
        w: 28,
        h: 22,
        look: "屋頂的鐵皮浪板翹起一角，每次陣風就整片跳起來，聲音像有人在上面走。",
        requires: "brick",
        lockedText: "浪板每次都跳起半個手掌高。徒手按不住，要拿有重量的東西壓。",
        useText: "你把紅磚壓在翹起的那一角。風還在灌，但它不再整片跳了。",
        sets: "panelWeighted",
        relief: 2,
        bonus: {
          needs: ["rope"],
          sets: "panelTied",
          relief: 1,
          text: "你再拿曬衣繩把浪板繞回鐵架上，繞三圈打死結。這下它連抖都不太抖了。",
        },
        sound: "sheet",
      },
      {
        id: "drain",
        name: "排水口",
        cx: 87,
        cy: 84,
        w: 15,
        h: 15,
        look: "排水口塞滿落葉跟一隻拖鞋。你蹲下去把它挖乾淨，積水立刻打著旋下去。",
        repeat: "水下得很順。至少這裡不會積。",
        sets: "drainClear",
        relief: 1,
        sound: "cloth",
      },
      {
        id: "tank",
        name: "水塔",
        cx: 22,
        cy: 26,
        w: 20,
        h: 26,
        look:
          "藍色水塔架在四根鐵腳上。爬梯第三階的掛鉤上掛著一串鑰匙——" +
          "最大的那把，鑰匙頭纏著褪色的紅膠帶。",
        repeat: "掛鉤空了，只剩一圈鏽。",
        gives: "storagekey",
        sound: "metal",
      },
      {
        id: "chair",
        name: "藤椅",
        cx: 45,
        cy: 74,
        w: 17,
        h: 17,
        look: "一張藤椅，坐墊塌了一個人的形狀。阿嬤傍晚都坐在這裡剝豆子，看巷子口。",
        repeat: "藤條斷了幾根。你沒有坐下去。",
        sound: "cloth",
      },
      {
        id: "door_storage",
        name: "樓梯間鐵門",
        cx: 95,
        cy: 58,
        w: 10,
        h: 42,
        look: "往樓下樓梯間的鐵門，是那種老式的圓頭鎖。",
        repeat: "門開著，樓梯往下沉進黑裡。",
        requires: "storagekey",
        lockedText: "鐵門鎖著，圓頭鎖轉不動。這種鎖要對的鑰匙。",
        useText: "紅膠帶那把鑰匙轉了兩圈。門一開，霉味跟樟腦味一起湧上來。",
        sets: "stairOpen",
        sound: "door",
      },
    ],
  },

  storage: {
    name: "樓梯間儲藏室",
    short: "儲藏室",
    line: "樓梯間沒有窗。手電筒的光圈裡，全是別人家跟自己家的舊東西。",
    needs: "openStorage",
    lockedHint: "樓梯間的鐵門還鎖著。先把屋頂的鐵皮壓好，再去水塔那邊找鑰匙。",
    hotspots: [
      {
        id: "shelf",
        name: "木層架",
        cx: 18,
        cy: 46,
        w: 20,
        h: 34,
        look:
          "架上疊著繳費單、獎狀，還有一本藍皮戶口名簿。" +
          "翻開來：阿嬤的妹妹「林秀英」民國五十四年遷出，遷往台南市安平區。",
        repeat: "剩下的都是繳費單，最舊的一張是民國七十年的水費。",
        needsFlag: "hasLight",
        needsFlagText: "架上黑成一團，你只摸到紙的邊角。這裡需要光。",
        gives: "census",
        sets: "knowsSisterMoved",
        sound: "paper",
      },
      {
        id: "suitcase",
        name: "舊皮箱",
        cx: 42,
        cy: 78,
        w: 22,
        h: 20,
        look:
          "皮箱扣環一扳就開。最上面壓著一張明信片，郵戳糊了一半，" +
          "還讀得出「台南　安平」。背面署名只剩一個「英」字。",
        repeat: "箱底是幾件旗袍，樟腦味重得嗆人。",
        needsFlag: "hasLight",
        needsFlagText: "皮箱在最裡面，你連扣環在哪都看不到。",
        gives: "postcard",
        sets: "knowsPostmark",
        sound: "cloth",
      },
      {
        id: "letters",
        name: "綁著橡皮筋的信",
        cx: 62,
        cy: 80,
        w: 18,
        h: 16,
        look:
          "橡皮筋一拉就斷。那疊信全是寄給花蓮「周明生」的——阿公當兵時的同袍。" +
          "每一封的郵票都蓋過章，是寄到了又被人整批退回來的。",
        repeat: "退件章蓋在同一個位置，蓋了十幾封。",
        needsFlag: "hasLight",
        needsFlagText: "地上有一疊什麼東西，你踢到了，但看不清楚。",
        sets: "knowsZhou",
        sound: "paper",
      },
      {
        id: "coat",
        name: "舊外套",
        cx: 78,
        cy: 40,
        w: 16,
        h: 26,
        look:
          "一件深藍色的舊外套掛在釘子上，肩上全是樟腦丸的味道。" +
          "右邊口袋裡有一把很小的銅鑰匙，扁扁的。",
        repeat: "左邊口袋只有一張公車票根。",
        needsFlag: "hasLight",
        needsFlagText: "牆上掛著什麼，垂下來掃到你的臉。你嚇了一跳，退了一步。",
        gives: "brasskey",
        sound: "cloth",
      },
      {
        id: "receipt",
        name: "收據夾",
        cx: 60,
        cy: 32,
        w: 16,
        h: 20,
        look:
          "一支鐵夾釘在牆上，夾著十幾年的房租收據。" +
          "收款人一律是基隆的「陳金土」——阿嬤每個月匯錢給他，匯到去年。",
        repeat: "最後一張是去年十二月，之後就沒有了。",
        sets: "knowsLandlord",
        sound: "paper",
      },
      {
        id: "meter",
        name: "電表",
        cx: 33,
        cy: 22,
        w: 15,
        h: 16,
        look: "無熔絲開關被跳掉了。你把它推回去，燈亮了半秒又暗下來——整條巷子的電都斷了。",
        repeat: "推幾次都一樣。今晚不會有電。",
        sound: "metal",
      },
      {
        id: "door_hall",
        name: "前廳木門",
        cx: 94,
        cy: 60,
        w: 11,
        h: 40,
        look: "前廳的木門關著，門把整個是壞的，轉起來空空的。",
        repeat: "門開著。裡面有一點紅色的光。",
        requires: "screwdriver",
        lockedText: "門把轉起來空空的，卡榫在裡面斷掉了。需要細長的東西撬。",
        useText: "起子插進門把的方孔，往左一撬，門閂彈開。神明桌上的電子蠟燭，紅紅的還亮著。",
        sets: "hallOpen",
        sound: "door",
      },
    ],
  },

  hall: {
    name: "前廳",
    short: "前廳",
    line: "前廳比記憶裡小。神明桌上的香灰積了三個月，紅色電子蠟燭還亮著。",
    needs: "openHall",
    lockedHint: "前廳的門還沒撬開，而且你也還不知道盒子藏在哪。先把三張紙湊齊。",
    hotspots: [
      {
        id: "altar",
        name: "神明桌",
        cx: 34,
        cy: 58,
        w: 26,
        h: 30,
        look:
          "你照著名簿裡夾的那張位置圖，把桌下第二格的木板整片抽出來。" +
          "夾層裡躺著一只紅鐵盒，盒蓋上印著早就倒了的餅乾廠商標。",
        repeat: "夾層空了。木板還斜靠在旁邊。",
        needsFlag: "knowsHiding",
        needsFlagText: "桌下三格抽屜，旁邊還有一整排疊到牆邊的紙錢箱。從哪裡找起？你沒有頭緒。",
        gives: "tinbox",
        sound: "metal",
      },
      {
        id: "censer",
        name: "香爐",
        cx: 34,
        cy: 30,
        w: 16,
        h: 16,
        look: "香爐裡的香灰結了一層硬殼。最後一炷香插在正中央，燒到底才熄。",
        repeat: "你沒有帶香上來。",
        sound: "cloth",
      },
      {
        id: "tablet",
        name: "祖先牌位",
        cx: 56,
        cy: 28,
        w: 15,
        h: 20,
        look:
          "牌位上一排燙金的名字，最後一個是阿公。" +
          "阿嬤的名字還沒刻上去——刻字的師傅說，颱風過後再來。",
        repeat: "留白的那一格比別格都乾淨。",
        sets: "sawTablet",
        sound: "paper",
      },
      {
        id: "phone",
        name: "電話桌",
        cx: 76,
        cy: 62,
        w: 18,
        h: 24,
        look:
          "轉盤電話旁邊壓著一本電話簿，攤開在「林」那頁。" +
          "「台南　秀英」被紅筆畫了兩道線，號碼改過三次，最後一次是用鉛筆寫的。",
        repeat: "鉛筆那組號碼，你試著撥了。線是斷的。",
        sets: "knowsPhonebook",
        sound: "metal",
      },
      {
        id: "clock",
        name: "掛鐘",
        cx: 76,
        cy: 24,
        w: 14,
        h: 18,
        look: "掛鐘停在三點四十。電池早就沒了，沒有人換。",
        repeat: "三點四十。分針在那裡卡了很久。",
        sound: "metal",
      },
      {
        id: "door_out",
        name: "大門",
        cx: 10,
        cy: 58,
        w: 13,
        h: 48,
        look: "大門的門縫底下已經在滲水。樓下巷口那個綠色郵筒，投遞口用膠帶封了半邊。",
        repeat: "外面的雨聲又大了一階。信要寄，就得趁現在。",
        sound: "door",
      },
    ],
  },
};

/* ---------- 章節 ---------- */

/**
 * 章節＝故事推進的節拍。當前章節的 `needs` 一滿足就自動推進，
 * 並打開下一個場景。章節數字走到 `CHAPTERS.length` 就是尾聲（可以寫信封）。
 */
export const CHAPTERS = [
  {
    id: "light",
    title: "第一章　停電的加蓋",
    goal: "讓手電筒亮起來，把通往平台的鐵門打開。",
    needs: { flags: ["hasLight", "deckOpen"] },
    opens: "deck",
    text:
      "門一開，風把你手上的光柱吹得晃了一下。\n" +
      "天色是那種颱風前特有的黃綠色，樓下的鐵捲門一家一家在拉。",
  },
  {
    id: "storm",
    title: "第二章　風先到",
    goal: "壓住翹起的鐵皮，再打開樓梯間的鐵門。",
    needs: { flags: ["panelWeighted", "stairOpen"] },
    opens: "storage",
    text:
      "屋頂暫時安靜下來了。你把手電筒往樓梯間照下去，\n" +
      "光只走了五、六階就被黑吃掉。這棟樓阿嬤住了四十年，你其實沒下來過幾次。",
  },
  {
    id: "trail",
    title: "第三章　三張紙",
    goal: "湊齊黑白合照、明信片、戶口名簿，並撬開前廳的門。",
    needs: { items: ["photo", "postcard", "census"], flags: ["hallOpen"] },
    opens: "hall",
    sets: "knowsHiding",
    text:
      "三張紙攤在手電筒的光圈裡：鹽田、郵戳、遷出登記，指向同一個地方。\n" +
      "你把戶口名簿闔上的時候，最後一頁掉出一張手繪的小圖——神明桌下，第二格。",
  },
  {
    id: "letter",
    title: "第四章　紅鐵盒",
    goal: "找到紅鐵盒，用小銅鑰匙打開它。",
    needs: { items: ["letter"] },
    text:
      "信只寫了一半，信封是空白的。\n" +
      "阿嬤把它鎖了那麼多年，不是不知道要寄給誰——是不知道還來不來得及。",
  },
];

export const EPILOGUE = {
  title: "尾聲　寫上收件人",
  goal: "從線索判斷這封信該寄給誰，把名字寫在信封上。",
};

/* ---------- 收件人 ---------- */

/**
 * 寫信封之前，至少要有這些線索——不然你只是在猜。
 * 戶口名簿說得出「遷去哪」，電話簿才說得出「現在還在不在」。
 */
export const NAME_NEEDS = ["knowsSisterMoved", "knowsPhonebook"];

export const NAME_NEEDS_TEXT =
  "你握著筆，卻不敢落下去。戶口名簿上那筆遷出登記是三十年前的事，" +
  "三十年夠一個人搬走三次。要有更近的東西，你才敢把名字寫上信封。";

export const RECIPIENTS = [
  {
    id: "sister",
    name: "林秀英",
    place: "台南市安平區",
    note: "阿嬤的妹妹",
    correct: true,
  },
  {
    id: "landlord",
    name: "陳金土",
    place: "基隆市",
    note: "房東",
    wrong:
      "陳金土是收房租的。收據上他的名字蓋了十幾年的章，" +
      "但阿嬤從來沒寫過信給他——她只匯錢。你把信封撕掉重來，雨又進來一些。",
  },
  {
    id: "zhou",
    name: "周明生",
    place: "花蓮縣",
    note: "阿公的同袍",
    wrong:
      "那疊寄給周明生的信，郵票都蓋過章，是寄到了又被整批退回來的。" +
      "而且信的開頭喊的不是他。你把信封撕掉重來，雨又進來一些。",
  },
  {
    id: "self",
    name: "你自己",
    place: "台北市",
    note: "孫子",
    wrong:
      "信的開頭寫著「秀英」。那不是你的名字。\n" +
      "阿嬤要你幫忙寄的，不是要給你的。你把信封撕掉重來，雨又進來一些。",
  },
];

/* ---------- 線索本 ---------- */

export const NOTES = [
  { flag: "knowsAnping", text: "合照背面：民國五十二年　與秀英　攝於安平。" },
  { flag: "knowsPostmark", text: "明信片郵戳：台南　安平；署名只剩一個「英」。" },
  { flag: "knowsSisterMoved", text: "戶口名簿：妹妹林秀英民國五十四年遷往台南市安平區。" },
  { flag: "knowsPhonebook", text: "電話簿「林」那頁：台南　秀英，被紅筆畫了兩道線。" },
  { flag: "knowsZhou", text: "花蓮周明生那疊信全被退回來過——那條線早就斷了。" },
  { flag: "knowsLandlord", text: "基隆陳金土是房東，阿嬤只匯錢給他，沒寫過信。" },
  { flag: "knowsHiding", text: "名簿夾的位置圖：紅鐵盒在神明桌下第二格。" },
  { flag: "readLetter", text: "信的開頭只有兩個字：「秀英」。" },
  { flag: "panelWeighted", text: "翹起的浪板已經用紅磚壓住。" },
  { flag: "panelTied", text: "浪板另外用曬衣繩綁回鐵架上了。" },
  { flag: "drainClear", text: "平台的排水口清乾淨了，水下得去。" },
];

export const TUTORIAL = [
  "點畫面上會發亮的光點＝搜查。搜到的東西自動進背包。",
  "先點背包裡的道具把它拿起來，再點光點＝使用；連點兩件道具＝組合。",
  "右上角是風雨計。壓鐵皮、清排水口會把它壓下去；用錯東西會讓它往上跳。滿格就守不住了。",
];

export const WIN_TEXT =
  "你在信封上寫下「台南市安平區　林秀英　收」，字寫得比平常慢。\n" +
  "樓下郵筒的投遞口用膠帶封了半邊，你把信側著推進去，聽見它落到底。\n" +
  "颱風凌晨兩點登陸。鐵皮撐住了，加蓋沒有塌。信會比風先到。";

export const LOSE_TEXT =
  "一陣陣風把浪板整片掀走，雨橫著灌進加蓋。\n" +
  "紙箱先塌，然後是那些相片——泡在水裡，字一個一個化開。\n" +
  "你抱著手上僅有的東西退到樓梯間。這一夜，什麼都沒能寄出去。";
