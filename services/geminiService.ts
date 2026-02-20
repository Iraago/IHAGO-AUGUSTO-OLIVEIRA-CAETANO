import { GoogleGenAI, Type } from "@google/genai";
import { RhymeData } from "../types";

if (!process.env.API_KEY) {
  console.error("API_KEY is missing from environment variables");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRhymesForWord = async (word: string): Promise<{ perfect: string[], phonetic: string[] }> => {
  if (!word || word.trim().length < 2) return { perfect: [], phonetic: [] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma lista de rimas para a palavra "${word}" em Português. 
      Separe em duas categorias:
      1. "perfect": Rimas consoantes ou ricas (terminação igual).
      2. "phonetic": Rimas toantes, métricas, gírias ou que soam bem juntas pelo flow (assonância/aliteração), mesmo que a grafia seja diferente.
      
      Retorne um objeto JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            perfect: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            phonetic: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
        systemInstruction: "Você é um assistente de composição musical (Rap/Trap/MPB). Seja criativo nas rimas fonéticas."
      }
    });

    const jsonText = response.text;
    if (!jsonText) return { perfect: [], phonetic: [] };

    const result = JSON.parse(jsonText);
    return {
      perfect: result.perfect || [],
      phonetic: result.phonetic || []
    };
  } catch (error) {
    console.error("Error fetching rhymes:", error);
    return { perfect: [], phonetic: [] };
  }
};