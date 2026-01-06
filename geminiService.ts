
import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackType, AIFeedback, ProficiencyLevel } from "./types";

/**
 * Analyzes a user's text answer based on a question and context.
 */
export async function analyzeAnswer(
  question: string,
  userAnswer: string,
  context?: string
): Promise<AIFeedback> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Evaluate this English response.
    Context: "${question}"
    User Answer: "${userAnswer}"
    Return JSON with: type (PERFECT, IMPROVABLE, UNNATURAL, INCORRECT), correction, explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: Object.values(FeedbackType) },
            correction: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["type", "correction", "explanation"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Gemini analyzeAnswer error:", e);
    return { type: FeedbackType.INCORRECT, correction: "Error", explanation: "Connection issues." };
  }
}

/**
 * Generates an immersive response for a chat conversation with an English coach.
 */
export async function generateImmersiveResponse(
  history: any[],
  topic: string,
  level: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Format history for the SDK: it expects an array of { role, parts: [{ text }] }
  const formattedHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.parts[0].text }]
  }));

  const systemInstruction = `
    You are an English coach at FLUENT IMMERSION.
    Topic: ${topic}. Student Level: ${level}.
    RULES:
    1. Always respond naturally to the user first.
    2. Correct mistakes using *asterisks* (e.g., "I *went* to the mall" instead of "I go").
    3. Keep it interactive. Always end with a question related to ${topic}.
    4. Maintain the "Sandwich Feedback" method: Praise/Response -> Correction -> New Question.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: formattedHistory,
      config: { 
        systemInstruction,
        temperature: 0.7,
        topP: 0.95
      }
    });
    return response.text || "I'm sorry, I couldn't process that. Can you repeat?";
  } catch (e) {
    console.error("Gemini generateImmersiveResponse error:", e);
    return "Network error. Let's try again! (Please check your API configuration)";
  }
}

/**
 * Evaluates a set of diagnostic responses to determine a student's proficiency level.
 */
export async function getDiagnosticResult(responses: { question: string, answer: string }[]): Promise<{
  level: ProficiencyLevel;
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
}> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataString = responses.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n');
  const prompt = `Analyze these student responses and determine their English level (A1-C2).
  
  Responses:
  ${dataString}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
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
    console.error("Diagnostic analysis failed", e);
    throw e;
  }
}

/**
 * Analyzes pronunciation of audio data against a target text.
 */
export async function analyzePronunciation(
  targetText: string,
  base64Audio: string,
  mimeType: string
): Promise<AIFeedback> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Evaluate pronunciation against: "${targetText}".
    Return JSON: type (PERFECT, IMPROVABLE, UNNATURAL, INCORRECT), correction, explanation, score (0-100).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: base64Audio } },
            { text: prompt }
          ]
        }
      ],
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
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Pronunciation analysis failed", e);
    return { type: FeedbackType.INCORRECT, correction: "N/A", explanation: "Audio error.", score: 0 };
  }
}
