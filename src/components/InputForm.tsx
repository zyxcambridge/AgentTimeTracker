import React, { useState } from 'react';
import { Clock, Book, Calendar } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { getTodayDateString } from '../utils/helpers';

const InputForm: React.FC = () => {
  const { addEntry, statistics } = useData();
  const [date, setDate] = useState<string>(getTodayDateString());
  const [duration, setDuration] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 添加进度条值映射函数
  const mapSliderToTime = (sliderValue: number): number => {
    // 将0-100的滑块值映射到实际时间
    if (sliderValue <= 20) {
      // 前20%的滑动范围映射到10-60分钟
      return Math.round(10 + (sliderValue / 20) * 50);
    } else {
      // 剩余80%的滑动范围映射到60-480分钟
      return Math.round(60 + ((sliderValue - 20) / 80) * 420);
    }
  };

  // 添加时间映射到滑块值的函数
  const mapTimeToSlider = (timeValue: number): number => {
    if (timeValue <= 60) {
      // 10-60分钟映射到0-20的滑块值
      return Math.round(((timeValue - 10) / 50) * 20);
    } else {
      // 60-480分钟映射到20-100的滑块值
      return Math.round(20 + ((timeValue - 60) / 420) * 80);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = Number(e.target.value);
    const mappedTime = mapSliderToTime(sliderValue);
    setDuration(mappedTime);
  };

  // 添加触摸事件处理器
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    e.preventDefault(); // 阻止默认的滚动行为
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      setError('请选择日期');
      return;
    }
    
    if (duration <= 0) {
      setError('请选择学习时间');
      return;
    }
    
    if (!content.trim()) {
      setError('请输入学习内容');
      return;
    }
    
    try {
      // 使用当前时间作为记录时间
      const now = new Date();
      const dateTime = now.toISOString();
      // 自动生成标签和难度
      const tags = content.split(/[,，。；;]/).map(tag => tag.trim()).filter(Boolean);
      const complexity = Math.min(Math.ceil(content.length / 100), 5); // 根据内容长度自动计算难度，最高5
      await addEntry(dateTime, duration, content, tags, complexity);
      setContent('');
      setDuration(0); // 重置为未选择状态
      setError('');
    } catch {
      setError('保存失败，请重试');
    }
  };

  const quickTimeButtons = [30, 60, 120, 180, 240, 360, 480];

  // 将分钟转换为小时和分钟
  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return {
      hours,
      minutes: mins
    };
  };

  const totalTime = formatTotalTime(statistics.totalTime);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
      {/* 总学习时间显示 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12 flex flex-col items-center justify-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">总学习时间</h2>
        <div className="flex items-baseline space-x-2">
          <span className="text-5xl md:text-7xl font-bold text-white">
            {totalTime.hours}
          </span>
          <span className="text-2xl md:text-3xl font-medium text-blue-100">小时</span>
          <span className="text-5xl md:text-7xl font-bold text-white ml-2">
            {totalTime.minutes}
          </span>
          <span className="text-2xl md:text-3xl font-medium text-blue-100">分钟</span>
        </div>
      </div>

      <div className="p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
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
              title="选择日期"
            />
          </div>

          {/* 超大型时间输入区域 */}
          <div className={`bg-white p-8 md:p-10 rounded-2xl shadow-sm border ${duration <= 0 ? 'border-red-300' : 'border-blue-100'}`}>
            <div className="flex items-center justify-between mb-8">
              <label className="text-3xl font-bold text-gray-800 flex items-center">
                <Clock className="h-10 w-10 mr-4 text-blue-600" />
                学习时间
              </label>
              <span className={`text-5xl font-bold ${duration <= 0 ? 'text-red-500' : 'text-blue-600'}`}>
                {duration}分钟
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={mapTimeToSlider(duration)}
              onChange={handleSliderChange}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              className={`w-full h-10 rounded-2xl appearance-none cursor-pointer mb-8 touch-none ${
                duration <= 0 ? 'bg-red-200' : 'bg-blue-200'
              }`}
              style={{
                background: duration <= 0 ? '#FEE2E2' : '#BFDBFE',
                backgroundImage: `linear-gradient(to right, ${duration <= 0 ? '#DC2626' : '#2563EB'} 0%, ${duration <= 0 ? '#DC2626' : '#2563EB'} ${mapTimeToSlider(duration)}%, ${duration <= 0 ? '#FEE2E2' : '#BFDBFE'} ${mapTimeToSlider(duration)}%)`,
                height: '2.5rem',
                borderRadius: '1rem',
                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                border: `3px solid ${duration <= 0 ? '#DC2626' : '#2563EB'}`,
                WebkitTapHighlightColor: 'transparent', // 移除移动端点击高亮
                WebkitTouchCallout: 'none', // 禁用长按菜单
                WebkitUserSelect: 'none', // 禁用文本选择
                userSelect: 'none' // 禁用文本选择
              }}
              title="选择学习时长"
              aria-label="学习时长"
              required
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickTimeButtons.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setDuration(time)}
                  className={`py-4 rounded-xl font-medium transition-colors text-xl ${
                    duration === time 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700'
                  }`}
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
              placeholder="今天学习了什么？&#13;&#10;例如：GPT-4的提示工程、机器学习基础原理...&#13;&#10;注：使用逗号、句号或分号分隔的内容会自动生成为标签"
              rows={5}
              className="w-full px-6 py-4 text-2xl border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-6 rounded-xl text-2xl font-bold transition-colors ${
              duration <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={duration <= 0}
          >
            保存学习记录
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputForm;