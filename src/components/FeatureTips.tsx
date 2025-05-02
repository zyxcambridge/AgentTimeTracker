import React from 'react';
import { Lightbulb, Mic, Brain } from 'lucide-react';

const FeatureTips: React.FC = () => {
  const tips = [
    {
      icon: <Mic className="w-6 h-6 text-blue-500" />,
      title: '语音视频实时监测',
      description: '通过语音和视频输入，实时判断用户正在进行的Agent相关学习内容',
      status: '开发中'
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-500" />,
      title: '学习深度评估',
      description: '通过Agent对话评估，判断知识掌握程度和理解深度',
      status: '规划中'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">即将推出的功能</h2>
      </div>
      
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div 
            key={index} 
            className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">{tip.icon}</div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">{tip.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {tip.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureTips; 