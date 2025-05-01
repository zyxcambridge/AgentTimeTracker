import { LearningEntry, TimeStatistics, MindMapNode, Category } from '../types';

// 自动分类学习内容
export const categorizeContent = (content: string, existingCategories: Category[]): string => {
  const keywords: {[key: string]: string[]} = {
    '机器学习': ['机器学习', 'ML', '算法', '模型训练', '神经网络'],
    '自然语言处理': ['NLP', '自然语言', '文本分析', '语言模型', 'GPT', 'LLM'],
    '计算机视觉': ['计算机视觉', 'CV', '图像识别', '物体检测'],
    '强化学习': ['强化学习', 'RL', '奖励机制', '策略'],
    'AI应用': ['应用', '实现', '部署', '案例研究'],
    'AI伦理': ['伦理', '隐私', '偏见', '公平性'],
  };

  // 检查内容中是否包含现有分类的名称
  for (const category of existingCategories) {
    if (content.includes(category.name)) {
      return category.id;
    }
  }

  // 关键词匹配
  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (content.toLowerCase().includes(word.toLowerCase())) {
        // 查找或创建分类ID
        const existingCategory = existingCategories.find(c => c.name === category);
        return existingCategory ? existingCategory.id : category;
      }
    }
  }

  return '其他'; // 默认分类
};

// 计算时间统计数据
export const calculateStatistics = (entries: LearningEntry[]): TimeStatistics => {
  const stats: TimeStatistics = {
    totalTime: 0,
    timeByCategory: {},
    timeByDay: {}
  };

  entries.forEach(entry => {
    // 总时间
    stats.totalTime += entry.duration;

    // 按分类统计
    if (!stats.timeByCategory[entry.category]) {
      stats.timeByCategory[entry.category] = 0;
    }
    stats.timeByCategory[entry.category] += entry.duration;

    // 按日期统计
    if (!stats.timeByDay[entry.date]) {
      stats.timeByDay[entry.date] = 0;
    }
    stats.timeByDay[entry.date] += entry.duration;
  });

  return stats;
};

// 生成思维导图数据
export const generateMindMapData = (
  entries: LearningEntry[], 
  categories: Category[]
): MindMapNode => {
  const rootNode: MindMapNode = {
    id: 'root',
    label: 'Agent学习',
    value: 0,
    children: []
  };

  // 创建分类节点映射
  const categoryNodes: {[id: string]: MindMapNode} = {};
  
  categories.forEach(category => {
    categoryNodes[category.id] = {
      id: category.id,
      label: category.name,
      value: 0,
      color: category.color,
      children: []
    };
  });

  // 处理没有预定义的分类
  entries.forEach(entry => {
    if (!categoryNodes[entry.category]) {
      const newCategory = {
        id: entry.category,
        label: entry.category,
        value: 0,
        children: []
      };
      categoryNodes[entry.category] = newCategory;
    }
  });

  // 根据条目更新节点值和子节点
  entries.forEach(entry => {
    const categoryNode = categoryNodes[entry.category];
    
    // 更新分类节点值
    categoryNode.value += entry.duration;
    
    // 检查是否已经有该内容的子节点
    let contentNode = categoryNode.children?.find(child => 
      child.label === entry.content
    );
    
    if (!contentNode) {
      contentNode = {
        id: `${entry.category}-${entry.content}`,
        label: entry.content,
        value: entry.duration
      };
      if (!categoryNode.children) {
        categoryNode.children = [];
      }
      categoryNode.children.push(contentNode);
    } else {
      contentNode.value += entry.duration;
    }
  });

  // 将非空分类添加到根节点
  rootNode.children = Object.values(categoryNodes)
    .filter(node => node.value > 0);
  
  // 计算根节点的总值
  rootNode.value = rootNode.children.reduce(
    (sum, node) => sum + node.value, 0
  );

  return rootNode;
};

// 格式化时间显示 (分钟转为小时和分钟)
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? ` ${mins}分钟` : ''}`;
  }
  return `${mins}分钟`;
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 获取今天的日期字符串 (YYYY-MM-DD)
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// 默认分类列表
export const defaultCategories: Category[] = [
  { id: 'ml', name: '机器学习', color: '#2563EB' },
  { id: 'nlp', name: '自然语言处理', color: '#8B5CF6' },
  { id: 'cv', name: '计算机视觉', color: '#EC4899' },
  { id: 'rl', name: '强化学习', color: '#10B981' },
  { id: 'app', name: 'AI应用', color: '#F59E0B' },
  { id: 'ethics', name: 'AI伦理', color: '#6B7280' },
  { id: 'other', name: '其他', color: '#9CA3AF' }
];