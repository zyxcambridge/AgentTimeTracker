import React, { useState, useEffect } from 'react';
import { Tag, Clock, Brain, History } from 'lucide-react';
import { LearningSuggestion, RecentLearning } from '../types';

// 预定义的学习主题和关键词
const predefinedTopics = {
  'AI基础': [
    '机器学习基础概念',
    '深度学习原理',
    '神经网络架构',
    '强化学习入门'
  ],
  'AI应用': [
    'GPT模型应用',
    'AI助手开发',
    '图像识别实践',
    '自然语言处理'
  ],
  'AI工具': [
    'TensorFlow使用',
    'PyTorch实践',
    'Hugging Face工具',
    'OpenAI API调用'
  ],
  'AI伦理': [
    'AI伦理准则',
    'AI安全性',
    '隐私保护',
    '偏见处理'
  ]
};

// 智能建议生成函数
const generateSuggestions = (recentLearning: RecentLearning[]): LearningSuggestion[] => {
  const suggestions: LearningSuggestion[] = [];
  
  // 基于最近学习记录生成建议
  recentLearning.forEach(record => {
    const relatedTopics = Object.entries(predefinedTopics)
      .find(([category]) => record.content.includes(category))?.[1] || [];
    
    if (relatedTopics.length > 0) {
      const nextTopic = relatedTopics[Math.floor(Math.random() * relatedTopics.length)];
      suggestions.push({
        topic: nextTopic,
        content: `继续学习${nextTopic}的相关内容`,
        category: record.category,
        estimatedDuration: 60,
        difficulty: 3
      });
    }
  });

  return suggestions;
};

interface SmartContentInputProps {
  value: string;
  onChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  recentLearning?: RecentLearning[];
}

const SmartContentInput: React.FC<SmartContentInputProps> = ({
  value,
  onChange,
  onTagsChange,
  recentLearning = []
}) => {
  const [suggestions, setSuggestions] = useState<LearningSuggestion[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 生成建议
  useEffect(() => {
    const newSuggestions = generateSuggestions(recentLearning);
    setSuggestions(newSuggestions);
  }, [recentLearning]);

  // 自动生成标签
  useEffect(() => {
    const newTags = value
      .split(/[,，。；;]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    setTags(newTags);
    onTagsChange(newTags);
  }, [value, onTagsChange]);

  // 应用建议内容
  const applySuggestion = (suggestion: LearningSuggestion) => {
    onChange(suggestion.content);
    setShowSuggestions(false);
  };

  // 快速插入常用主题
  const insertTopic = (topic: string) => {
    onChange(value ? `${value}, ${topic}` : topic);
  };

  return (
    <div className="space-y-4">
      {/* 智能建议按钮 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Brain className="h-5 w-5 mr-2" />
          <span>智能建议</span>
        </button>
        
        {recentLearning && recentLearning.length > 0 && (
          <button
            type="button"
            className="flex items-center text-gray-600 hover:text-gray-700"
            onClick={() => insertTopic(recentLearning[0].content)}
          >
            <History className="h-5 w-5 mr-2" />
            <span>继续上次学习</span>
          </button>
        )}
      </div>

      {/* 智能建议列表 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-xl space-y-2">
          <h4 className="text-sm font-medium text-blue-700 mb-2">建议学习内容：</h4>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              className="w-full text-left p-2 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-800">{suggestion.content}</span>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{suggestion.estimatedDuration}分钟</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 快速主题选择 */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(predefinedTopics).map(([category, topics]) => (
          <div key={category} className="relative group">
            <button
              type="button"
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full"
              onClick={() => insertTopic(category)}
            >
              {category}
            </button>
            <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10">
              <div className="bg-white shadow-lg rounded-lg p-2 min-w-[200px]">
                {topics.map((topic, index) => (
                  <button
                    key={index}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      insertTopic(topic);
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 内容输入区域 */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="今天学习了什么？&#13;&#10;例如：GPT-4的提示工程、机器学习基础原理...&#13;&#10;注：使用逗号、句号或分号分隔的内容会自动生成为标签"
          rows={5}
          className="w-full px-6 py-4 text-2xl border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
        />
      </div>

      {/* 标签显示区域 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartContentInput; 