/**
 * 場景插畫：程式繪製的頂樓向量圖（純字串輸出，可單測）。
 * viewBox 一律 0 0 320 200，與 `content.js` 的熱點百分比座標對應
 * （SVG x ＝ cx × 3.2，SVG y ＝ cy × 2）。
 */

export const ART_WIDTH = 320;
export const ART_HEIGHT = 200;

const DEFS = `
<defs>
  <linearGradient id="atticwall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a2b26"/>
    <stop offset="1" stop-color="#12130f"/>
  </linearGradient>
  <linearGradient id="stormsky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6d6f45"/>
    <stop offset=".55" stop-color="#8a8452"/>
    <stop offset="1" stop-color="#4a4a35"/>
  </linearGradient>
  <linearGradient id="cellarwall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1d201f"/>
    <stop offset="1" stop-color="#0a0c0c"/>
  </linearGradient>
  <linearGradient id="hallwall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2b1f1c"/>
    <stop offset="1" stop-color="#100b0a"/>
  </linearGradient>
  <radialGradient id="daylight" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#cfd4b0" stop-opacity=".3"/>
    <stop offset="1" stop-color="#cfd4b0" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="torchlight" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#ffe6a8" stop-opacity=".34"/>
    <stop offset="1" stop-color="#ffe6a8" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="candlelight" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#e0483c" stop-opacity=".36"/>
    <stop offset="1" stop-color="#e0483c" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vignette" cx=".5" cy=".45" r=".78">
    <stop offset=".5" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".74"/>
  </radialGradient>
</defs>`;

const frame = (body, fill = "url(#atticwall)") =>
  `<svg viewBox="0 0 ${ART_WIDTH} ${ART_HEIGHT}" role="img" preserveAspectRatio="none">${DEFS}` +
  `<rect width="320" height="200" fill="${fill}"/>${body}` +
  `<rect width="320" height="200" fill="url(#vignette)"/></svg>`;

const floor = (y, tone = "#0d0f0c") =>
  `<rect x="0" y="${y}" width="320" height="${200 - y}" fill="${tone}"/>` +
  `<line x1="0" y1="${y}" x2="320" y2="${y}" stroke="#3d4239" stroke-width="1"/>`;

/** 鐵皮浪板：頂樓加蓋到處都是這個東西。 */
const corrugated = (x, y, width, height, step, tone, opacity = 1) => {
  const ribs = [];
  for (let i = x; i <= x + width; i += step) {
    ribs.push(`<line x1="${i}" y1="${y}" x2="${i}" y2="${y + height}" stroke="${tone}" stroke-width="1.4"/>`);
  }
  return `<g opacity="${opacity}">${ribs.join("")}</g>`;
};

const seams = (rows, tone = "#2b2f28") =>
  rows
    .map((y) => `<line x1="0" y1="${y}" x2="320" y2="${y}" stroke="${tone}" stroke-width="1"/>`)
    .join("");

/** 一疊紙箱：畫在紙箱山那一區。 */
const carton = (x, y, w, h, tone = "#4a3a26", edge = "#7a6340") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${tone}" stroke="${edge}" stroke-width="1.2"/>` +
  `<line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="${edge}" stroke-width=".8" opacity=".7"/>` +
  `<rect x="${x + w * 0.18}" y="${y + h * 0.32}" width="${w * 0.64}" height="${h * 0.2}" fill="#cbbf9f" opacity=".5"/>`;

const ART = {
  /* ---------- 頂樓加蓋：低矮鐵皮、氣窗一線灰光、滿地紙箱 ---------- */
  attic: () =>
    frame(
      // 鐵皮天花板
      `<rect x="0" y="0" width="320" height="16" fill="#191a16"/>` +
        corrugated(0, 0, 320, 16, 9, "#31342b") +
        `<line x1="0" y1="16" x2="320" y2="16" stroke="#454a3c" stroke-width="1.5"/>` +
        seams([96]) +
        // 氣窗透進來的一線灰光
        `<ellipse cx="200" cy="86" rx="118" ry="70" fill="url(#daylight)"/>` +
        floor(150) +
        // 氣窗（cx 66 / cy 20）
        `<rect x="192" y="24" width="40" height="32" fill="#5f6a52" stroke="#8d9679" stroke-width="1.6"/>
        <line x1="212" y1="24" x2="212" y2="56" stroke="#8d9679" stroke-width="1.2"/>
        <rect x="195" y="27" width="14" height="26" fill="#98a383" opacity=".55"/>
        <rect x="215" y="27" width="14" height="26" fill="#98a383" opacity=".38"/>
        <path d="M215 29 L226 42 L218 52" fill="none" stroke="#d5dcc0" stroke-width="1"/>
        <path d="M192 56 L232 56 L246 76 L184 76Z" fill="#cfd4b0" opacity=".08"/>` +
        // 日曆（cx 44 / cy 24）
        `<line x1="141" y1="26" x2="141" y2="32" stroke="#5c604f" stroke-width="1.2"/>
        <rect x="127" y="32" width="28" height="34" fill="#e4dcc2" opacity=".86"/>
        <rect x="127" y="32" width="28" height="8" fill="#9c3b30"/>
        <text x="141" y="58" font-size="15" fill="#3f3a2c" text-anchor="middle" font-family="serif">18</text>
        <line x1="130" y1="62" x2="152" y2="62" stroke="#6d6552" stroke-width=".7"/>` +
        // 老收音機＋桌（cx 57 / cy 58）
        `<rect x="150" y="130" width="86" height="6" fill="#3a3227" stroke="#6b5c45" stroke-width="1"/>
        <rect x="156" y="136" width="7" height="14" fill="#2a241c"/>
        <rect x="222" y="136" width="7" height="14" fill="#2a241c"/>
        <rect x="160" y="102" width="46" height="28" rx="2" fill="#4a3a26" stroke="#8a7048" stroke-width="1.4"/>
        <rect x="165" y="107" width="22" height="18" rx="1" fill="#241d15" stroke="#6b5c45"/>
        <g stroke="#6b5c45" stroke-width=".8">
          <line x1="167" y1="111" x2="185" y2="111"/><line x1="167" y1="115" x2="185" y2="115"/>
          <line x1="167" y1="119" x2="185" y2="119"/>
        </g>
        <circle cx="196" cy="112" r="4.2" fill="#c8a24a"/>
        <circle cx="196" cy="123" r="3" fill="#8a7048"/>` +
        // 床頭櫃（cx 13 / cy 62）
        `<rect x="18" y="106" width="48" height="44" fill="#3a3227" stroke="#6b5c45" stroke-width="1.5"/>
        <line x1="18" y1="126" x2="66" y2="126" stroke="#6b5c45" stroke-width="1"/>
        <g fill="#a8926a"><rect x="36" y="114" width="12" height="2.6" rx="1"/>
        <rect x="36" y="135" width="12" height="2.6" rx="1"/></g>
        <rect x="24" y="98" width="16" height="8" rx="4" fill="none" stroke="#9aa2b0" stroke-width="1.2"/>
        <path d="M40 102 h5" stroke="#9aa2b0" stroke-width="1.2"/>
        <rect x="50" y="94" width="10" height="12" rx="1" fill="#7d8a94" opacity=".55"/>
        <rect x="10" y="120" width="10" height="30" fill="#2a241c"/>` +
        // 大同餅乾盒（cx 34 / cy 76）
        `<rect x="96" y="140" width="26" height="16" rx="2" fill="#9c3b30" stroke="#d0705c" stroke-width="1.2"/>
        <rect x="93" y="137" width="32" height="5" rx="2" fill="#c05442" stroke="#d0705c" stroke-width=".8"/>
        <circle cx="109" cy="149" r="4" fill="none" stroke="#e8c07a" stroke-width="1"/>` +
        // 紙箱山（cx 79 / cy 64）
        carton(228, 98, 34, 26) +
        carton(264, 104, 32, 22, "#43341f") +
        carton(232, 124, 40, 28, "#3d2f1d") +
        carton(272, 126, 30, 26) +
        `<path d="M236 128 h30" stroke="#c8b78c" stroke-width="1" opacity=".8"/>
        <path d="M239 133 h18" stroke="#c8b78c" stroke-width="1" opacity=".55"/>` +
        // 平台鐵門（cx 95 / cy 58）
        `<rect x="300" y="70" width="20" height="118" fill="#171a16" stroke="#5c6350" stroke-width="1.6"/>
        ${corrugated(302, 72, 16, 114, 5, "#333a2f")}
        <rect x="296" y="112" width="9" height="9" rx="1" fill="#a8926a"/>
        <circle cx="300" cy="116" r="2.4" fill="#3a3227"/>`
    ),

  /* ---------- 曬衣平台：颱風前的黃綠色天空、水塔、翹起的浪板 ---------- */
  deck: () =>
    frame(
      // 遠處樓房輪廓
      `<g fill="#3f4030" opacity=".8">
        <rect x="0" y="86" width="34" height="40"/><rect x="40" y="96" width="26" height="30"/>
        <rect x="244" y="90" width="30" height="36"/><rect x="284" y="82" width="36" height="44"/>
      </g>
      <g fill="#6b6c4c" opacity=".5">
        <rect x="6" y="94" width="6" height="6"/><rect x="18" y="104" width="6" height="6"/>
        <rect x="292" y="92" width="6" height="6"/><rect x="304" y="106" width="6" height="6"/>
      </g>` +
        // 被風吹斜的雨絲
        `<g stroke="#d8dcbc" stroke-width="1" opacity=".16">
        ${Array.from({ length: 16 }, (_, i) => {
          const x = i * 21 + 4;
          return `<line x1="${x}" y1="${(i % 5) * 12}" x2="${x - 16}" y2="${(i % 5) * 12 + 30}"/>`;
        }).join("")}
      </g>` +
        // 女兒牆與地板
        floor(126, "#4c4c3c") +
        `<rect x="0" y="118" width="320" height="10" fill="#5a5a46" stroke="#7b7b60" stroke-width="1"/>` +
        `<g stroke="#3f4030" stroke-width="1" opacity=".7">
        ${[140, 156, 172, 188].map((y) => `<line x1="0" y1="${y}" x2="320" y2="${y}"/>`).join("")}
        ${[60, 130, 200, 270].map((x) => `<line x1="${x}" y1="126" x2="${x}" y2="200"/>`).join("")}
      </g>` +
        // 翹起的浪板（cx 66 / cy 20）：右上角掀起一片
        `<path d="M168 20 L286 12 L286 58 L168 62Z" fill="#2f3329" stroke="#6a7159" stroke-width="1.4"/>
        ${corrugated(172, 18, 110, 42, 9, "#4a5142")}
        <path d="M196 22 L262 14 L268 4 L200 12Z" fill="#5c6350" stroke="#98a383" stroke-width="1.4"/>
        <path d="M196 22 L200 12" stroke="#98a383" stroke-width="1.2"/>
        <g stroke="#c8cbaa" stroke-width="1" opacity=".55">
          <path d="M272 6 q10 -5 18 2"/><path d="M276 14 q12 -4 20 3"/>
        </g>` +
        // 水塔（cx 22 / cy 26）
        `<rect x="46" y="30" width="50" height="42" rx="7" fill="#2f5a6b" stroke="#69a2b5" stroke-width="1.6"/>
        <rect x="46" y="38" width="50" height="3" fill="#69a2b5" opacity=".5"/>
        <rect x="46" y="52" width="50" height="3" fill="#69a2b5" opacity=".35"/>
        <rect x="64" y="22" width="14" height="8" rx="2" fill="#4b7d90" stroke="#69a2b5"/>
        <g stroke="#6a7159" stroke-width="2.5">
          <line x1="52" y1="72" x2="48" y2="118"/><line x1="90" y1="72" x2="94" y2="118"/>
        </g>
        <g stroke="#7b8268" stroke-width="1.6">
          <line x1="52" y1="86" x2="90" y2="86"/><line x1="51" y1="98" x2="92" y2="98"/>
          <line x1="50" y1="110" x2="93" y2="110"/>
        </g>
        <path d="M78 96 q5 -3 6 4 l-2 8 h-5Z" fill="#c8a24a"/>
        <rect x="80" y="93" width="6" height="3" rx="1" fill="#c0453a"/>` +
        // 曬衣繩（cx 42 / cy 28）
        `<path d="M96 46 Q170 76 250 44" fill="none" stroke="#cfd0b4" stroke-width="1.2"/>
        <g fill="#8f9b86" stroke="#c3cbb4" stroke-width="1">
          <path d="M118 58 l16 -3 l7 26 l-20 4Z"/>
          <path d="M152 66 l16 -2 l6 26 l-20 3Z"/>
          <path d="M188 64 l16 -3 l6 25 l-20 4Z"/>
        </g>
        <g stroke="#e6e8cf" stroke-width="1.4">
          <line x1="124" y1="52" x2="128" y2="58"/><line x1="158" y1="60" x2="162" y2="66"/>
          <line x1="194" y1="58" x2="198" y2="64"/>
        </g>` +
        // 花盆（cx 16 / cy 78）
        `<g fill="#7a4a33" stroke="#a86c4a" stroke-width="1.2">
          <path d="M28 144 h26 l-4 22 h-18Z"/><path d="M56 148 h22 l-3 18 h-16Z"/>
        </g>
        <g stroke="#5c6b3f" stroke-width="1.4" fill="none">
          <path d="M36 144 q2 -12 -4 -18"/><path d="M44 144 q0 -14 8 -18"/><path d="M64 148 q2 -10 -3 -14"/>
        </g>
        <rect x="30" y="166" width="22" height="9" fill="#9c3b30" stroke="#c46a52" stroke-width="1"/>
        <line x1="30" y1="170" x2="52" y2="170" stroke="#c46a52" stroke-width=".7"/>` +
        // 藤椅（cx 45 / cy 74）
        `<g stroke="#a8834e" stroke-width="1.6" fill="#6d5330">
          <path d="M126 138 h36 l-3 22 h-30Z"/>
          <path d="M128 138 q4 -26 16 -26 q12 0 14 26"/>
        </g>
        <g stroke="#c8a06a" stroke-width=".8" opacity=".8">
          <line x1="130" y1="146" x2="159" y2="146"/><line x1="129" y1="152" x2="160" y2="152"/>
          <line x1="136" y1="118" x2="152" y2="118"/><line x1="134" y1="126" x2="154" y2="126"/>
        </g>
        <g stroke="#6d5330" stroke-width="2">
          <line x1="128" y1="160" x2="126" y2="174"/><line x1="158" y1="160" x2="160" y2="174"/>
        </g>` +
        // 排水口（cx 87 / cy 84）
        `<ellipse cx="278" cy="168" rx="20" ry="9" fill="#2f3329" stroke="#6a7159" stroke-width="1.2"/>
        <g stroke="#8b9179" stroke-width="1.4">
          <line x1="264" y1="168" x2="292" y2="168"/><line x1="268" y1="163" x2="288" y2="163"/>
          <line x1="268" y1="173" x2="288" y2="173"/>
        </g>
        <g fill="#7a6a33" opacity=".85">
          <path d="M258 162 q6 -6 12 -1 q-6 5 -12 1"/><path d="M292 174 q7 -5 12 1 q-7 4 -12 -1"/>
        </g>
        <ellipse cx="278" cy="182" rx="26" ry="6" fill="#79806a" opacity=".45"/>` +
        // 樓梯間鐵門（cx 95 / cy 58）
        `<rect x="298" y="72" width="22" height="116" fill="#242820" stroke="#6a7159" stroke-width="1.6"/>
        ${corrugated(300, 74, 18, 112, 6, "#3c4335")}
        <rect x="294" y="112" width="9" height="9" rx="4" fill="#c8a24a"/>
        <circle cx="298" cy="116" r="2.2" fill="#3a3227"/>`,
      "url(#stormsky)"
    ),

  /* ---------- 樓梯間儲藏室：沒有窗，只有手電筒的一圈光 ---------- */
  storage: () =>
    frame(
      `<ellipse cx="150" cy="100" rx="128" ry="86" fill="url(#torchlight)"/>` +
        seams([40], "#262a29") +
        floor(164, "#0b0d0d") +
        // 樓梯扶手（左緣往下）
        `<g stroke="#3d4544" stroke-width="2.5" fill="none">
          <path d="M0 150 L34 174"/><path d="M0 132 L34 156"/>
        </g>` +
        // 電表（cx 33 / cy 22）
        `<rect x="88" y="28" width="36" height="34" rx="2" fill="#1c211f" stroke="#5b6664" stroke-width="1.5"/>
        <rect x="93" y="33" width="26" height="14" fill="#0d1110" stroke="#3d4544"/>
        <g fill="#8fa39c"><rect x="96" y="37" width="4" height="6"/><rect x="103" y="37" width="4" height="6"/>
        <rect x="110" y="37" width="4" height="6"/></g>
        <rect x="99" y="50" width="8" height="9" rx="2" fill="#8b9aa2"/>
        <rect x="99" y="55" width="8" height="4" rx="1" fill="#c0453a"/>` +
        // 木層架（cx 18 / cy 46）
        `<g stroke="#6b5c45" stroke-width="2" fill="none">
          <rect x="26" y="58" width="64" height="106"/>
          <line x1="26" y1="92" x2="90" y2="92"/><line x1="26" y1="128" x2="90" y2="128"/>
        </g>
        <g fill="#cbbf9f" opacity=".72">
          <rect x="31" y="76" width="24" height="15"/><rect x="58" y="80" width="27" height="11"/>
          <rect x="33" y="114" width="30" height="13"/>
        </g>
        <rect x="66" y="108" width="20" height="19" fill="#33608a" stroke="#7fa8c8" stroke-width="1.2"/>
        <rect x="69" y="112" width="14" height="3" fill="#cbd8e4" opacity=".8"/>
        <g fill="#8a7048"><rect x="31" y="136" width="26" height="24"/><rect x="60" y="142" width="25" height="18"/></g>` +
        // 收據夾（cx 60 / cy 32）
        `<rect x="176" y="42" width="32" height="44" fill="#ddd2b4" opacity=".8"/>
        <rect x="174" y="38" width="36" height="8" rx="2" fill="#5b6664" stroke="#8fa39c" stroke-width="1"/>
        <g stroke="#6b6552" stroke-width=".8" opacity=".85">
          <line x1="180" y1="56" x2="204" y2="56"/><line x1="180" y1="63" x2="204" y2="63"/>
          <line x1="180" y1="70" x2="198" y2="70"/>
        </g>
        <g fill="#9c3b30" opacity=".8"><circle cx="200" cy="78" r="5"/></g>
        <path d="M170 54 l4 26" stroke="#c9bfa3" stroke-width="1" opacity=".5"/>` +
        // 舊外套（cx 78 / cy 40）
        `<circle cx="250" cy="50" r="2.6" fill="#8fa39c"/>
        <path d="M250 54 L232 68 L228 108 L240 112 L244 92 L246 118 L262 118 L262 90 L268 110 L276 104 L270 66Z"
          fill="#25344a" stroke="#4f6b8f" stroke-width="1.4"/>
        <path d="M250 54 L246 86 L254 86 L258 56" fill="#1b2635" stroke="#4f6b8f" stroke-width="1"/>
        <rect x="262" y="82" width="10" height="12" rx="2" fill="#1b2635" stroke="#4f6b8f" stroke-width="1"/>
        <path d="M266 86 l3 5" stroke="#c8a24a" stroke-width="1.6"/>` +
        // 舊皮箱（cx 42 / cy 78）
        `<rect x="104" y="142" width="60" height="34" rx="3" fill="#5a3d24" stroke="#9c6f42" stroke-width="1.6"/>
        <line x1="104" y1="156" x2="164" y2="156" stroke="#9c6f42" stroke-width="1.4"/>
        <g fill="#c8a24a"><rect x="118" y="152" width="8" height="8" rx="1"/><rect x="142" y="152" width="8" height="8" rx="1"/></g>
        <rect x="128" y="136" width="14" height="7" rx="3" fill="none" stroke="#9c6f42" stroke-width="1.6"/>` +
        // 綁著橡皮筋的信（cx 62 / cy 80）
        `<g transform="rotate(-6 198 160)">
          <rect x="178" y="150" width="40" height="24" fill="#e4dcc2" opacity=".9" stroke="#a89a78" stroke-width="1"/>
          <rect x="180" y="146" width="40" height="24" fill="#efe7ce" stroke="#a89a78" stroke-width="1"/>
          <path d="M180 146 L200 160 L220 146" fill="none" stroke="#a89a78" stroke-width="1"/>
          <rect x="205" y="149" width="11" height="8" fill="#9c3b30" opacity=".75"/>
          <circle cx="210" cy="153" r="4" fill="none" stroke="#5c604f" stroke-width="1"/>
        </g>
        <path d="M176 148 q24 -6 46 2 q-24 8 -46 -2" fill="none" stroke="#8a7a5a" stroke-width="1.4"/>` +
        // 前廳木門（cx 94 / cy 60）
        `<rect x="292" y="66" width="28" height="122" fill="#2b2118" stroke="#7a5f3c" stroke-width="1.6"/>
        <g stroke="#4a3a26" stroke-width="1.4" fill="none">
          <rect x="297" y="76" width="18" height="40"/><rect x="297" y="126" width="18" height="52"/>
        </g>
        <circle cx="296" cy="122" r="3.4" fill="#c8a24a"/>
        <rect x="293" y="118" width="5" height="8" rx="1" fill="#8a7048"/>`,
      "url(#cellarwall)"
    ),

  /* ---------- 前廳：神明桌、電子蠟燭的紅光、停掉的掛鐘 ---------- */
  hall: () =>
    frame(
      `<ellipse cx="120" cy="72" rx="104" ry="62" fill="url(#candlelight)"/>` +
        seams([44], "#3a2a24") +
        floor(158, "#150e0c") +
        // 神明桌（cx 34 / cy 58）：上層供桌＋下層櫃
        `<rect x="58" y="76" width="128" height="8" fill="#5a2f22" stroke="#a8663f" stroke-width="1.4"/>
        <rect x="66" y="84" width="112" height="10" fill="#43231a"/>
        <rect x="70" y="94" width="104" height="58" fill="#5a2f22" stroke="#a8663f" stroke-width="1.4"/>
        <g stroke="#a8663f" stroke-width="1" fill="none">
          <rect x="78" y="100" width="88" height="16"/>
          <rect x="78" y="120" width="88" height="16"/>
          <rect x="78" y="140" width="88" height="8"/>
        </g>
        <g fill="#d09a5c">
          <circle cx="122" cy="108" r="2.4"/><circle cx="122" cy="128" r="2.4"/>
        </g>
        <path d="M78 120 h88" stroke="#e0b070" stroke-width="1.6" opacity=".9"/>
        <g stroke="#43231a" stroke-width="3">
          <line x1="74" y1="152" x2="74" y2="164"/><line x1="170" y1="152" x2="170" y2="164"/>
        </g>` +
        // 香爐（cx 34 / cy 30）
        `<path d="M96 52 q26 -10 52 0 l-5 22 h-42Z" fill="#7a6a33" stroke="#c8a24a" stroke-width="1.4"/>
        <ellipse cx="122" cy="52" rx="26" ry="6" fill="#4a4126" stroke="#c8a24a" stroke-width="1"/>
        <ellipse cx="122" cy="52" rx="20" ry="4" fill="#9a927c"/>
        <line x1="122" y1="52" x2="122" y2="30" stroke="#8a6a4a" stroke-width="1.4"/>
        <circle cx="122" cy="29" r="2" fill="#e07a3c" opacity=".8"/>
        <g fill="#c8a24a" opacity=".9"><rect x="90" y="60" width="6" height="12" rx="2"/>
        <rect x="148" y="60" width="6" height="12" rx="2"/></g>` +
        // 電子蠟燭
        `<g fill="#c0453a"><rect x="72" y="58" width="9" height="18" rx="2"/><rect x="164" y="58" width="9" height="18" rx="2"/></g>
        <g fill="#ffb27a"><circle cx="76" cy="56" r="3.4"/><circle cx="168" cy="56" r="3.4"/></g>` +
        // 祖先牌位（cx 56 / cy 28）
        `<rect x="160" y="34" width="38" height="44" rx="2" fill="#3d1c14" stroke="#c8a24a" stroke-width="1.6"/>
        <rect x="166" y="40" width="26" height="32" fill="#54261a" stroke="#a8663f" stroke-width=".8"/>
        <g fill="#e0c078" opacity=".9">
          <rect x="172" y="44" width="14" height="3"/><rect x="172" y="50" width="14" height="3"/>
          <rect x="172" y="56" width="14" height="3"/>
        </g>
        <rect x="172" y="62" width="14" height="3" fill="#8a7a5a" opacity=".45"/>
        <rect x="156" y="78" width="46" height="5" fill="#5a2f22" stroke="#a8663f" stroke-width="1"/>` +
        // 掛鐘（cx 76 / cy 24）
        `<circle cx="243" cy="48" r="20" fill="#2b1f1c" stroke="#a8663f" stroke-width="2"/>
        <circle cx="243" cy="48" r="15" fill="#e4dcc2" opacity=".8"/>
        <g stroke="#3f2a1e" stroke-width="1.6">
          <line x1="243" y1="48" x2="243" y2="38"/><line x1="243" y1="48" x2="251" y2="52"/>
        </g>
        <g fill="#6b5c45">${Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return `<circle cx="${(243 + Math.sin(a) * 12).toFixed(1)}" cy="${(48 - Math.cos(a) * 12).toFixed(1)}" r="1"/>`;
        }).join("")}</g>` +
        // 電話桌（cx 76 / cy 62）
        `<rect x="212" y="112" width="62" height="6" fill="#5a3d24" stroke="#9c6f42" stroke-width="1.2"/>
        <g stroke="#43231a" stroke-width="3">
          <line x1="218" y1="118" x2="218" y2="158"/><line x1="268" y1="118" x2="268" y2="158"/>
        </g>
        <rect x="222" y="98" width="34" height="14" rx="3" fill="#241d18" stroke="#7d8a94" stroke-width="1.2"/>
        <circle cx="246" cy="105" r="5.4" fill="none" stroke="#c3ccd4" stroke-width="1.4"/>
        <circle cx="246" cy="105" r="1.6" fill="#c3ccd4"/>
        <rect x="220" y="92" width="30" height="6" rx="3" fill="#3a3227" stroke="#7d8a94" stroke-width="1"/>
        <g transform="rotate(-4 262 124)">
          <rect x="248" y="118" width="30" height="20" fill="#e4dcc2" opacity=".9" stroke="#a89a78" stroke-width="1"/>
          <g stroke="#6b6552" stroke-width=".7"><line x1="252" y1="124" x2="274" y2="124"/>
          <line x1="252" y1="130" x2="274" y2="130"/></g>
          <g stroke="#c0453a" stroke-width="1.2"><line x1="252" y1="127" x2="272" y2="126"/>
          <line x1="252" y1="133" x2="268" y2="132"/></g>
        </g>` +
        // 大門（cx 10 / cy 58）
        `<rect x="10" y="64" width="34" height="124" fill="#2b2118" stroke="#7a5f3c" stroke-width="1.8"/>
        <g stroke="#4a3a26" stroke-width="1.4" fill="none">
          <rect x="16" y="74" width="22" height="44"/><rect x="16" y="126" width="22" height="54"/>
        </g>
        <circle cx="41" cy="126" r="3.4" fill="#c8a24a"/>
        <rect x="10" y="180" width="34" height="8" fill="#3d5a6b" opacity=".55"/>
        <path d="M10 186 q16 -5 34 1 v3 h-34Z" fill="#6d97a8" opacity=".4"/>`,
      "url(#hallwall)"
    ),
};

export function sceneArt(sceneId) {
  return (ART[sceneId] ?? ART.attic)();
}
