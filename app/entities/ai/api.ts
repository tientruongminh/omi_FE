import { apiFetch } from '@/shared/api/client';
import { requestTokenBalanceRefresh } from '@/shared/lib/tokenBalanceEvents';

// ─── Types ────────────────────────────────────────────────────

export interface AIChatResponse {
  session_id: string;
  response: string;
}

export interface StudyCitation {
  source_title: string;
  quote: string;
  passage_id?: string | null;
  source_id?: string | null;
}

export interface StudyChatResponse {
  answer: string;
  citations: StudyCitation[];
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

export interface StudyPayload {
  message: string;
  canvas_node_id?: string;
  project_id?: string;
  node_id?: string;
  source_id?: string;
  source_type?: string;
  passage_ids?: string[];
  context?: string;
  selected_text?: string;
}

// ─── API ─────────────────────────────────────────────────────

export const aiApi = {
  async studyChat(payload: StudyPayload) {
    const res = await apiFetch<StudyChatResponse>('/study/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    requestTokenBalanceRefresh();
    return res;
  },

  async generateStudyNotes(payload: StudyPayload) {
    const res = await apiFetch<{ content: string; citations: StudyCitation[] }>('/study/notes/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    requestTokenBalanceRefresh();
    return res;
  },

  async generateStudySummary(payload: StudyPayload) {
    const res = await apiFetch<{ content: string; citations: StudyCitation[] }>('/study/summary/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    requestTokenBalanceRefresh();
    return res;
  },

  async generateStudyReview(payload: StudyPayload) {
    const res = await apiFetch<{
      quiz: Array<{ question: string; options: string[]; correct_index: number; explanation: string }>;
      flashcards: Array<{ front: string; back: string }>;
      essay: { prompt: string; rubric: string[] };
      teach: { prompt: string };
      citations: StudyCitation[];
    }>('/study/review/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    requestTokenBalanceRefresh();
    return res;
  },

  /**
   * Chat with DeepTutor AI.
   * session_id is optional — omit for new conversation, pass to continue.
   */
  async chat(message: string, options?: { session_id?: string; node_id?: string; context?: string }) {
    const res = await apiFetch<AIChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: options?.session_id ?? null,
        node_id: options?.node_id ?? null,
        context: options?.context ?? null,
      }),
    });
    requestTokenBalanceRefresh();
    return res;
  },

  /**
   * Generate quiz questions from content.
   */
  async generateQuiz(content: string, numQuestions = 5, difficulty = 'medium') {
    const res = await apiFetch<AIQuizResponse>('/ai/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ content, num_questions: numQuestions, difficulty }),
    });
    requestTokenBalanceRefresh();
    return res;
  },

  /**
   * Evaluate student work (essay, code, etc).
   */
  async evaluate(content: string, criteria?: string) {
    const res = await apiFetch<AIEvaluateResponse>('/ai/evaluate', {
      method: 'POST',
      body: JSON.stringify({ content, criteria: criteria ?? null }),
    });
    requestTokenBalanceRefresh();
    return res;
  },

  /**
   * AI research report on a topic.
   */
  async research(topic: string, depth = 'standard') {
    const res = await apiFetch<AIResearchResponse>('/ai/research', {
      method: 'POST',
      body: JSON.stringify({ topic, depth }),
    });
    requestTokenBalanceRefresh();
    return res;
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
  async sendNodeChat(nodeId: string, message: string) {
    const res = await apiFetch<AIChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, node_id: nodeId }),
    });
    requestTokenBalanceRefresh();
    return res;
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
