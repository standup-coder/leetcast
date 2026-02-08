export interface LeetCodeProblem {
  id: string;
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  topics: string[];
  description: string;
  acceptanceRate: string;
  examples?: string;
  constraints?: string;
  hints?: string[];
  solution?: string;
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}
