import { supabase } from '../services/supabase';

export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('learning_records')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase 连接测试失败:', error.message);
      return false;
    }
    
    console.log('Supabase 连接测试成功!');
    console.log('环境变量:', {
      url: import.meta.env.VITE_SUPABASE_URL,
      keyLength: import.meta.env.VITE_SUPABASE_KEY?.length || 0
    });
    return true;
  } catch (err) {
    console.error('Supabase 连接测试出错:', err);
    return false;
  }
} 