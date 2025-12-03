
import { GoogleGenAI, Type } from '@google/genai';
import { ChromeTab, AIGroupingResponse, Language } from '../types';

export const geminiService = {
  async categorizeTabs(tabs: ChromeTab[], apiKey: string, language: Language = 'en'): Promise<AIGroupingResponse | null> {
    if (!apiKey) {
      console.error("API Key missing");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Prepare simpler input for the model
    const tabListString = tabs.map((t, index) => 
      `${index}: ${t.title} (${t.url})`
    ).join('\n');

    let langInstruction = "";
    let styleInstruction = "";

    switch (language) {
      case 'zh':
        langInstruction = "Important: Please use Traditional Chinese (繁體中文) for the 'groupName'.";
        styleInstruction = 'Style the group names to sound like Cyberpunk categories (e.g., "資料庫", "神經網路", "娛樂頻道", "開發終端", "外部鏈結").';
        break;
      case 'ja':
        langInstruction = "Important: Please use Japanese (日本語) for the 'groupName'.";
        styleInstruction = 'Style the group names to sound like Cyberpunk/Sci-Fi categories (e.g., "データベース", "ニューラルネット", "エンターテイメント", "開発端末", "外部リンク").';
        break;
      default: // en
        langInstruction = "Important: Please use English for the 'groupName'.";
        styleInstruction = 'Style the group names to sound like Cyberpunk categories (e.g., "DATABASE", "NEURAL_NET", "ENTERTAINMENT_FEED", "DEV_TERMINAL", "UPLINKS").';
        break;
    }

    const prompt = `
      You are an advanced AI Subroutine designed to organize browser data.
      Analyze the following list of browser tabs.
      Group them into logical categories based on their content.
      
      ${langInstruction}
      ${styleInstruction}
      
      Return a JSON object containing an array of groups.
      Each group should have a 'groupName' and a list of 'tabIndices' corresponding to the input list.
      Ensure every tab index is assigned to exactly one group.
      
      Tabs Input:
      ${tabListString}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              groups: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    groupName: { type: Type.STRING },
                    tabIndices: { 
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER }
                    }
                  },
                  required: ["groupName", "tabIndices"]
                }
              }
            }
          }
        }
      });

      const text = response.text;
      if (!text) return null;
      
      return JSON.parse(text) as AIGroupingResponse;

    } catch (error) {
      console.error("Gemini API Error:", error);
      return null;
    }
  }
};
