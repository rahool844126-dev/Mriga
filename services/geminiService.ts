
import { GoogleGenAI, Chat } from '@google/genai';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a UI message instead of throwing an error.
  // For this environment, we assume the API_KEY is always present.
  console.error('API_KEY environment variable not set');
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const createChatSession = (systemInstruction: string): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
    // The history is managed in the App component, so we start fresh here.
  });
  return chat;
};
