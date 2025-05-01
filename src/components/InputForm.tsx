import React, { useState } from 'react';
import { Clock, Book, Calendar, Tags, BarChart, X, Clock3 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { getTodayDateString } from '../utils/helpers';

const InputForm: React.FC = () => {
  const { addEntry } = useData();
  const [date, setDate] = useState<string>(getTodayDateString());
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [complexity, setComplexity] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      setError('请选择日期');
      return;
    }

    if (!time) {
      setError('请选择时间');
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
    
    try {
      // 将日期和时间组合
      const dateTime = `${date}T${time}:00`;
      await addEntry(dateTime, duration, content, tags, complexity);
      setContent('');
      setDuration(60);
      setTags([]);
      setTagInput('');
      setComplexity(1);
      setError('');
    } catch (error) {
      setError('保存失败，请重试');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
          {/* 日期和时间选择器 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 日期选择器 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
              <label className="block text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-lg"
                required
              />
            </div>

            {/* 时间选择器 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
              <label className="block text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Clock3 className="h-6 w-6 mr-2 text-blue-600" />
                时间
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-lg"
                required
              />
            </div>
          </div>

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
              title="学习时长"
              aria-label="学习时长"
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
              required
            />
          </div>

          {/* 标签输入区域 */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-blue-100">
            <label className="block text-3xl font-bold text-gray-800 mb-8 flex items-center">
              <Tags className="h-10 w-10 mr-4 text-blue-600" />
              标签
            </label>
            <div className="space-y-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="输入标签并按回车添加"
                className="w-full px-6 py-4 text-xl border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-lg"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      title={`删除标签 ${tag}`}
                      aria-label={`删除标签 ${tag}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 复杂度选择器 */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-blue-100">
            <label className="block text-3xl font-bold text-gray-800 mb-8 flex items-center">
              <BarChart className="h-10 w-10 mr-4 text-blue-600" />
              复杂度
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="5"
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value))}
                className="flex-1 h-4 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                title="学习内容复杂度"
                aria-label="学习内容复杂度"
              />
              <span className="text-2xl font-bold text-blue-600">{complexity}</span>
            </div>
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