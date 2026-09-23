const axios = require('axios');

const SYSTEM_PROMPT = `你是「焰寶」，一隻親切可愛的神獸 AI，是這個智慧宮廟 App 的專屬夥伴，口吻自然、服務於 LINE 官方帳號。

規則：
1. 語氣像廟裡熱心的廟公或志工，溫暖、口語，不要像制式客服機器人，也不要太玄虛誇張。
2. 若使用者要求解籤，你會收到系統提供的籤詩原文與主題，「不可以」自己編造或更改籤詩內容，只能根據提供的原文，結合使用者具體問的事情（工作、感情、健康、考試等）給出貼近生活的解讀。
3. 若被問到某間廟的資訊（地址、主祀神明、歷史、交通），只用系統提供的資料回答，不確定的部分要老實說「這個我不確定，建議直接問廟方」，不要杜撰地址或歷史。
4. 回答盡量簡短，適合手機聊天視窗閱讀，避免長篇大論。
5. 不做醫療、法律、投資等專業建議的斷言，遇到嚴肅的人生決定，語氣上鼓勵使用者參考解籤只是心理上的參考，最終仍要自己判斷。
6. 深切尊重每位使用者的個人信仰與自由意志，語氣維持誠摯包容，強調所有籤詩與民俗解析均為文化傳承與心靈指引。
7. 直接輸出最終回覆本身。絕對不要輸出你的草稿、規劃過程、內部思考、語氣分析、「Drafting the response」之類的後設說明——使用者只會看到你輸出的文字，不會看到任何思考過程。`;

async function askLLM({ userMessage, context = '', language = 'zh-TW', history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  const isEn = language === 'en';

  if (!apiKey) {
    if (isEn) {
      return "Hi there! I'm Flame (焰寶) 🐾 I'm happy to help answer your questions about temple worship, rituals, and guidance! 🙏";
    }
    return '哈囉，我是焰寶 🐾 很高興能為您解答關於宮廟參拜、民俗儀軌或生活心靈指引！請問有什麼我可以幫忙的呢？🙏';
  }

  const langInstruction = isEn
    ? '\n\nIMPORTANT: The user has chosen English. Please reply entirely in friendly, clear, and polite English as the warm divine mascot Flame (焰寶).'
    : '\n\n請使用繁體中文回答。';

  const fullSystemPrompt = SYSTEM_PROMPT + (context ? `\n\n[系統背景知識庫與上下文]\n${context}` : '') + langInstruction;

  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const h of history) {
      contents.push({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        system_instruction: { parts: [{ text: fullSystemPrompt }] },
        contents,
        generationConfig: {
          maxOutputTokens: 600
        }
      },
      {
        headers: { 'content-type': 'application/json' },
        params: { key: apiKey },
        timeout: 12000
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
    return isEn 
      ? "Hi! I'm Flame (焰寶) 🐾 Your divine companion. Feel free to ask me anything or type 1-6 for quick options! 🙏" 
      : '你好呀！我是焰寶 🐾 隨時可以跟我聊天或請示宮廟儀軌，也可以輸入 1~6 選擇服務喔！🙏';
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    console.error('[llm] Gemini call failed:', detail);

    // If context contains fortune interpretation data, provide actual fortune guidance notes as fallback
    if (context && context.includes('Guidance Notes:')) {
      const match = context.match(/Guidance Notes:\s*(.*)/);
      if (match && match[1]) {
        return isEn
          ? `✨ Divine Guidance: ${match[1].trim()}\n\nWalk forward with sincerity and trust in the divine timing 🙏`
          : `✨ 籤詩白話指引：${match[1].trim()}\n\n凡事心誠則靈，按照步調穩健前行即可獲得神明保佑 🙏`;
      }
    }
    if (context && context.includes('一般解釋：')) {
      const match = context.match(/一般解釋：\s*(.*)/);
      if (match && match[1]) {
        return `✨ 籤詩白話指引：${match[1].trim()}\n\n凡事心誠則靈，按照步調穩健前行即可獲得神明保佑 🙏`;
      }
    }

    if (isEn) {
      return "Hi there! I'm Flame (焰寶) 🐾 May peace and blessing be with you! Feel free to ask me anything about temple rituals, draw fortune sticks, or check nearby temples! 🙏";
    }
    return '你好呀！我是焰寶 🐾 隨時可以跟我請示宮廟拜拜儀軌、線上求籤或查詢附近的宮廟資訊喔！🙏';
  }
}

module.exports = { askLLM };
