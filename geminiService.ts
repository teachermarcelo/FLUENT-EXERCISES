
import { GoogleGenAI, Type } from "@google/genai";
import { UserProgress, FeedbackType, AIFeedback } from "./types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

const cleanJSON = (text: string) => {
  if (!text) return "{}";
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json\s?|```/g, "").trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  return cleaned;
};

const handleAIError = (e: any): AIFeedback => {
  console.error("Gemini API Error:", e);
  const isQuota = e.message?.includes("429") || e.status === "RESOURCE_EXHAUSTED";
  let msg = "Falha na comunicação com o professor.";
  if (isQuota) msg = "Cota da API excedida. Por favor, aguarde um momento.";
  
  return {
    type: FeedbackType.INCORRECT,
    correction: "Erro de Conexão",
    explanation: msg,
    score: 0
  };
};

export async function analyzeAnswer(question: string, answer: string): Promise<AIFeedback> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `Q: ${question}\nA: ${answer}` }] }],
      config: {
        systemInstruction: `Evaluate the student's English answer. 
        CRITICAL: Be lenient with capitalization and basic punctuation (e.g., missing period). 
        If the core meaning and grammar are correct, give a score of 90-100.
        If it's nearly correct but has minor typos, give 70-85.
        Only give < 70 if there are significant grammatical errors or wrong information.
        Return JSON: { type: "PERFECT"|"IMPROVABLE"|"UNNATURAL"|"INCORRECT", correction: string, explanation: string (PT-BR), score: number }`,
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
  } catch (e: any) {
    return handleAIError(e);
  }
}

export async function analyzePronunciation(target: string, audio: string, mime: string): Promise<AIFeedback> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: `TASK: Listen to the audio and compare it to: "${target}". 
          IMPORTANT: The user might have a low-quality or "defective" microphone. Ignore hiss, static, and low volume.
          Focus on identifying the words spoken. If the user said the words clearly enough to be understood by a native speaker, give a score >= 75.
          Return JSON: { type: "PERFECT"|"IMPROVABLE"|"UNNATURAL"|"INCORRECT", correction: string, explanation: string (PT-BR), score: number }` },
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
  } catch (e: any) {
    return handleAIError(e);
  }
}

export async function generateImmersiveResponse(history: any[], topic: string, level: string): Promise<string> {
  try {
    const ai = getAI();
    const formattedContents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts[0].text }]
    }));
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: formattedContents,
      config: { systemInstruction: `English Coach. Topic: ${topic}. Level: ${level}. Correct errors subtly.`, temperature: 0.8 }
    });
    return response.text || "I'm here.";
  } catch (e) { return "Offline."; }
}

export async function generatePedagogicalReport(student: UserProgress): Promise<string[]> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `Tips for ${student.level}. Skills: ${JSON.stringify(student.skills)}` }] }],
      config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
    });
    return JSON.parse(cleanJSON(response.text || "[]"));
  } catch (e) { return ["Practice daily."]; }
}

export async function getDiagnosticResult(responses: any[]) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Placement: ${JSON.stringify(responses)}` }] }],
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
}
