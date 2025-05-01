# Agent Time Tracker

一个简单而强大的学习时间追踪工具。

## 特性

- 📝 记录学习内容和时间
- ⏱️ 灵活的时间选择
- 🏷️ 自动标签生成
- 📊 学习数据统计
- 🌐 在线同步（Supabase）
- 📱 响应式设计

## 在线访问

访问地址：[Agent Time Tracker](https://zyxcambridge.github.io/AgentTimeTracker/)

![部署状态](https://github.com/zyxcambridge/AgentTimeTracker/actions/workflows/deploy.yml/badge.svg)

# Agent 学习时间追踪系统配置指南

这是一个用于追踪和记录学习时间的应用程序，使用 Supabase 作为后端数据存储。

## 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com/) 并登录
2. 点击 "New Project" 创建新项目
3. 填写项目详情：
   - 组织（Organization）：选择或创建一个组织
   - 项目名称：例如 "agent-time-tracker"
   - 数据库密码：设置一个安全的密码
   - 区域：选择离您最近的区域
4. 等待项目创建完成

## 步骤 2: 创建学习记录表

### 使用 SQL 编辑器创建表

1. 在 Supabase 控制台中，导航到 "SQL Editor"
2. 创建 `learning_records` 表：

```sql
-- 第一步：创建基础表
create table learning_records (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  topic text not null,
  duration integer not null,
  description text not null,
  tags text[] default '{}',
  complexity integer default 1,
  
  constraint complexity_range check (complexity between 1 and 5)
);

-- 第二步：创建时间戳索引
create index learning_records_created_at_idx on learning_records (created_at desc);

-- 第三步：添加全文搜索支持
-- 使用 simple 配置，支持基本的分词
alter table learning_records add column search tsvector 
  generated always as (
    setweight(to_tsvector('simple', coalesce(topic, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) stored;

-- 创建全文搜索索引
create index learning_records_search_idx on learning_records using gin(search);

-- 创建一个搜索函数
create or replace function search_learning_records(search_query text)
returns setof learning_records as $$
  select *
  from learning_records
  where search @@ plainto_tsquery('simple', search_query)
  order by ts_rank(search, plainto_tsquery('simple', search_query)) desc;
$$ language sql stable;

tmp
```

## 步骤 3: 配置 RLS (Row Level Security) 策略

### 3.1 启用 RLS

1. 在 Supabase 控制台中，导航到 "Authentication" > "Policies"
2. 找到 `learning_records` 表
3. 点击 "Enable RLS" 按钮启用行级安全策略
4. 执行以下 SQL 语句来启用 RLS：

```sql
alter table learning_records enable row level security;
```

### 3.2 创建访问策略

在 SQL 编辑器中执行以下策略配置：

```sql
-- 策略 1: 允许匿名读取
-- 说明：允许所有用户（包括未登录用户）查看所有学习记录
create policy "允许匿名读取学习记录"
on learning_records 
for select
to anon
using (true);

-- 策略 2: 允许匿名插入
-- 说明：允许所有用户（包括未登录用户）添加新的学习记录
create policy "允许匿名插入学习记录"
on learning_records 
for insert
to anon
with check (true);

-- 策略 3: 允许按时间范围查询
-- 说明：优化常见的时间范围查询场景
create policy "允许按时间范围查询学习记录"
on learning_records
for select
to anon
using (
  created_at >= now() - interval '1 year'
);

-- 策略 4: 防止数据篡改
-- 说明：禁止更新和删除操作，确保数据完整性
create policy "禁止更新学习记录"
on learning_records
for update
to anon
using (false);

create policy "禁止删除学习记录"
on learning_records
for delete
to anon
using (false);
```

### 3.3 验证策略配置

执行以下查询来验证策略是否正确配置：

```sql
-- 查看表的 RLS 状态
select relname, relrowsecurity 
from pg_class 
where relname = 'learning_records';

-- 查看所有已配置的策略
select *
from pg_policies
where tablename = 'learning_records';
```

### 3.4 策略说明

1. **读取策略**
   - 允许所有用户查看学习记录
   - 包括匿名用户和已认证用户
   - 无数据过滤条件（using (true)）

2. **插入策略**
   - 允许所有用户添加新记录
   - 不限制插入的数据内容
   - 依赖表级约束确保数据质量

3. **时间范围策略**
   - 优化性能，只返回最近一年的记录
   - 可以根据需要调整时间范围
   - 与基本读取策略配合使用

4. **保护策略**
   - 禁止更新操作，保持历史记录完整性
   - 禁止删除操作，防止数据丢失
   - 确保数据只能添加，不能修改或删除

### 3.5 安全性考虑

1. **数据完整性**
   - 所有插入的数据必须符合表的约束条件
   - complexity 必须在 1-5 之间
   - 必填字段不能为空

2. **性能优化**
   - 使用时间范围策略减少数据加载量
   - 全文搜索索引加速内容查询
   - 创建时间索引优化时间序列查询

3. **访问控制**
   - 采用白名单方式配置权限
   - 明确禁止危险操作（更新/删除）
   - 保留未来添加认证的可能性

### 3.6 测试策略

在应用中测试以下操作以验证策略是否生效：

```typescript
// 测试插入（应该成功）
const { data, error } = await supabase
  .from('learning_records')
  .insert({
    topic: '测试主题',
    duration: 30,
    description: '测试描述',
    tags: ['测试'],
    complexity: 1
  });

// 测试更新（应该失败）
const { data, error } = await supabase
  .from('learning_records')
  .update({ topic: '新主题' })
  .eq('id', 1);

// 测试删除（应该失败）
const { data, error } = await supabase
  .from('learning_records')
  .delete()
  .eq('id', 1);
```

## 步骤 4: 配置环境变量

### 4.1 获取 API 凭证

1. 登录 Supabase 控制台：https://supabase.com/dashboard
2. 选择您的项目
3. 在左侧菜单栏中点击 "Project Settings"（项目设置）
4. 在左侧子菜单中点击 "API"
5. 在 "Project API keys" 部分，您会看到两个密钥：
   - `anon` `public`: 用于客户端访问的公共密钥
   - `service_role`: 具有管理权限的密钥（请勿在客户端使用！）

### 4.2 配置环境变量

1. 在项目根目录创建 `.env` 文件：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
VITE_SUPABASE_KEY=[YOUR-ANON-KEY]

# 注意：
# - 将 [YOUR-PROJECT-ID] 替换为您的项目 ID（在 API URL 中找到）
# - 将 [YOUR-ANON-KEY] 替换为 anon/public 密钥
# - 不要使用 service_role 密钥！
```

### 4.3 安全注意事项

1. **密钥管理**
   - 永远不要提交 `.env` 文件到版本控制系统
   - 确保 `.env` 已添加到 `.gitignore`
   - 不要在客户端代码中硬编码密钥

2. **使用正确的密钥**
   - 客户端应用只使用 `anon/public` 密钥
   - `service_role` 密钥仅用于服务器端或管理任务
   - 定期轮换密钥以提高安全性

3. **环境隔离**
   - 开发环境使用单独的项目和密钥
   - 生产环境使用单独的项目和密钥
   - 不同环境的密钥不要混用

### 4.4 验证配置

创建一个测试文件来验证环境变量是否正确配置：

```typescript
// src/utils/supabase-test.ts
import { supabase } from '../services/supabase';

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('learning_records')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('连接测试失败:', error.message);
      return false;
    }
    
    console.log('连接测试成功!');
    return true;
  } catch (err) {
    console.error('连接测试出错:', err);
    return false;
  }
}

export { testConnection };
```

在开发过程中可以调用这个函数来验证配置是否正确：

```typescript
import { testConnection } from './utils/supabase-test';

// 在应用启动时测试连接
testConnection().then(isConnected => {
  if (isConnected) {
    console.log('Supabase 配置正确');
  } else {
    console.error('Supabase 配置错误，请检查环境变量');
  }
});
```

## 步骤 5: 本地开发设置

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

## 数据模型

### 学习记录 (LearningRecord)

| 字段 | 类型 | 描述 |
|------|------|------|
| id | bigint | 主键，自动生成 |
| created_at | timestamp | 创建时间，自动生成 |
| topic | text | 学习主题 |
| duration | integer | 学习时长（分钟） |
| description | text | 详细描述 |
| tags | text[] | 标签数组 |
| complexity | integer | 复杂度 (1-5) |

## 故障排除

### 数据无法保存到 Supabase

1. 检查环境变量是否正确配置
2. 验证 RLS 策略是否正确设置
3. 查看浏览器控制台是否有错误信息
4. 确认网络连接是否正常

### 数据加载失败

1. 确认 Supabase 项目是否在线
2. 检查 API 密钥是否有效
3. 验证数据表结构是否正确

## 其他资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [Vite 环境变量指南](https://vitejs.dev/guide/env-and-mode.html)