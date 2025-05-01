import React from 'react';
import { useData } from '../contexts/DataContext';
import { formatTime } from '../utils/helpers';
import { PieChart, Activity, Calendar } from 'lucide-react';

const TimeStatistics: React.FC = () => {
  const { statistics, categories } = useData();

  // 按分类获取颜色
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#9CA3AF';
  };

  // 获取分类名称
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  // 按日期排序
  const sortedDates = Object.keys(statistics.timeByDay).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // 限制显示最近7天
  const recentDates = sortedDates.slice(0, 7);

  // 计算最大时间值（用于柱状图高度）
  const maxDailyTime = Math.max(...Object.values(statistics.timeByDay));
  
  // 排序分类数据（按时间降序）
  const sortedCategories = Object.entries(statistics.timeByCategory)
    .sort(([, timeA], [, timeB]) => timeB - timeA);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          时间统计
        </h2>
      </div>
      
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            按学习领域
          </h3>
          
          <div className="space-y-2">
            {sortedCategories.map(([categoryId, time]) => (
              <div key={categoryId} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: getCategoryColor(categoryId) }}
                />
                <span className="text-sm text-gray-600 flex-1">
                  {getCategoryName(categoryId)}
                </span>
                <span className="text-sm font-medium">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            最近学习记录
          </h3>
          
          <div className="flex items-end h-36 space-x-2">
            {recentDates.map(date => {
              const time = statistics.timeByDay[date];
              const heightPercentage = (time / maxDailyTime) * 100;
              const formattedDate = new Date(date).toLocaleDateString('zh-CN', { 
                month: 'short', 
                day: 'numeric' 
              });
              
              return (
                <div key={date} className="flex flex-col items-center flex-1">
                  <div className="w-full flex justify-center mb-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 ease-in-out"
                      style={{ 
                        height: `${Math.max(heightPercentage, 5)}%`,
                        opacity: 0.6 + (heightPercentage / 200)
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 truncate w-full text-center">
                    {formattedDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeStatistics;