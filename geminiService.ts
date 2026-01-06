
import { GoogleGenAI, Type } from "@google/genai";
import { UserProgress, FeedbackType, AIFeedback } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AI Immersion Chat - Conversação Fluida
 */
export async function generateImmersiveResponse(history: any[], topic: string, level: string): Promise<string> {
  const ai = getAI();
  
  const formattedContents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.parts[0].text }]
  }));

  const systemInstruction = `You are a world-class English Coach for the platform FLUENT IMMERSION. 
  Current Topic: ${topic}. Student Proficiency Level: ${level}. 
  METHOD: Correct the student subtly using asterisks *like this* and provide a motivating follow-up question. 
  Stay in character as a supportive mentor. Be concise but warm.`;

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
    return response.text || "I'm listening. Could you elaborate on that?";
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
  Skills: Speaking ${student.skills.speaking}%, Listening ${student.skills.listening}%, Writing ${student.skills.writing}%, Reading ${student.skills.reading}%
  
  Rules:
  1. Tips must be actionable.
  2. Language: Portuguese (PT-BR).
  3. Output: JSON array of strings only.`;

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
      "Ouça podcasts no nível " + student.level + " durante o trajeto.",
      "Tente escrever um pequeno diário em inglês sobre seu dia.",
      "Revise as estruturas gramaticais do módulo atual.",
      "Utilize o AI Immersion Lab para testar vocabulário novo."
    ];
  }
}

export async function getDiagnosticResult(responses: any[]) {
  const ai = getAI();
  const systemInstruction = "You are an expert linguistic evaluator. Determine the student's CEFR level based on their answers.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: `Evaluate these answers for CEFR placement: ${JSON.stringify(responses)}` }] }],
      config: { 
        systemInstruction,
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
  } catch (e) {
    throw e;
  }
}

export async function analyzeAnswer(question: string, answer: string): Promise<AIFeedback> {
  const ai = getAI();
  const systemInstruction = `You are an English Teacher. Evaluate the student's answer.
  'type' must be one of:
  - PERFECT: Correct, natural, no errors.
  - IMPROVABLE: Grammatically correct but can be more natural or precise.
  - UNNATURAL: Correct grammar but phrasing is awkward for a native speaker.
  - INCORRECT: Significant grammatical or vocabulary errors.
  Always provide a score from 0 to 100.`;

  try {
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
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      type: FeedbackType.INCORRECT,
      correction: "Could not evaluate.",
      explanation: "There was an error communicating with the AI teacher.",
      score: 0
    };
  }
}

export async function analyzePronunciation(target: string, audio: string, mime: string): Promise<AIFeedback> {
  const ai = getAI();
  const systemInstruction = `Analyze the student's pronunciation of the target text. 
  Compare the audio to the text: "${target}".
  Be encouraging but precise. Score 100 for native-like, 0 for unrecognizable.`;

  try {
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
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      type: FeedbackType.INCORRECT,
      correction: "Audio analysis failed.",
      explanation: "Ensure your microphone is working and try again.",
      score: 0
    };
  }
}
