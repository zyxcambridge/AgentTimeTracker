import React, { useState } from 'react';
import { Clock, Book, Calendar, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { getTodayDateString } from '../utils/helpers';

const InputForm: React.FC = () => {
  const { addEntry } = useData();
  const [date, setDate] = useState<string>(getTodayDateString());
  const [duration, setDuration] = useState<number>(60);
  const [content, setContent] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      setError('请选择日期');
      return;
    }
    
    if (duration <= 0) {
      setError('请输入有效的学习时间');
      return;
    }
    
    if (!content.trim()) {
      setError('请输入学习内容');
      return;
    }
    
    addEntry(date, duration, content);
    setContent('');
    setDuration(60);
    setError('');
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setError('');
    }
  };

  const quickTimeButtons = [30, 60, 90, 120, 180, 240];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
      <div className="p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 超大型时间输入区域 */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-8">
              <label className="text-3xl font-bold text-gray-800 flex items-center">
                <Clock className="h-10 w-10 mr-4 text-blue-600" />
                学习时间
              </label>
              <span className="text-5xl font-bold text-blue-600">{duration}分钟</span>
            </div>
            
            <input
              type="range"
              min="5"
              max="240"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-4 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-8"
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickTimeButtons.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setDuration(time)}
                  className="py-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-medium transition-colors text-xl"
                >
                  {time}分钟
                </button>
              ))}
            </div>
          </div>
          
          {/* 超大型内容输入区域 */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-blue-100">
            <label className="block text-3xl font-bold text-gray-800 mb-8 flex items-center">
              <Book className="h-10 w-10 mr-4 text-blue-600" />
              学习内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今天学习了什么？&#13;&#10;例如：GPT-4的提示工程、机器学习基础原理..."
              rows={5}
              className="w-full px-6 py-4 text-2xl border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          
          {/* 简化的日期选择器 */}
          <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-sm border border-blue-100">
            <Calendar className="h-8 w-8 text-blue-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-xl"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl text-lg">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-xl transition-colors duration-300 text-2xl shadow-lg"
          >
            保存学习记录
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputForm;