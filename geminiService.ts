
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
      contents: prompt,
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
  const systemInstruction = `
    You are an English coach at FLUENT IMMERSION.
    Mode: ${topic}. Student Level: ${level}.
    RULES:
    1. Respond naturally to the user.
    2. Correct mistakes using *asterisks* (e.g. "I *went* to the store").
    3. Keep it interactive. Always end with a question.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history,
      config: { systemInstruction }
    });
    return response.text || "I'm here, but I didn't get that. Say again?";
  } catch (e) {
    return "Network error. Let's try again!";
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
  const prompt = `Analyze these student responses from a placement test and determine their English level according to CEFR (A1, A2, B1, B2, C1, C2).
  
  Student Responses:
  ${responses.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n')}
  
  Provide a detailed evaluation including specific strengths and areas for improvement.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
            feedback: { type: Type.STRING, description: "A brief pedagogical summary for the student." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Linguistic strengths identified." },
            areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific focus areas for the student." }
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
    Evaluate the pronunciation in the attached audio against the target phrase: "${targetText}".
    Provide a score from 0-100 based on clarity, rhythm, and accuracy.
    Return the analysis in JSON format.
  `;

  const audioPart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Audio,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [audioPart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: Object.values(FeedbackType) },
            correction: { type: Type.STRING, description: "Phonetic or word-level correction if needed." },
            explanation: { type: Type.STRING, description: "Detailed feedback on pronunciation." },
            score: { type: Type.NUMBER, description: "Pronunciation accuracy score (0-100)." }
          },
          required: ["type", "correction", "explanation", "score"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Pronunciation analysis failed", e);
    return { 
      type: FeedbackType.INCORRECT, 
      correction: "N/A", 
      explanation: "Audio processing failed. Please try again.", 
      score: 0 
    };
  }
}
