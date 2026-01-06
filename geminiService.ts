
import { GoogleGenAI, Type } from "@google/genai";
import { UserProgress, FeedbackType, AIFeedback } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AI Immersion Chat - Conversação Fluida
 */
export async function generateImmersiveResponse(history: any[], topic: string, level: string): Promise<string> {
  const ai = getAI();
  
  // Converte o histórico para o formato estrito da SDK Gemini 3
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
      config: { 
        systemInstruction, 
        temperature: 0.8,
        topP: 0.95 
      }
    });
    return response.text || "I'm processing your thoughts. Can you say that again?";
  } catch (e) {
    console.error("AI Error:", e);
    return "The Immersion Lab is reconnecting. Please try sending your message again.";
  }
}

/**
 * Relatório Pedagógico - 5 Dicas de Ouro
 */
export async function generatePedagogicalReport(student: UserProgress): Promise<string[]> {
  const ai = getAI();
  const prompt = `Analyze this student data and provide 5 HIGH-LEVEL pedagogical tips in Portuguese (PT-BR) for improvement.
  Level: ${student.level}
  XP: ${student.xp}
  Speaking: ${student.skills.speaking}%
  Listening: ${student.skills.listening}%
  Writing: ${student.skills.writing}%
  Reading: ${student.skills.reading}%
  
  Format the output as a clean JSON array of 5 strings. Each tip should be actionable.`;

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
      "Pratique conversação por 10 minutos extras no Lab.",
      "Assista vídeos curtos sem legenda para treinar o Listening.",
      "Tente escrever um parágrafo sobre seu dia no Lab de Writing.",
      "Revise vocabulário de viagens para aumentar sua confiança.",
      "Participe de sessões focadas em gramática para polir sua escrita."
    ];
  }
}

// Funções de utilidade para o LessonPlayer e Teste Diagnóstico
export async function getDiagnosticResult(responses: any[]) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [{ role: 'user', parts: [{ text: `Evaluate CEFR level: ${JSON.stringify(responses)}` }] }],
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
}

export async function analyzeAnswer(question: string, answer: string): Promise<AIFeedback> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Q: ${question} A: ${answer}` }] }],
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
}

export async function analyzePronunciation(target: string, audio: string, mime: string): Promise<AIFeedback> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        { text: `Evaluate pronunciation of: ${target}` },
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
  return JSON.parse(response.text || "{}");
}
