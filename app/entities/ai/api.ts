import { apiFetch } from '@/shared/api/client';

// ─── Types ────────────────────────────────────────────────────

export interface AIChatResponse {
  session_id: string;
  response: string;
}

export interface AIQuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface AIQuizResponse {
  questions: AIQuizQuestion[];
}

export interface AIEvaluateResponse {
  score: number;
  grade: string;
  feedback: string;
  suggestions: string[];
}

export interface AIResearchResponse {
  report: string;
}

export interface NodeChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string | null;
}

export interface NodeChatsResponse {
  chats: NodeChatMessage[];
}

// ─── API ─────────────────────────────────────────────────────

export const aiApi = {
  /**
   * Chat with DeepTutor AI.
   * session_id is optional — omit for new conversation, pass to continue.
   */
  chat(message: string, options?: { session_id?: string; node_id?: string; context?: string }) {
    return apiFetch<AIChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: options?.session_id ?? null,
        node_id: options?.node_id ?? null,
        context: options?.context ?? null,
      }),
    });
  },

  /**
   * Generate quiz questions from content.
   */
  generateQuiz(content: string, numQuestions = 5, difficulty = 'medium') {
    return apiFetch<AIQuizResponse>('/ai/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ content, num_questions: numQuestions, difficulty }),
    });
  },

  /**
   * Evaluate student work (essay, code, etc).
   */
  evaluate(content: string, criteria?: string) {
    return apiFetch<AIEvaluateResponse>('/ai/evaluate', {
      method: 'POST',
      body: JSON.stringify({ content, criteria: criteria ?? null }),
    });
  },

  /**
   * AI research report on a topic.
   */
  research(topic: string, depth = 'standard') {
    return apiFetch<AIResearchResponse>('/ai/research', {
      method: 'POST',
      body: JSON.stringify({ topic, depth }),
    });
  },

  /**
   * Get chat history for a learning node.
   */
  getNodeChats(nodeId: string) {
    return apiFetch<NodeChatsResponse>(`/ai/chat/history/${nodeId}`);
  },

  /**
   * Send chat message in context of a specific node.
   */
  sendNodeChat(nodeId: string, message: string) {
    return apiFetch<AIChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, node_id: nodeId }),
    });
  },

  /**
   * Update node content (learning service, not AI).
   */
  updateNodeContent(nodeId: string, content: string) {
    return apiFetch(`/learning/nodes/${nodeId}/content`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },
};
