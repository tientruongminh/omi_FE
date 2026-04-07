import { apiFetch } from '@/shared/api/client';

// ─── Types ────────────────────────────────────────────────────

export interface AIChatResponse {
  session_id: string;
  response: string;
}

export interface AIQuizQuestion {
  question: string;
  options: { label: string; text: string; correct: boolean }[];
  explanation?: string;
}

export interface AIQuizResponse {
  questions: AIQuizQuestion[];
}

export interface AIEvaluateResponse {
  score: number;
  grade: string;
  feedback: string;
  suggestions?: string[];
}

export interface AIResearchResponse {
  report: string;
}

export interface NodeChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  created_at: string;
}

export interface NodeChatsResponse {
  chats: NodeChatMessage[];
}

// ─── API ─────────────────────────────────────────────────────

export const aiApi = {
  chat(userId: string, message: string, language = 'vi') {
    return apiFetch<AIChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, message, language }),
    });
  },

  generateQuiz(userId: string, content: string, count = 5, language = 'vi') {
    return apiFetch<AIQuizResponse>('/ai/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, content, count, language }),
    });
  },

  evaluate(userId: string, question: string, answer: string, language = 'vi') {
    return apiFetch<AIEvaluateResponse>('/ai/evaluate', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, question, answer, language }),
    });
  },

  research(userId: string, topic: string, depth = 'medium', language = 'vi') {
    return apiFetch<AIResearchResponse>('/ai/research', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, topic, depth, language }),
    });
  },

  // Node-specific chats
  getNodeChats(nodeId: string) {
    return apiFetch<NodeChatsResponse>(`/learning/nodes/${nodeId}/chats`);
  },

  sendNodeChat(nodeId: string, message: string) {
    return apiFetch<{ chat: NodeChatMessage }>(`/learning/nodes/${nodeId}/chats`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  updateNodeContent(nodeId: string, content: string) {
    return apiFetch(`/learning/nodes/${nodeId}/content`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },
};
