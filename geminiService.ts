
import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackType, AIFeedback } from "./types";

// Função para obter a instância do Gemini de forma segura
function getAI() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
}

export async function analyzeAnswer(
  question: string,
  userAnswer: string,
  context?: string
): Promise<AIFeedback> {
  const ai = getAI();
  const prompt = `
    As a world-class English teacher, evaluate the following user response.
    Question/Context: "${question}" ${context ? `(Additional Context: ${context})` : ''}
    User Answer: "${userAnswer}"

    Classification Rules:
    - PERFECT: 100% correct, natural, and idiomatic.
    - IMPROVABLE: Grammatically correct but there's a more fluid/common way.
    - UNNATURAL: Understandable but sounds like a literal translation (unnatural phrasing).
    - INCORRECT: Grammatical or vocabulary errors that hinder clarity.

    Provide feedback in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: Object.values(FeedbackType) },
            correction: { type: Type.STRING },
            explanation: { type: Type.STRING },
            naturalAlternative: { type: Type.STRING }
          },
          required: ["type", "correction", "explanation"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    return { type: FeedbackType.INCORRECT, correction: "System busy.", explanation: "Could not analyze at this moment." };
  }
}

export async function analyzePronunciation(
  expectedText: string,
  audioBase64: string,
  mimeType: string
): Promise<AIFeedback> {
  const ai = getAI();
  const prompt = `Evaluate pronunciation for: "${expectedText}"`;
  const audioPart = { inlineData: { data: audioBase64, mimeType } };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }, audioPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: Object.values(FeedbackType) },
            correction: { type: Type.STRING },
            explanation: { type: Type.STRING },
            score: { type: Type.NUMBER }
          },
          required: ["type", "correction", "explanation", "score"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    return { type: FeedbackType.INCORRECT, correction: "Audio error.", explanation: "Try again.", score: 0 };
  }
}

export async function generateConversationResponse(
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  situation: string
): Promise<string> {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an English conversation partner. Situation: ${situation}.`,
    }
  });

  const lastMsg = history[history.length - 1];
  const response = await chat.sendMessage({ message: lastMsg.parts[0].text });
  return response.text;
}

export async function getDiagnosticResult(responses: { question: string, answer: string }[]): Promise<any> {
  const ai = getAI();
  const prompt = `Analyze these 15 responses and return CEFR level and feedback in JSON: ${JSON.stringify(responses)}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text.trim());
}
