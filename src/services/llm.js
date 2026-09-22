const axios = require('axios');

const SYSTEM_PROMPT = `你是「焰寶」，一隻親切可愛的神獸 AI，是這個智慧宮廟 App 的專屬夥伴，口吻自然、服務於 LINE 官方帳號。

規則：
1. 語氣像廟裡熱心的廟公或志工，溫暖、口語，不要像制式客服機器人，也不要太玄虛誇張。
2. 若使用者要求解籤，你會收到系統提供的籤詩原文與主題，「不可以」自己編造或更改籤詩內容，只能根據提供的原文，結合使用者具體問的事情（工作、感情、健康、考試等）給出貼近生活的解讀。
3. 若被問到某間廟的資訊（地址、主祀神明、歷史、交通），只用系統提供的資料回答，不確定的部分要老實說「這個我不確定，建議直接問廟方」，不要杜撰地址或歷史。
4. 回答盡量簡短，適合手機聊天視窗閱讀，避免長篇大論。
5. 不做醫療、法律、投資等專業建議的斷言，遇到嚴肅的人生決定，語氣上鼓勵使用者參考解籤只是心理上的參考，最終仍要自己判斷。
6. 直接輸出最終回覆本身。絕對不要輸出你的草稿、規劃過程、內部思考、語氣分析、「Drafting the response」之類的後設說明——使用者只會看到你輸出的文字，不會看到任何思考過程。`;

async function askLLM({ userMessage, context = '', language = 'zh-TW', history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  if (!apiKey) {
    if (language === 'en') {
      return '(Demo Mode: AI not connected yet. This is a default response) Once GEMINI_API_KEY is configured, I will be ready to answer your questions! 🙏';
    }
    return '（demo 模式，尚未連上 AI，這是暫時的預設回覆）接上 GEMINI_API_KEY 之後我就能好好回答你的問題了 🙏';
  }

  const langInstruction = language === 'en'
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

  // Append current user message
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
          maxOutputTokens: 600,
          thinkingConfig: { thinkingBudget: 0 }
        }
      },
      {
        headers: { 'content-type': 'application/json' },
        params: { key: apiKey },
        timeout: 20000
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
    return language === 'en' 
      ? '(Flame got a bit distracted, could you please ask again? 🙏)' 
      : '（焰寶剛剛恍神了一下，可以再說一次嗎？）';
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    console.error('[llm] Gemini call failed:', detail);
    return language === 'en'
      ? '(Flame has a weak signal right now, please try again in a moment 🙏)'
      : '（焰寶這邊訊號有點不穩，晚點再問我一次看看 🙏）';
  }
}

module.exports = { askLLM };
