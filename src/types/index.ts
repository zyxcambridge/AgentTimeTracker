export interface LearningEntry {
  id: string;
  date: string;
  duration: number; // 以分钟为单位
  content: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  value: number;
  color?: string;
  children?: MindMapNode[];
}

export interface TimeStatistics {
  totalTime: number;
  timeByCategory: {[category: string]: number};
  timeByDay: {[date: string]: number};
}