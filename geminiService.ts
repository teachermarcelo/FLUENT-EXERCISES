
import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackType, AIFeedback } from "./types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeAnswer(
  question: string,
  userAnswer: string,
  context?: string
): Promise<AIFeedback> {
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

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: Object.values(FeedbackType),
            description: "The classification of the feedback."
          },
          correction: {
            type: Type.STRING,
            description: "The correct or better version of the answer."
          },
          explanation: {
            type: Type.STRING,
            description: "A detailed 'Why' explanation of the correction."
          },
          naturalAlternative: {
            type: Type.STRING,
            description: "An alternative phrase that sounds more native (optional)."
          }
        },
        required: ["type", "correction", "explanation"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim()) as AIFeedback;
  } catch (e) {
    console.error("Failed to parse AI feedback", e);
    return {
      type: FeedbackType.INCORRECT,
      correction: "Error processing feedback.",
      explanation: "Something went wrong while communicating with the AI."
    };
  }
}

export async function analyzePronunciation(
  expectedText: string,
  audioBase64: string,
  mimeType: string
): Promise<AIFeedback> {
  const prompt = `
    Act as a professional phonetics expert. Listen to the provided audio.
    The user is trying to say: "${expectedText}"

    Evaluate their pronunciation, intonation, and clarity.
    Provide:
    1. A score from 0 to 100 (where 100 is native-level).
    2. A classification (PERFECT, IMPROVABLE, UNNATURAL, or INCORRECT).
    3. Specific tips on which sounds they missed (e.g., 'th' sounds, vowel length).

    Provide feedback in JSON format.
  `;

  const audioPart = {
    inlineData: {
      data: audioBase64,
      mimeType: mimeType,
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: prompt }, audioPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: Object.values(FeedbackType) },
          correction: { type: Type.STRING, description: "The correct transcription of what you heard." },
          explanation: { type: Type.STRING, description: "Phonetic feedback and tips." },
          score: { type: Type.NUMBER, description: "A percentage score from 0 to 100." }
        },
        required: ["type", "correction", "explanation", "score"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    return {
      type: FeedbackType.INCORRECT,
      correction: "Could not analyze audio.",
      explanation: "There was an error processing your voice. Please try again.",
      score: 0
    };
  }
}

export async function generateConversationResponse(
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  situation: string
): Promise<string> {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an English conversation partner. Currently simulating this situation: ${situation}. Speak naturally as a native speaker would. Keep responses relatively short (1-3 sentences) to maintain conversation flow. If the user makes a minor mistake, just continue the conversation naturally but incorporate the correct form in your reply.`,
    }
  });

  const lastMsg = history[history.length - 1];
  const response = await chat.sendMessage({ message: lastMsg.parts[0].text });
  return response.text;
}

export async function getDiagnosticResult(responses: { question: string, answer: string }[]): Promise<{ level: string, feedback: string, strengths: string[], areasToImprove: string[] }> {
  const prompt = `
    Based on the following 15 answers to a Placement Test, determine the user's CEFR level (A1, A2, B1, B2, C1, or C2).
    Analyze their grammar, vocabulary range, and ability to handle complex topics.
    
    User Responses:
    ${JSON.stringify(responses)}

    Output must be JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
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

  return JSON.parse(response.text.trim());
}
