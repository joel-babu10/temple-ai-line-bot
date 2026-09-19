const temples = require('../data/temples.json');
const customs = require('../data/customs.json');
const festivals = require('../data/festivals.json');
const fortunes = require('../data/fortunes.json');

const APP_FEATURES = `本應用（焰寶）目前提供的功能：
1. 求籤解籤：使用者可以線上點香、擲筊、抽籤，抽到籤詩後可以問 AI 這支籤跟自己問的事（工作/感情/健康/考試等）有什麼關係。
2. 附近宮廟：使用者分享目前位置後，可以看到附近的宮廟，以及公車/火車/步行/騎車等交通建議。
3. 線上點燈祈福：使用者可以輸入姓名與心願類型（平安、事業、姻緣、考運、財運），點亮一盞象徵性的祈福燈。
4. 節慶提醒：列出近期的宮廟節慶與習俗活動（例如媽祖聖誕、安太歲、中元普渡），並會主動推播提醒。
5. 生肖太歲查詢：使用者輸入西元出生年份，可以查詢今年是否犯太歲（值太歲/沖太歲/刑太歲/害太歲/破太歲），以及相關建議。
如果使用者問「這個網站/APP能做什麼」或類似問題，請根據以上列表用口語化的方式介紹，不需要逐字複製。`;

/**
 * Full grounding context for the general-purpose chat (問廟公 / LINE free-form questions).
 * Keeps the model honest about temple facts and app capabilities instead of inventing them.
 */
function buildAppContext() {
  const festivalSummary = festivals
    .map((f) => `${f.name}（${f.lunarDate}，國曆約 ${f.date2026}）`)
    .join('、');

  return [
    `【本應用功能說明】\n${APP_FEATURES}`,
    `【本地宮廟知識庫】\n${JSON.stringify(temples, null, 2)}`,
    `【台灣民俗小知識庫】\n${JSON.stringify(customs, null, 2)}`,
    `【近期節慶總覽】\n${festivalSummary}`,
    `【籤詩庫規模】目前收錄 ${fortunes.length} 支籤詩，涵蓋上上籤到下籤等不同籤運等級。`
  ].join('\n\n');
}

module.exports = { buildAppContext };
