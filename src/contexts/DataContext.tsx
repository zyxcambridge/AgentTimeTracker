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
  // 添加防重复提交的状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

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
    try {
      // 优先从 Supabase 加载数据
      const supabaseRecords = await getLearningRecords();
      const supabaseEntries = supabaseRecords.map(record => ({
        id: record.id?.toString() || generateId(),
        date: new Date(record.created_at || '').toISOString(),
        duration: record.duration,
        content: record.description,
        category: categorizeContent(record.description, categories),
        tags: record.tags,
        complexity: record.complexity
      }));

      // 使用 Supabase 数据更新本地存储
      setEntries(supabaseEntries);
      saveEntries(supabaseEntries);
    } catch (error) {
      console.error('Failed to load data from Supabase:', error);
      // 如果 Supabase 加载失败，使用本地存储的数据
      const storedEntries = getEntries();
      setEntries(storedEntries);
    }
    
    const storedCategories = getCategories();
    setCategories(storedCategories);
  };

  // 添加新条目
  const addEntry = async (date: string, duration: number, content: string, tags: string[] = [], complexity: number = 1) => {
    // 防重复提交检查
    const now = Date.now();
    if (isSubmitting) {
      console.log('请勿重复提交');
      return;
    }
    
    // 检查是否在短时间内重复提交（3秒内）
    if (now - lastSubmitTime < 3000) {
      console.log('提交过于频繁，请稍后再试');
      return;
    }

    setIsSubmitting(true);
    setLastSubmitTime(now);

    const categoryId = categorizeContent(content, categories);
    
    try {
      // 检查最近的记录是否重复
      const recentEntries = entries.slice(-5);
      const isDuplicate = recentEntries.some(entry => 
        entry.content === content &&
        entry.duration === duration &&
        Date.now() - new Date(entry.date).getTime() < 5000 // 5秒内的记录
      );

      if (isDuplicate) {
        console.log('检测到重复记录，已忽略');
        setIsSubmitting(false);
        return;
      }

      // 先保存到 Supabase，获取服务器生成的 ID
      const savedRecord = await saveLearningRecord({
        topic: content,
        duration,
        description: content,
        tags,
        complexity
      });

      if (!savedRecord || !savedRecord.id) {
        throw new Error('Failed to get ID from Supabase');
      }

      // 使用 Supabase 返回的 ID 创建新条目
      const newEntry: LearningEntry = {
        id: savedRecord.id.toString(),
        date,
        duration,
        content,
        category: categoryId,
        tags,
        complexity
      };

      // 保存到本地
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      saveEntries(updatedEntries);
    } catch (error) {
      console.error('Failed to save entry:', error);
      // 如果 Supabase 保存失败，使用本地生成的 ID
      const newEntry: LearningEntry = {
        id: generateId(),
        date,
        duration,
        content,
        category: categoryId,
        tags,
        complexity
      };
      
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      saveEntries(updatedEntries);
    } finally {
      setIsSubmitting(false);
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