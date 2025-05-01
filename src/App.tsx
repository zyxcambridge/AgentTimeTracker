import React, { useEffect } from 'react';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Header';
import InputForm from './components/InputForm';
import TimeStatistics from './components/TimeStatistics';
import LearningList from './components/LearningList';
import MindMap from './components/MindMap';
import { testConnection } from './utils/supabase-test';

function App() {
  useEffect(() => {
    // 测试 Supabase 连接
    testConnection().then(isConnected => {
      if (isConnected) {
        console.log('✅ Supabase 配置正确');
      } else {
        console.error('❌ Supabase 配置错误，请检查环境变量');
      }
    });
  }, []);

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-6">
          {/* 主要输入区域 */}
          <div className="mb-8">
            <InputForm />
          </div>
          
          {/* 辅助信息区域 - 使用较小的尺寸 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <TimeStatistics />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-[300px]">
                <MindMap />
              </div>
              <LearningList />
            </div>
          </div>
        </main>
        
        <footer className="bg-white py-3 text-center text-gray-500 text-xs">
          <p>Agent学习时间统计 © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </DataProvider>
  );
}

export default App;