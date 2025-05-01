import React from 'react';
import { Brain } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center">
          <Brain className="h-8 w-8 mr-3" />
          <h1 className="text-2xl font-bold">Agent学习统计</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;