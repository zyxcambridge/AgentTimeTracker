import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xywvbbljyxmxeqdgmamb.supabase.co';
// Base64 编码的 anon key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5d3ZiYmxqeXhteGVxZGdtYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNTQyMDgsImV4cCI6MjA1ODgzMDIwOH0.JwRqpR54UxRivKLiTm2UJGu_ueHXzgwQM-om0spEW8Q';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface LearningRecord {
  id?: number;
  created_at?: string;
  topic: string;
  duration: number;
  description: string;
  tags: string[];
  complexity: number;
}

export const saveLearningRecord = async (record: Omit<LearningRecord, 'id' | 'created_at'>) => {
  // 先检查最近5秒内是否有相同的记录
  const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
  
  const { data: existingRecords, error: checkError } = await supabase
    .from('learning_records')
    .select('*')
    .eq('description', record.description)
    .eq('duration', record.duration)
    .gt('created_at', fiveSecondsAgo)
    .order('created_at', { ascending: false });

  if (checkError) {
    throw checkError;
  }

  // 如果找到重复记录，返回已存在的记录
  if (existingRecords && existingRecords.length > 0) {
    console.log('Found duplicate record, skipping insert');
    return existingRecords;
  }

  // 如果没有重复记录，则插入新记录
  const { data, error } = await supabase
    .from('learning_records')
    .insert([record])
    .select();

  if (error) {
    throw error;
  }

  return data;
};

export const getLearningRecords = async () => {
  const { data, error } = await supabase
    .from('learning_records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}; 