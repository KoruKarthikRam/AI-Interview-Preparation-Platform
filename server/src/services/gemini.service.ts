import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyConfigured = apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE';

let genAI: GoogleGenerativeAI | null = null;
if (isApiKeyConfigured) {
  genAI = new GoogleGenerativeAI(apiKey as string);
} else {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    'WARNING: GEMINI_API_KEY is not set or is using the placeholder. Running in MOCK fallback mode for AI analysis.'
  );
}

// Interface definitions
export interface ResumeAnalysisResult {
  skills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface GeneratedQuestion {
  questionText: string;
  type: 'HR' | 'Technical' | 'Project' | 'Behavioral';
  order: number;
}

export interface AnswerEvaluationResult {
  score: number;
  feedback: string;
  improvement: string;
}

/**
 * Helper to call Gemini and parse JSON safely
 */
async function callGeminiJSON<T>(prompt: string, fallbackData: T): Promise<T> {
  if (!genAI) {
    // Return mock data after short delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return fallbackData;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    console.log('Falling back to mock data...');
    return fallbackData;
  }
}

/**
 * 1. Analyze Resume Text
 */
export async function analyzeResumeText(resumeText: string): Promise<ResumeAnalysisResult> {
  const prompt = `
    You are an expert Applicant Tracking System (ATS) and professional technical recruiter.
    Analyze the following resume text and identify:
    1. Key technical and soft skills present.
    2. Missing skills that are highly valued for the roles the candidate seems to target.
    3. Key strengths of the resume (e.g. detailed project descriptions, strong tech stack, metrics).
    4. Key weaknesses or areas for improvement (e.g. no internships, lack of cloud knowledge, vague project metrics).

    Resume Text:
    ${resumeText}

    Return a JSON object containing exactly these keys:
    {
      "skills": ["skill1", "skill2", ...],
      "missingSkills": ["missing1", "missing2", ...],
      "strengths": ["strength1", "strength2", ...],
      "weaknesses": ["weakness1", "weakness2", ...]
    }
  `;

  const fallback: ResumeAnalysisResult = {
    skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'HTML5', 'CSS3'],
    missingSkills: ['Docker', 'AWS (S3/EC2)', 'CI/CD Pipelines', 'TypeScript', 'Jest (Testing)'],
    strengths: [
      'Fullstack project development (E-commerce site built with React & Node)',
      'Solid database design skills and understanding of SQL schemas',
      'Active GitHub profile and usage of Git version control',
    ],
    weaknesses: [
      'No professional internship or industry experience listed',
      'No cloud deployment or DevOps technologies mentioned',
      'Project descriptions lack quantifiable impact (e.g., performance metrics, user numbers)',
    ],
  };

  return callGeminiJSON<ResumeAnalysisResult>(prompt, fallback);
}

/**
 * 2. Generate Interview Questions
 */
export async function generateInterviewQuestions(
  role: string,
  difficulty: string,
  resumeText: string
): Promise<GeneratedQuestion[]> {
  const prompt = `
    You are an expert technical interviewer. Generate exactly 10 interview questions for a mock interview.
    Role: ${role}
    Difficulty: ${difficulty}
    Candidate's Resume Text (use this to customize project-based and technical questions):
    ${resumeText}

    The questions must cover these categories:
    - 3 HR questions (cultural fit, background, motivation, conflict resolution)
    - 4 Technical questions (based on their skills, concepts relevant to the ${role} role, database, data structures)
    - 3 Project-based or Behavioral questions (referencing projects in their resume, or asking about software engineering challenges)

    Return a JSON array of 10 objects. Each object must contain exactly:
    {
      "questionText": "the question here",
      "type": "HR" | "Technical" | "Project" | "Behavioral",
      "order": number
    }
  `;

  const fallback: GeneratedQuestion[] = [
    {
      questionText: 'Tell me about yourself and why you are interested in this position.',
      type: 'HR',
      order: 1,
    },
    {
      questionText: 'What do you consider to be your greatest technical strength and your greatest weakness?',
      type: 'HR',
      order: 2,
    },
    {
      questionText: 'Describe a situation where you had to work with a difficult teammate. How did you handle it?',
      type: 'HR',
      order: 3,
    },
    {
      questionText: `Can you explain the difference between relational (SQL) and non-relational (NoSQL) databases, and when you would choose one over the other for a ${role} application?`,
      type: 'Technical',
      order: 4,
    },
    {
      questionText: 'What is the Event Loop in Node.js/JavaScript, and how does asynchronous execution work?',
      type: 'Technical',
      order: 5,
    },
    {
      questionText: 'Explain the difference between state and props in React. How do you decide where to manage state?',
      type: 'Technical',
      order: 6,
    },
    {
      questionText: 'How would you optimize a database query that has become slow as the volume of data grew?',
      type: 'Technical',
      order: 7,
    },
    {
      questionText: 'In your resume, you worked on projects. Can you walk me through the system design of one of your projects and explain your database choice?',
      type: 'Project',
      order: 8,
    },
    {
      questionText: 'What was the biggest technical challenge you faced while building one of your projects, and how did you resolve it?',
      type: 'Project',
      order: 9,
    },
    {
      questionText: 'If you were asked to add a notification feature to your project, how would you design it to ensure it is scalable?',
      type: 'Behavioral',
      order: 10,
    },
  ];

  return callGeminiJSON<GeneratedQuestion[]>(prompt, fallback);
}

/**
 * 3. Evaluate a single answer
 */
export async function evaluateAnswer(
  question: string,
  answerText: string
): Promise<AnswerEvaluationResult> {
  // If user didn't answer anything meaningful
  if (!answerText || answerText.trim().length < 5) {
    return {
      score: 1,
      feedback: 'The candidate did not provide a substantive answer to the question.',
      improvement: 'Be sure to explain your thoughts, give examples, or attempt to explain concepts even if you are unsure. Leaving a question blank or giving a single-word answer receives a score of 1.',
    };
  }

  const prompt = `
    You are an expert technical interviewer. Evaluate the candidate's answer to the given question.
    Question: ${question}
    Candidate's Answer: ${answerText}

    Evaluate and return a JSON object with:
    1. A score between 1 and 10 (integer), where 1 is completely incorrect or empty, and 10 is a flawless, structured, and comprehensive answer.
    2. Feedback summarizing what was good about the answer and what key concepts were missing or incorrect.
    3. Actionable improvement tips (e.g. mention specific technical keywords, use structured explanations like STAR method, or clarify details).

    Return a JSON object containing exactly these keys:
    {
      "score": number,
      "feedback": "string",
      "improvement": "string"
    }
  `;

  const fallback: AnswerEvaluationResult = {
    score: 7,
    feedback: 'Good basic response. You correctly defined the main concepts and showed a general understanding. However, the answer could be more structured and lacks details on specific optimization techniques.',
    improvement: 'Try to use concrete examples to illustrate your point. For instance, mention how indexing or caching could be applied in this context to show a deeper production-level understanding.',
  };

  return callGeminiJSON<AnswerEvaluationResult>(prompt, fallback);
}

// Interfaces for LeetCode Interview Mode
export interface LeetCodeProblem {
  title: string;
  description: string;
  examples: string[];
  constraints: string[];
}

export interface LeetCodeEvaluation {
  score: number;
  feedback: string;
  timeComplexityOptimal: string;
  spaceComplexityOptimal: string;
  correctnessDetails: string;
  improvement: string;
}

// Interfaces for Live Coding Assessment
export interface CodingProblem {
  title: string;
  description: string;
  starterCode: string;
  examples: string[];
  constraints: string[];
}

export interface CodingEvaluation {
  score: number;
  feedback: string;
  timeComplexity: string;
  spaceComplexity: string;
  edgeCasesFeedback: string;
  codeQualityFeedback: string;
  suggestedOptimizations: string;
}

// Interfaces for Career Roadmap Generator
export interface RoadmapWeek {
  week: number;
  title: string;
  topics: string[];
  description: string;
  estimatedHours: number;
}

export interface RoadmapResult {
  title: string;
  summary: string;
  weeks: RoadmapWeek[];
}

/**
 * 4. LeetCode Interview Mode: Generate problem statement
 */
export async function generateLeetCodeProblem(
  topics: string[],
  difficulty: string
): Promise<LeetCodeProblem> {
  const topicsStr = topics.join(', ');
  const prompt = `
    You are an expert DSA interviewer. Generate a LeetCode-style coding question.
    Selected Topics: ${topicsStr}
    Difficulty: ${difficulty}

    Return a JSON object containing exactly these keys:
    {
      "title": "Problem Title",
      "description": "Clean, formatted description of the problem",
      "examples": ["Example 1: Input: ..., Output: ..., Explanation: ...", "Example 2: ..."],
      "constraints": ["Constraint 1", "Constraint 2", ...]
    }
  `;

  // Determine fallback based on topics selected
  let fallback: LeetCodeProblem = {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
  };

  if (topics.includes('DP')) {
    fallback = {
      title: 'Climbing Stairs',
      description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      examples: [
        'Input: n = 2\nOutput: 2\nExplanation: There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps',
      ],
      constraints: ['1 <= n <= 45'],
    };
  } else if (topics.includes('Trees')) {
    fallback = {
      title: 'Maximum Depth of Binary Tree',
      description: 'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
      examples: [
        'Input: root = [3,9,20,null,null,15,7]\nOutput: 3',
      ],
      constraints: [
        'The number of nodes in the tree is in the range [0, 10^4].',
        '-100 <= Node.val <= 100',
      ],
    };
  } else if (topics.includes('Graphs')) {
    fallback = {
      title: 'Number of Islands',
      description: 'Given an m x n 2D binary grid grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.',
      examples: [
        'Input: grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]\nOutput: 1',
      ],
      constraints: [
        'm == grid.length',
        'n == grid[i].length',
        '1 <= m, n <= 300',
        'grid[i][j] is \'0\' or \'1\'.',
      ],
    };
  }

  return callGeminiJSON<LeetCodeProblem>(prompt, fallback);
}

/**
 * 5. LeetCode Interview Mode: Evaluate user's conceptual approach
 */
export async function evaluateLeetCodeApproach(
  problemTitle: string,
  problemDescription: string,
  userExplanation: string
): Promise<LeetCodeEvaluation> {
  const prompt = `
    You are an expert technical interviewer conducting a coding round.
    Evaluate the candidate's explanation of their approach to solve this problem.
    
    Problem Title: ${problemTitle}
    Problem Description: ${problemDescription}
    Candidate's Explanation: ${userExplanation}

    Analyze the explanation and return a JSON object with:
    1. score: 1 to 10 integer rating of their approach (clarity, optimality, edge cases considered).
    2. feedback: summary of the correctness and viability of their approach.
    3. timeComplexityOptimal: optimal time complexity for this problem and why they did/did not hit it.
    4. spaceComplexityOptimal: optimal space complexity for this problem.
    5. correctnessDetails: line-by-line or conceptual details on what was correct or missing.
    6. improvement: suggestions for sharpening their explanation or fixing their logic.

    Return a JSON object containing exactly these keys:
    {
      "score": number,
      "feedback": "string",
      "timeComplexityOptimal": "string",
      "spaceComplexityOptimal": "string",
      "correctnessDetails": "string",
      "improvement": "string"
    }
  `;

  const fallback: LeetCodeEvaluation = {
    score: 8,
    feedback: 'Your approach is conceptually correct and uses a Hash Map to store target complements. This achieves the optimal runtime complexity.',
    timeComplexityOptimal: 'O(N) - Single pass iteration through the elements.',
    spaceComplexityOptimal: 'O(N) - In the worst case, storing N items in the Map.',
    correctnessDetails: 'You correctly identified that a nested loop O(N^2) solution would be too slow, and successfully suggested looking up values in a HashMap in O(1) time. However, you did not explicitly mention how to handle duplicate numbers or clarify if the array is sorted.',
    improvement: 'Make sure to explicitly mention edge cases like duplicate elements or what happens if no solution is found.',
  };

  return callGeminiJSON<LeetCodeEvaluation>(prompt, fallback);
}

/**
 * 6. Live Coding Assessment: Generate Coding Problem and starter code template
 */
export async function generateCodingProblem(
  language: string,
  difficulty: string
): Promise<CodingProblem> {
  const prompt = `
    You are a technical assessment platform. Generate a LeetCode-style programming problem.
    Language: ${language}
    Difficulty: ${difficulty}

    Also provide starter code (boilerplate function/class signature) that is typical for a LeetCode problem in the selected language.

    Return a JSON object containing exactly these keys:
    {
      "title": "Problem Title",
      "description": "Detailed description of the problem, rules, inputs and output types",
      "starterCode": "boilerplate code string here",
      "examples": ["Example 1: Input: ..., Output: ...", "Example 2: ..."],
      "constraints": ["Constraint 1", "Constraint 2", ...]
    }
  `;

  let starterCode = '';
  switch (language.toLowerCase()) {
    case 'python':
      starterCode = 'class Solution:\n    def solve(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass';
      break;
    case 'javascript':
      starterCode = '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar solve = function(nums, target) {\n    // Write your code here\n    \n};';
      break;
    case 'cpp':
    case 'c++':
      starterCode = '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solve(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};';
      break;
    case 'java':
      starterCode = 'import java.util.*;\n\nclass Solution {\n    public int[] solve(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}';
      break;
    default:
      starterCode = '// Write code here';
  }

  const fallback: CodingProblem = {
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    starterCode: language.toLowerCase() === 'python'
      ? 'class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your code here\n        pass'
      : language.toLowerCase() === 'javascript'
      ? 'var isValid = function(s) {\n    // Write your code here\n};'
      : language.toLowerCase() === 'java'
      ? 'class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}'
      : '#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n    }\n};',
    examples: [
      'Input: s = "()"\nOutput: true',
      'Input: s = "()[]{}"\nOutput: true',
      'Input: s = "(]"\nOutput: false',
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses characters only \'()[]{}\'.',
    ],
  };

  return callGeminiJSON<CodingProblem>(prompt, fallback);
}

/**
 * 7. Live Coding Assessment: Evaluate code submission
 */
export async function evaluateCodingSubmission(
  problemTitle: string,
  problemDescription: string,
  code: string,
  language: string
): Promise<CodingEvaluation> {
  const prompt = `
    You are an AI code compiler and interviewer. Evaluate the candidate's code submission.
    
    Problem: ${problemTitle}
    Description: ${problemDescription}
    Programming Language: ${language}
    Submitted Code:
    \`\`\`${language}
    ${code}
    \`\`\`

    Evaluate the code across these dimensions and output exactly in JSON format:
    1. score: Integer from 1 to 10 based on correctness, efficiency, and quality.
    2. feedback: Brief summary of code correctness and design choice.
    3. timeComplexity: Theoretical time complexity of the user's code (e.g. O(N) or O(N^2)).
    4. spaceComplexity: Theoretical space complexity of the user's code (e.g. O(1) or O(N)).
    5. edgeCasesFeedback: Evaluation of whether edge cases (empty strings, null, boundary values, etc.) are handled correctly.
    6. codeQualityFeedback: Evaluation of naming conventions, formatting, use of idioms, and clean-code practices.
    7. suggestedOptimizations: Actionable steps to optimize performance or clean up styling.

    Return a JSON object containing exactly these keys:
    {
      "score": number,
      "feedback": "string",
      "timeComplexity": "string",
      "spaceComplexity": "string",
      "edgeCasesFeedback": "string",
      "codeQualityFeedback": "string",
      "suggestedOptimizations": "string"
    }
  `;

  const fallback: CodingEvaluation = {
    score: 9,
    feedback: 'Excellent solution! You successfully implemented a Stack-based solution to check matching parenthesis pairs in linear time.',
    timeComplexity: 'O(N) - We iterate through the string s once.',
    spaceComplexity: 'O(N) - In the worst case, the stack stores all characters (e.g. for input "(((((").',
    edgeCasesFeedback: 'All edge cases are handled correctly. The code returns false early or correctly identifies when the stack has unclosed elements left at the end. Empty string condition is implicitly handled.',
    codeQualityFeedback: 'Very good quality. Clean variable names, logical structure, and proper usage of standard collections.',
    suggestedOptimizations: 'You can speed up execution by mapping matching brackets to a hash map/dictionary to simplify conditions and reduce branching logic.',
  };

  return callGeminiJSON<CodingEvaluation>(prompt, fallback);
}

/**
 * 8. AI Career Roadmap Generator
 */
export async function generateRoadmap(
  skills: string,
  targetCompany: string
): Promise<RoadmapResult> {
  const prompt = `
    You are an expert career planner and tech recruiting consultant.
    Create a highly personalized 4-week preparation roadmap for a developer to pass the interviews at a target company.
    
    Current Skills: ${skills}
    Target Company: ${targetCompany}

    Return a JSON object containing exactly these keys:
    {
      "title": "Roadmap Title (e.g., Amazon SDE Preparation Roadmap)",
      "summary": "Brief explanation of company focus (e.g. Leadership Principles, System Design, DSA) and how it fits their current skills.",
      "weeks": [
        {
          "week": 1,
          "title": "Week 1: Topic Name",
          "topics": ["subtopic1", "subtopic2", ...],
          "description": "Specific focus area this week, why it is critical for target company, and resources/approaches to learn.",
          "estimatedHours": number
        },
        ... (Generate exactly 4 weeks)
      ]
    }
  `;

  const fallback: RoadmapResult = {
    title: `${targetCompany} Engineering Roadmap`,
    summary: `This roadmap is customized to leverage your skills in ${skills} to prepare you to pass technical screens at ${targetCompany}.`,
    weeks: [
      {
        "week": 1,
        "title": "Week 1: Advanced Arrays & Two-Pointer Solutions",
        "topics": ["Sliding Window", "In-place Array Mutations", "Complement mapping with Maps"],
        "description": `Critical for the initial screens at ${targetCompany}. Focus on optimized array structures.`,
        "estimatedHours": 10
      },
      {
        "week": 2,
        "title": "Week 2: Binary Trees & Recursive Traversal",
        "topics": ["DFS/BFS Traversals", "Binary Search Trees", "LCA Problems"],
        "description": `${targetCompany} commonly tests tree manipulation. Learn to explain recurrence relations.`,
        "estimatedHours": 12
      },
      {
        "week": 3,
        "title": "Week 3: Graphs & BFS Shortest Paths",
        "topics": ["Adjacency lists", "Dijkstra's Algorithm", "Graph cycle detection"],
        "description": "Master representation of graphs and traversal. Solve common pathfinding challenges.",
        "estimatedHours": 12
      },
      {
        "week": 4,
        "title": "Week 4: System Design & Leadership Principles",
        "topics": ["Caching & CDN", "Database sharding", "Behavioral questions response structuring"],
        "description": `Final loop mock. Align your experiences with ${targetCompany} values and core architectures.`,
        "estimatedHours": 15
      }
    ]
  };

  return callGeminiJSON<RoadmapResult>(prompt, fallback);
}
