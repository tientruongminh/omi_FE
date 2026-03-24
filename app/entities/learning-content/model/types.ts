export interface LearningDocument {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'worksheet';
  size?: string; // e.g. "12 trang"
  duration?: string; // e.g. "45 phút"
}

export interface ContentNode {
  id: string;
  label: string;
  type: 'video' | 'pdf' | 'quiz';
  docId: string;
}

export interface MindmapNodeData {
  id: string;
  label: string;
  subtitle: string;
  documents: LearningDocument[];
}

export interface QuizOption {
  label: string;
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface EssayQuestion {
  id: string;
  question: string;
}

export interface TeachAIPrompt {
  id: string;
  topic: string;
  aiQuestion: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe?: boolean;
}

export interface AIResponse {
  question: string;
  answer: string;
}
