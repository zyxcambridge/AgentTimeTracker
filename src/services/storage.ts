import { LearningEntry, Category } from '../types';
import { defaultCategories } from '../utils/helpers';

const ENTRIES_KEY = 'agent-learning-entries';
const CATEGORIES_KEY = 'agent-learning-categories';

// 保存学习条目到本地存储
export const saveEntries = (entries: LearningEntry[]): void => {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};

// 从本地存储获取学习条目
export const getEntries = (): LearningEntry[] => {
  const storedEntries = localStorage.getItem(ENTRIES_KEY);
  return storedEntries ? JSON.parse(storedEntries) : [];
};

// 保存分类到本地存储
export const saveCategories = (categories: Category[]): void => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

// 从本地存储获取分类
export const getCategories = (): Category[] => {
  const storedCategories = localStorage.getItem(CATEGORIES_KEY);
  if (!storedCategories) {
    // 如果没有存储的分类，使用默认分类并保存
    saveCategories(defaultCategories);
    return defaultCategories;
  }
  return JSON.parse(storedCategories);
};

// 添加新的学习条目
export const addEntry = (entry: LearningEntry): void => {
  const entries = getEntries();
  entries.push(entry);
  saveEntries(entries);
};

// 删除学习条目
export const deleteEntry = (id: string): void => {
  const entries = getEntries();
  const updatedEntries = entries.filter(entry => entry.id !== id);
  saveEntries(updatedEntries);
};

// 更新学习条目
export const updateEntry = (updatedEntry: LearningEntry): void => {
  const entries = getEntries();
  const index = entries.findIndex(entry => entry.id === updatedEntry.id);
  if (index !== -1) {
    entries[index] = updatedEntry;
    saveEntries(entries);
  }
};

// 添加新分类
export const addCategory = (category: Category): void => {
  const categories = getCategories();
  categories.push(category);
  saveCategories(categories);
};

// 检查是否有初始化数据，如果没有则添加默认分类
export const initializeStorage = (): void => {
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    saveCategories(defaultCategories);
  }
  
  if (!localStorage.getItem(ENTRIES_KEY)) {
    saveEntries([]);
  }
};