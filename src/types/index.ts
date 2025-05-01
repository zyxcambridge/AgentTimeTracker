export interface LearningEntry {
  id: string;
  date: string;
  duration: number; // 以分钟为单位
  content: string;
  category: string;
  tags?: string[];
  complexity?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface LearningTopic {
  id: string;
  name: string;
  category: string;
  subtopics: string[];
  keywords: string[];
}

export interface LearningSuggestion {
  topic: string;
  content: string;
  category: string;
  estimatedDuration: number;
  difficulty: number;
  prerequisites?: string[];
}

export interface RecentLearning {
  content: string;
  frequency: number;
  lastUsed: string;
  category: string;
}

export interface TimeStatistics {
  totalTime: number;
  timeByCategory: {[category: string]: number};
  timeByDay: {[date: string]: number};
}

export interface MindMapNode {
  id: string;
  label: string;
  value: number;
  color?: string;
  children?: MindMapNode[];
}