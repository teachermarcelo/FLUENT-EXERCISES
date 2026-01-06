
import { GoogleGenAI, Type } from "@google/genai";
import { UserProgress, FeedbackType, AIFeedback } from "./types";

// Inicialização única seguindo as regras da SDK
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AI Immersion - Conversação Inteligente
 */
export async function generateImmersiveResponse(history: any[], topic: string, level: string): Promise<string> {
  const ai = getAI();
  
  // Mapeamento correto do histórico para a SDK
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.parts[0].text }]
  }));

  const systemInstruction = `You are a world-class English Coach for the platform FLUENT IMMERSION. 
  Topic: ${topic}. Student Level: ${level}. 
  CRITICAL RULE: Correct the student using the sandwich method (Praise -> Subtle correction with *asterisks* -> Follow-up question). 
  Keep the conversation natural, immersive, and encouraging. Never break character.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: formattedHistory,
      config: { 
        systemInstruction, 
        temperature: 0.8,
        topP: 0.95 
      }
    });
    // Uso da propriedade .text diretamente conforme diretriz
    return response.text || "I'm listening, please continue!";
  } catch (e) {
    console.error("Gemini Error:", e);
    return "The immersion lab is currently recalibrating. Please send your message again in a few seconds.";
  }
}

/**
 * Relatório Pedagógico - 5 Pontos de Melhoria
 */
export async function generatePedagogicalReport(student: UserProgress): Promise<string[]> {
  const ai = getAI();
  const prompt = `Analyze this student performance data and provide EXACTLY 5 high-impact pedagogical tips for their English improvement.
  Level: ${student.level}
  XP: ${student.xp}
  Speaking Skill: ${student.skills.speaking}%
  Listening Skill: ${student.skills.listening}%
  Writing Skill: ${student.skills.writing}%
  Reading Skill: ${student.skills.reading}%
  
  Guidelines:
  1. Be professional and encouraging.
  2. Focus on the lowest skill scores.
  3. Suggest practical daily exercises.
  
  OUTPUT FORMAT: A JSON array of 5 strings in Portuguese (PT-BR).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [
      "Pratique 15 minutos de conversação diária para elevar seu speaking.",
      "Ouça podcasts no nível " + student.level + " durante o trajeto para o trabalho.",
      "Tente escrever um pequeno diário em inglês sobre seu dia.",
      "Revise as estruturas gramaticais do módulo atual.",
      "Utilize o AI Immersion Lab para testar vocabulário novo em contextos reais."
    ];
  }
}

export async function getDiagnosticResult(responses: { question: string, answer: string }[]): Promise<any> {
  const ai = getAI();
  const prompt = `Evaluate the following test: ${JSON.stringify(responses)}. Determine CEFR level.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
    return JSON.parse(response.text || "{}");
  } catch (e) { throw e; }
}

export async function analyzeAnswer(question: string, answer: string): Promise<AIFeedback> {
  const ai = getAI();
  const prompt = `Evaluate: Q: ${question} A: ${answer}`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            correction: { type: Type.STRING },
            explanation: { type: Type.STRING },
            naturalAlternative: { type: Type.STRING },
            score: { type: Type.NUMBER }
          },
          required: ["type", "correction", "explanation", "score"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { type: FeedbackType.INCORRECT, correction: "Error", explanation: "System busy.", score: 0 };
  }
}

export async function analyzePronunciation(targetText: string, base64Audio: string, mimeType: string): Promise<AIFeedback> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { text: `Evaluate pronunciation of: "${targetText}"` },
          { inlineData: { data: base64Audio, mimeType: mimeType } }
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
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { type: FeedbackType.INCORRECT, correction: "Audio error", explanation: "Process failed.", score: 0 };
  }
}
