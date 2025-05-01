import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { formatTime } from '../utils/helpers';
import { List, Search, X, Edit, Trash } from 'lucide-react';

const LearningList: React.FC = () => {
  const { entries, categories, deleteEntry } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // 按日期排序并过滤搜索词
  const filteredEntries = entries
    .filter(entry => 
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categories.find(c => c.id === entry.category)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#9CA3AF';
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <List className="h-5 w-5 mr-2" />
          学习内容列表
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 py-1 pr-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-auto max-h-96">
        {filteredEntries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            没有找到学习记录
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredEntries.map(entry => (
              <li key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="mb-1 flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: getCategoryColor(entry.category) }}
                      />
                      <span className="text-xs font-medium text-gray-500">
                        {getCategoryName(entry.category)}
                      </span>
                    </div>
                    <p className="text-gray-800">{entry.content}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="删除"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <span>{formatDate(entry.date)}</span>
                  <span>{formatTime(entry.duration)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LearningList;