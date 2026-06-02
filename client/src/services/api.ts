const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get JWT token from local storage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Set JWT token in local storage
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

/**
 * Clear JWT token from local storage
 */
export const clearToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

/**
 * Generic request helper
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Only set Content-Type to JSON if it's not a FormData (like resume upload)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    clearToken();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// API Services
export const authService = {
  register: async (name: string, email: string, password: string) => {
    const res = await fetchAPI<{ token: string; user: { id: string; name: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(res.token);
    return res.user;
  },

  login: async (email: string, password: string) => {
    const res = await fetchAPI<{ token: string; user: { id: string; name: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    return res.user;
  },

  me: async () => {
    return fetchAPI<{ id: string; name: string; email: string; createdAt: string }>('/auth/me');
  },
};

export const resumeService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return fetchAPI<{
      id: string;
      fileName: string;
      createdAt: string;
      skills: string[];
      missingSkills: string[];
      strengths: string[];
      weaknesses: string[];
    }>('/resume/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getLatest: async () => {
    return fetchAPI<{
      id: string;
      fileName: string;
      createdAt: string;
      skills: string[];
      missingSkills: string[];
      strengths: string[];
      weaknesses: string[];
    }>('/resume/latest');
  },
};

export interface QuestionData {
  id: string;
  questionText: string;
  type: string;
  order: number;
  answer?: {
    answerText: string;
    score: number;
    feedback: string;
    improvement: string;
  };
}

export interface InterviewData {
  id: string;
  title: string;
  role: string;
  difficulty: string;
  score?: number | null;
  feedback?: string | null;
  createdAt: string;
  questions?: QuestionData[];
}

export const interviewService = {
  create: async (role: string, difficulty: string) => {
    return fetchAPI<InterviewData>('/interview', {
      method: 'POST',
      body: JSON.stringify({ role, difficulty }),
    });
  },

  list: async () => {
    return fetchAPI<Omit<InterviewData, 'questions'>[]>('/interview');
  },

  get: async (id: string) => {
    return fetchAPI<InterviewData>(`/interview/${id}`);
  },

  submitAnswer: async (interviewId: string, questionId: string, answerText: string) => {
    return fetchAPI<{
      id: string;
      questionId: string;
      answerText: string;
      score: number;
      feedback: string;
      improvement: string;
    }>(`/interview/${interviewId}/question/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answerText }),
    });
  },

  complete: async (id: string) => {
    return fetchAPI<InterviewData>(`/interview/${id}/complete`, {
      method: 'POST',
    });
  },
};

export const analyticsService = {
  get: async () => {
    return fetchAPI<{
      stats: {
        totalInterviews: number;
        completedInterviews: number;
        avgScore: number;
        totalAnswers: number;
        hasResume: boolean;
      };
      scoreTrend: { name: string; date: string; score: number }[];
      topicStats: { topic: string; score: number; count: number }[];
    }>('/analytics');
  },
};

// --- Advanced Features Services ---

export interface LeetCodeSessionData {
  id: string;
  topics: string; // JSON string
  difficulty: string;
  problemTitle: string;
  problemDescription: string;
  userExplanation?: string | null;
  aiEvaluation?: string | null; // JSON string
  score?: number | null;
  createdAt: string;
}

export interface CodingAssessmentData {
  id: string;
  difficulty: string;
  language: string;
  problemTitle: string;
  problemDescription: string;
  starterCode: string;
  code?: string | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
  edgeCases?: string | null; // JSON string
  codeQuality?: string | null; // JSON string
  score?: number | null;
  feedback?: string | null;
  createdAt: string;
}

export interface RoadmapWeekData {
  week: number;
  title: string;
  topics: string[];
  description: string;
  estimatedHours: number;
}

export interface RoadmapData {
  id: string;
  skills: string;
  targetCompany: string;
  roadmapData: string; // JSON string representing: { title: string, summary: string, weeks: RoadmapWeekData[] }
  createdAt: string;
}

export const leetcodeService = {
  create: async (topics: string[], difficulty: string) => {
    return fetchAPI<LeetCodeSessionData>('/leetcode/session', {
      method: 'POST',
      body: JSON.stringify({ topics, difficulty }),
    });
  },
  list: async () => {
    return fetchAPI<Omit<LeetCodeSessionData, 'problemDescription' | 'aiEvaluation'>[]>('/leetcode/session');
  },
  get: async (id: string) => {
    return fetchAPI<LeetCodeSessionData>(`/leetcode/session/${id}`);
  },
  submitExplanation: async (id: string, explanation: string) => {
    return fetchAPI<LeetCodeSessionData>(`/leetcode/session/${id}/explain`, {
      method: 'POST',
      body: JSON.stringify({ explanation }),
    });
  },
};

export const codingService = {
  create: async (language: string, difficulty: string) => {
    return fetchAPI<CodingAssessmentData>('/coding/assessment', {
      method: 'POST',
      body: JSON.stringify({ language, difficulty }),
    });
  },
  list: async () => {
    return fetchAPI<Omit<CodingAssessmentData, 'problemDescription' | 'starterCode'>[]>('/coding/assessment');
  },
  get: async (id: string) => {
    return fetchAPI<CodingAssessmentData>(`/coding/assessment/${id}`);
  },
  submitCode: async (id: string, code: string) => {
    return fetchAPI<CodingAssessmentData>(`/coding/assessment/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
};

export const roadmapService = {
  create: async (skills: string, targetCompany: string) => {
    return fetchAPI<RoadmapData>('/roadmap', {
      method: 'POST',
      body: JSON.stringify({ skills, targetCompany }),
    });
  },
  list: async () => {
    return fetchAPI<Omit<RoadmapData, 'roadmapData'>[]>('/roadmap');
  },
  get: async (id: string) => {
    return fetchAPI<RoadmapData>(`/roadmap/${id}`);
  },
};
