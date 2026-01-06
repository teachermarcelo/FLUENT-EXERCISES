
import { GoogleGenAI, Type } from "@google/genai";
import { UserProgress, FeedbackType, AIFeedback } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Limpa blocos de markdown de strings JSON retornadas pela IA
 */
const cleanJSON = (text: string) => {
  return text.replace(/```json\n?|```/g, "").trim();
};

export async function generateImmersiveResponse(history: any[], topic: string, level: string): Promise<string> {
  const ai = getAI();
  const formattedContents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.parts[0].text }]
  }));

  const systemInstruction = `You are a world-class English Coach for the platform FLUENT IMMERSION. 
  Current Topic: ${topic}. Student Proficiency Level: ${level}. 
  METHOD: Correct the student subtly using asterisks *like this* and provide a motivating follow-up question. 
  Stay in character as a supportive mentor.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: formattedContents,
      config: { systemInstruction, temperature: 0.8 }
    });
    return response.text || "Could you please rephrase that?";
  } catch (e) {
    console.error("AI Error:", e);
    throw e;
  }
}

export async function analyzeAnswer(question: string, answer: string): Promise<AIFeedback> {
  const ai = getAI();
  const systemInstruction = `Evaluate the student's answer. Return JSON only with fields: type (PERFECT, IMPROVABLE, UNNATURAL, INCORRECT), correction, explanation, score (0-100).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `Q: ${question}\nA: ${answer}` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            correction: { type: Type.STRING },
            explanation: { type: Type.STRING },
            score: { type: Type.NUMBER }
          },
          required: ["type", "correction", "explanation", "score"]
        }
      }
    });
    return JSON.parse(cleanJSON(response.text || "{}"));
  } catch (e) {
    console.error("Analyze Answer Error:", e);
    throw e;
  }
}

export async function analyzePronunciation(target: string, audio: string, mime: string): Promise<AIFeedback> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { text: `Evaluate pronunciation for: "${target}"` },
          { inlineData: { data: audio, mimeType: mime } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            correction: { type: Type.STRING },
            explanation: { type: Type.STRING },
            score: { type: Type.NUMBER }
          },
          required: ["type", "correction", "explanation", "score"]
        }
      }
    });
    return JSON.parse(cleanJSON(response.text || "{}"));
  } catch (e) {
    console.error("Pronunciation Error:", e);
    throw e;
  }
}

export async function generatePedagogicalReport(student: UserProgress): Promise<string[]> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: `Generate 5 actionable tips in PT-BR for level ${student.level}` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(cleanJSON(response.text || "[]"));
  } catch (e) {
    return ["Pratique diariamente.", "Assista vídeos em inglês.", "Revise seu vocabulário.", "Tente pensar em inglês.", "Use o laboratório de conversação."];
  }
}

export async function getDiagnosticResult(responses: any[]) {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: `Diagnose level: ${JSON.stringify(responses)}` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["level", "feedback", "strengths", "areasToImprove"]
        }
      }
    });
    return JSON.parse(cleanJSON(response.text || "{}"));
  } catch (e) {
    throw e;
  }
}
