import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LearningEntry, Category, TimeStatistics, MindMapNode } from '../types';
import { 
  getEntries, 
  getCategories, 
  saveEntries, 
  saveCategories, 
  initializeStorage 
} from '../services/storage';
import { 
  categorizeContent, 
  calculateStatistics, 
  generateMindMapData, 
  generateId 
} from '../utils/helpers';
import { saveLearningRecord, getLearningRecords, LearningRecord } from '../services/supabase';

interface DataContextType {
  entries: LearningEntry[];
  categories: Category[];
  statistics: TimeStatistics;
  mindMapData: MindMapNode;
  addEntry: (date: string, duration: number, content: string, tags?: string[], complexity?: number) => Promise<void>;
  deleteEntry: (id: string) => void;
  updateEntry: (entry: LearningEntry) => void;
  addCategory: (name: string, color: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statistics, setStatistics] = useState<TimeStatistics>({
    totalTime: 0,
    timeByCategory: {},
    timeByDay: {}
  });
  const [mindMapData, setMindMapData] = useState<MindMapNode>({
    id: 'root',
    label: 'Agent学习',
    value: 0,
    children: []
  });

  // 初始化数据
  useEffect(() => {
    initializeStorage();
    loadData();
  }, []);

  // 当数据变化时更新统计和思维导图
  useEffect(() => {
    if (entries.length > 0) {
      const newStats = calculateStatistics(entries);
      setStatistics(newStats);
      
      const newMindMapData = generateMindMapData(entries, categories);
      setMindMapData(newMindMapData);
    }
  }, [entries, categories]);

  // 从本地存储和 Supabase 加载数据
  const loadData = async () => {
    const storedEntries = getEntries();
    const storedCategories = getCategories();
    
    try {
      const supabaseRecords = await getLearningRecords();
      const supabaseEntries = supabaseRecords.map(record => ({
        id: record.id?.toString() || generateId(),
        date: new Date(record.created_at || '').toISOString(),
        duration: record.duration,
        content: record.description,
        category: categorizeContent(record.description, storedCategories),
        tags: record.tags,
        complexity: record.complexity
      }));

      setEntries([...storedEntries, ...supabaseEntries]);
    } catch (error) {
      console.error('Failed to load data from Supabase:', error);
      setEntries(storedEntries);
    }
    
    setCategories(storedCategories);
  };

  // 添加新条目
  const addEntry = async (date: string, duration: number, content: string, tags: string[] = [], complexity: number = 1) => {
    const categoryId = categorizeContent(content, categories);
    
    const newEntry: LearningEntry = {
      id: generateId(),
      date,
      duration,
      content,
      category: categoryId,
      tags,
      complexity
    };
    
    try {
      // 保存到 Supabase
      await saveLearningRecord({
        topic: content,
        duration,
        description: content,
        tags,
        complexity
      });

      // 保存到本地
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      saveEntries(updatedEntries);
    } catch (error) {
      console.error('Failed to save entry to Supabase:', error);
      // 即使 Supabase 保存失败，仍然保存到本地
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      saveEntries(updatedEntries);
    }
  };

  // 删除条目
  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    saveEntries(updatedEntries);
  };

  // 更新条目
  const updateEntry = (updatedEntry: LearningEntry) => {
    const updatedEntries = entries.map(entry =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setEntries(updatedEntries);
    saveEntries(updatedEntries);
  };

  // 添加新分类
  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: generateId(),
      name,
      color
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
  };

  return (
    <DataContext.Provider value={{
      entries,
      categories,
      statistics,
      mindMapData,
      addEntry,
      deleteEntry,
      updateEntry,
      addCategory
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};