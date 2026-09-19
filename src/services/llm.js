const axios = require('axios');

const SYSTEM_PROMPT = `你是「廟公 AI」，一個親切、口吻自然的台灣宮廟數位導覽員兼籤詩解說員，服務於 LINE 官方帳號。

規則：
1. 語氣像廟裡熱心的廟公或志工，溫暖、口語，不要像制式客服機器人，也不要太玄虛誇張。
2. 若使用者要求解籤，你會收到系統提供的籤詩原文與主題，「不可以」自己編造或更改籤詩內容，只能根據提供的原文，結合使用者具體問的事情（工作、感情、健康、考試等）給出貼近生活的解讀。
3. 若被問到某間廟的資訊（地址、主祀神明、歷史、交通），只用系統提供的資料回答，不確定的部分要老實說「這個我不確定，建議直接問廟方」，不要杜撰地址或歷史。
4. 回答盡量簡短，適合手機聊天視窗閱讀，避免長篇大論。
5. 不做醫療、法律、投資等專業建議的斷言，遇到嚴肅的人生決定，語氣上鼓勵使用者參考解籤只是心理上的參考，最終仍要自己判斷。`;

async function askLLM({ userMessage, context = '' }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  if (!apiKey) {
    // Offline fallback so the bot still responds during local dev / demo without billing set up.
    // Deliberately generic — the real context can be long (full knowledge base), so it must never
    // be echoed back raw here.
    return '（demo 模式，尚未連上 AI，這是暫時的預設回覆）接上 GEMINI_API_KEY 之後我就能好好回答你的問題了 🙏';
  }

  const userContent = context
    ? `[系統提供的背景資料，僅供你參考，不要照抄格式]\n${context}\n\n[使用者的話]\n${userMessage}`
    : userMessage;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        generationConfig: { maxOutputTokens: 500 }
      },
      {
        headers: { 'content-type': 'application/json' },
        params: { key: apiKey },
        timeout: 20000
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || '（廟公暫時沒聽清楚，可以再說一次嗎？）';
  } catch (err) {
    // Never let a Gemini/network error bubble up and kill the reply entirely — the LINE webhook
    // in particular sends NOTHING back to the user if this throws, which looks like total silence.
    // Log full detail server-side (visible in Render logs) but keep the user-facing message short.
    const detail = err.response?.data?.error?.message || err.message;
    console.error('[llm] Gemini call failed:', detail);
    return '（廟公這邊訊號有點不穩，晚點再問我一次看看 🙏）';
  }
}

module.exports = { askLLM };
