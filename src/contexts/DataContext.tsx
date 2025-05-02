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
import { supabase } from '../services/supabase';

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

  // 检查是否是重复提交
  const checkDuplicate = (content: string, duration: number) => {
    try {
      const lastSubmission = localStorage.getItem('lastSubmission');
      if (lastSubmission) {
        const { content: lastContent, duration: lastDuration, timestamp } = JSON.parse(lastSubmission);
        const now = Date.now();
        
        // 如果5秒内有相同内容和时长的提交，认为是重复提交
        if (lastContent === content && 
            lastDuration === duration && 
            now - timestamp < 5000) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }
  };

  // 记录最后一次提交
  const recordSubmission = (content: string, duration: number) => {
    try {
      localStorage.setItem('lastSubmission', JSON.stringify({
        content,
        duration,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error recording submission:', error);
    }
  };

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

  // 从 Supabase 加载数据
  const loadData = async () => {
    const storedCategories = getCategories();
    setCategories(storedCategories);
    
    try {
      const supabaseRecords = await getLearningRecords();
      const entries = supabaseRecords.map(record => ({
        id: record.id?.toString() || generateId(),
        date: new Date(record.created_at || '').toISOString(),
        duration: record.duration,
        content: record.description,
        category: categorizeContent(record.description, storedCategories),
        tags: record.tags,
        complexity: record.complexity
      }));

      // 只使用 Supabase 的数据
      setEntries(entries);
      // 不再保存到本地存储
      // saveEntries(entries);
    } catch (error) {
      console.error('Failed to load data from Supabase:', error);
      setEntries([]);
    }
  };

  // 添加新条目
  const addEntry = async (date: string, duration: number, content: string, tags: string[] = [], complexity: number = 1) => {
    if (isSubmitting) {
      console.log('请勿重复提交');
      return;
    }

    // 检查是否是重复提交
    if (checkDuplicate(content, duration)) {
      console.log('检测到重复提交，已忽略');
      return;
    }

    setIsSubmitting(true);
    const categoryId = categorizeContent(content, categories);
    
    try {
      // 记录本次提交
      recordSubmission(content, duration);

      // 保存到 Supabase
      const savedRecord = await saveLearningRecord({
        topic: content,
        duration,
        description: content,
        tags,
        complexity
      });

      if (!savedRecord || !savedRecord[0]?.id) {
        throw new Error('Failed to get ID from Supabase');
      }

      // 使用 Supabase 返回的记录创建新条目
      const newEntry: LearningEntry = {
        id: savedRecord[0].id.toString(),
        date,
        duration,
        content,
        category: categoryId,
        tags,
        complexity
      };

      // 只更新状态，不保存到本地存储
      setEntries(prevEntries => [...prevEntries, newEntry]);
    } catch (error) {
      console.error('Failed to save entry:', error);
      // 如果保存失败，显示错误提示
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除条目
  const deleteEntry = async (id: string) => {
    try {
      // 从 Supabase 删除
      const { error } = await supabase
        .from('learning_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 更新状态
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('删除失败，请重试');
    }
  };

  // 更新条目
  const updateEntry = async (updatedEntry: LearningEntry) => {
    try {
      // 更新 Supabase
      const { error } = await supabase
        .from('learning_records')
        .update({
          topic: updatedEntry.content,
          duration: updatedEntry.duration,
          description: updatedEntry.content,
          tags: updatedEntry.tags,
          complexity: updatedEntry.complexity
        })
        .eq('id', updatedEntry.id);

      if (error) throw error;

      // 更新状态
      setEntries(prevEntries => 
        prevEntries.map(entry =>
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('更新失败，请重试');
    }
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