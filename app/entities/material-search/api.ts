import { apiFetch } from '@/shared/api/client';

export type MaterialSearchPayload = {
  query: string;
  topic?: string;
  course?: string;
  currentNodeTitle?: string;
  currentNodeDescription?: string;
  learnerLevel?: 'beginner' | 'intermediate' | 'advanced';
  language?: 'vi' | 'en' | 'both';
  maxResults?: number;
  preferredTypes?: string[];
};

export type MaterialSearchResult = {
  title?: string;
  url?: string;
  link?: string;
  source?: string;
  type?: string;
  description?: string;
  snippet?: string;
  why?: string;
  relevance?: number;
};

export type MaterialSearchResponse = {
  query?: string;
  results?: MaterialSearchResult[];
  materials?: MaterialSearchResult[];
  answer?: string;
  summary?: string;
  error?: string;
};

export const materialSearchApi = {
  search(payload: MaterialSearchPayload) {
    return apiFetch<MaterialSearchResponse>('/material-search', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  health() {
    return apiFetch('/material-search/health');
  },
};
