
import { GoogleGenAI, Type } from "@google/genai";
import { UserProgress, FeedbackType, AIFeedback } from "./types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Limpa blocos de markdown e espaços extras de strings JSON retornadas pela IA
 */
const cleanJSON = (text: string) => {
  if (!text) return "{}";
  // Remove blocos de código markdown (```json ... ```)
  let cleaned = text.replace(/```json\s?|```/g, "").trim();
  // Remove possíveis textos antes ou depois do primeiro/último caractere de objeto JSON
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  return cleaned;
};

export async function generateImmersiveResponse(history: any[], topic: string, level: string): Promise<string> {
  try {
    const ai = getAI();
    const formattedContents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts[0].text }]
    }));

    const systemInstruction = `You are a world-class English Coach for the platform FLUENT IMMERSION. 
    Current Topic: ${topic}. Student Proficiency Level: ${level}. 
    METHOD: Correct the student subtly using asterisks *like this* and provide a motivating follow-up question. 
    Stay in character as a supportive mentor. Be concise.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: formattedContents,
      config: { 
        systemInstruction, 
        temperature: 0.8,
        topP: 0.95 
      }
    });
    return response.text || "I'm sorry, I couldn't process that. Could you try again?";
  } catch (e) {
    console.error("AI Immersion Error:", e);
    return "The Immersion Lab is reconnecting. Please try again in a moment.";
  }
}

export async function analyzeAnswer(question: string, answer: string): Promise<AIFeedback> {
  try {
    const ai = getAI();
    const systemInstruction = `You are an expert English Teacher. Evaluate the student's answer based on grammar, naturalness, and context.
    Return JSON only with these fields:
    - type: "PERFECT", "IMPROVABLE", "UNNATURAL", or "INCORRECT"
    - correction: String with the corrected sentence
    - explanation: Short explanation in Portuguese (PT-BR)
    - score: Number from 0 to 100`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `Question: ${question}\nStudent Answer: ${answer}` }] }],
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

    const jsonText = cleanJSON(response.text || "{}");
    return JSON.parse(jsonText);
  } catch (e: any) {
    console.error("Analyze Answer Error:", e);
    const errorMsg = e.message === "API_KEY_MISSING" 
      ? "Configuração de API pendente no servidor." 
      : "Falha na comunicação com o professor IA.";
      
    return {
      type: FeedbackType.INCORRECT,
      correction: "Erro de sistema.",
      explanation: errorMsg,
      score: 0
    };
  }
}

export async function analyzePronunciation(target: string, audio: string, mime: string): Promise<AIFeedback> {
  try {
    const ai = getAI();
    const systemInstruction = `Analyze the student's pronunciation. Target text: "${target}". Evaluate accuracy and fluency.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { text: `Evaluate pronunciation of: "${target}"` },
          { inlineData: { data: audio, mimeType: mime } }
        ]
      },
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
  } catch (e: any) {
    console.error("Pronunciation Error:", e);
    return {
      type: FeedbackType.INCORRECT,
      correction: "Análise falhou.",
      explanation: e.message === "API_KEY_MISSING" ? "API Key não encontrada." : "O serviço de voz está temporariamente indisponível.",
      score: 0
    };
  }
}

export async function generatePedagogicalReport(student: UserProgress): Promise<string[]> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: `Generate 5 pedagogical tips for a student at level ${student.level} with these stats: ${JSON.stringify(student.skills)}` }] }],
      config: {
        systemInstruction: "You are a senior pedagogical coordinator. Output a JSON array of 5 strings in Portuguese (PT-BR).",
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(cleanJSON(response.text || "[]"));
  } catch (e) {
    console.error("Report Error:", e);
    return [
      "Pratique a escuta ativa com podcasts de 5 minutos diariamente.",
      "Tente descrever seu dia em voz alta para melhorar a fluência.",
      "Revise os verbos irregulares mais comuns do seu nível.",
      "Escreva pequenos parágrafos sobre seus hobbies para treinar o writing.",
      "Utilize o Immersion Lab para simular situações reais."
    ];
  }
}

export async function getDiagnosticResult(responses: any[]) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: `Diagnostic placement: ${JSON.stringify(responses)}` }] }],
      config: {
        systemInstruction: "Evaluate the student's CEFR level.",
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
    console.error("Diagnostic Error:", e);
    throw e;
  }
}
