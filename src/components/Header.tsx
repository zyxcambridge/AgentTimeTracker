import React from 'react';
import { Brain } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatTime } from '../utils/helpers';

const Header: React.FC = () => {
  const { statistics } = useData();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Brain className="h-8 w-8 mr-3" />
            <h1 className="text-2xl font-bold">Agent学习统计</h1>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center">
            <div className="mr-4">
              <span className="text-xs font-medium uppercase tracking-wider">总学习时间</span>
              <p className="text-xl font-bold">{formatTime(statistics.totalTime)}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;