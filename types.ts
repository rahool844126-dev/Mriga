import { Chat } from '@google/genai';

export enum MessageRole {
  USER = 'user',
  BOT = 'model',
}

export interface ChatMessage {
  role: MessageRole;
  text: string;
}

export type VoiceGender = 'male' | 'female';

export interface Personality {
  name: string;
  systemInstruction: string;
  gender?: VoiceGender;
}

export enum BotStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
}