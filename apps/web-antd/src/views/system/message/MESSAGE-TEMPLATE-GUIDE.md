# 消息模块模板功能使用指南

## 功能概述

完善后的消息模块支持以下功能：

1. **模板自动填充** - 选择消息模板时自动填充标题和内容
2. **变量管理** - 根据不同模板类型自动识别和管理变量
3. **变量替换** - 支持将变量值替换到消息内容中
4. **灵活配置** - 支持预定义变量和自定义变量

## 架构设计

### 1. API 层 (`message-template.ts`)

#### 新增类型定义

```typescript
// 模板变量接口
interface TemplateVariable {
  key: string;           // 变量键名，如 'newPassword'
  name: string;          // 显示名称，如 '新密码'
  type: string;          // 变量类型，如 'string'
  description?: string;  // 变量描述
}

// 预定义变量映射
TEMPLATE_VARIABLES_MAP: Record<string, TemplateVariable[]>
```

#### 预定义模板类型

系统内置了以下常用模板类型：

##### 1. 密码重置 (`password-reset`)
```json
{
  "newPassword": "新密码",
  "resetLink": "重置链接",
  "expiryTime": "过期时间"
}
```

##### 2. 账户创建 (`account-create`)
```json
{
  "username": "用户名",
  "password": "初始密码",
  "loginUrl": "系统登录地址"
}
```

##### 3. 账户锁定 (`account-lock`)
```json
{
  "reason": "锁定原因",
  "contactAdmin": "管理员联系方式"
}
```

##### 4. 订单通知 (`order-notify`)
```json
{
  "orderNo": "订单编号",
  "orderAmount": "订单金额",
  "orderTime": "下单时间",
  "deliveryTime": "预计送达时间"
}
```

##### 5. 告警通知 (`alert-notify`)
```json
{
  "alertType": "告警类型名称",
  "alertLevel": "严重程度（高/中/低）",
  "alertTime": "告警发生时间",
  "alertContent": "具体告警信息"
}
```

#### 核心函数

```typescript
/**
 * 解析模板变量
 * 优先级：预定义变量 > JSON 格式变量字符串
 */
export function parseTemplateVariables(
  templateCode: string,
  variables?: string,
): MessageTemplateApi.TemplateVariable[]

/**
 * 获取模板的变量列表
 */
export function getTemplateVariablesList(
  template: MessageTemplateApi.MessageTemplateVO,
): MessageTemplateApi.TemplateVariable[]
```

### 2. 组件层 (`MessageSendModal.vue`)

#### 核心功能

##### 状态管理
```typescript
// 当前选中的模板
const selectedTemplate = ref<TemplateOption | null>(null)

// 解析出的模板变量列表
const templateVariables = ref<TemplateVariable[]>([])

// 变量值存储
const variablesValues = ref<Record<string, string>>({})

// 是否显示变量面板
const showVariablesPanel = computed(() => {
  return selectedTemplate.value && templateVariables.value.length > 0
})
```

##### 关键方法

1. **变量替换函数**
```typescript
function replaceVariables(
  content: string,
  variables: Record<string, string>
): string
```
支持两种变量格式：`${key}` 或 `{key}`

2. **应用变量到内容**
```typescript
function applyVariablesToContent(): void
```
将填充的变量值替换到消息内容中

3. **重置模板内容**
```typescript
function resetTemplateContent(): void
```
恢复原始模板内容（移除变量替换）

#### UI 布局

##### 表单部分
- 消息模板选择（触发变量加载）
- 消息标题
- 消息内容（包含原始模板内容）
- 消息类型
- 接收人类型
- 接收用户/角色选择

##### 变量填充面板
显示条件：选中的模板包含变量时

面板内容：
- 标题：显示"📝 模板变量填充"
- 变量输入字段：为每个变量显示一个输入框
  - 标签：显示变量名称和描述
  - 输入框：输入变量值
- 操作按钮：
  - "应用变量"：替换到内容
  - "重置内容"：恢复原始模板

## 使用流程

### 基础使用流程

1. **打开发送消息对话框**
   - 点击"发送消息"按钮

2. **选择消息模板**
   - 从"消息模板"下拉列表中选择模板
   - 自动填充标题和内容
   - 如果模板包含变量，自动显示变量填充面板

3. **填充变量值**（如果模板包含变量）
   - 在变量填充面板中输入各个变量的值
   - 鼠标悬停可查看变量描述

4. **应用变量到内容**
   - 点击"应用变量"按钮
   - 变量值被替换到消息内容中

5. **设置接收人**
   - 选择消息类型（系统通知/业务消息/预警消息）
   - 选择接收人类型（指定用户/指定角色/全体用户）
   - 选择具体的用户或角色

6. **发送消息**
   - 点击"确定"按钮发送消息

### 高级用法

#### 自定义变量替换

在消息内容中使用变量占位符：

```
尊敬的用户：

您的账户已被创建，登录信息如下：
用户名：${username}
初始密码：${password}

请访问 ${loginUrl} 进行登录

祝您使用愉快！
```

#### 扩展模板类型

在 API 中添加新的模板类型：

```typescript
// 添加到 TEMPLATE_VARIABLES_MAP
'custom-template': [
  { key: 'var1', name: '变量1', type: 'string', description: '描述信息' },
  { key: 'var2', name: '变量2', type: 'string', description: '描述信息' },
]
```

#### 动态变量定义

如果变量来自动态配置，使用 JSON 格式存储在模板的 `variables` 字段：

```json
[
  {
    "key": "dynamicVar1",
    "name": "动态变量1",
    "type": "string",
    "description": "这是一个动态变量"
  }
]
```

## 数据流

```
选择模板
    ↓
解析模板编码和变量字符串
    ↓
从 TEMPLATE_VARIABLES_MAP 查找 or 解析 JSON 变量
    ↓
显示变量填充面板
    ↓
用户填充变量值
    ↓
点击"应用变量"按钮
    ↓
replaceVariables() 函数替换变量
    ↓
更新消息内容
    ↓
发送消息时包含变量信息
```

## 发送数据格式

```typescript
{
  title: string;              // 消息标题
  content: string;            // 消息内容（可能包含已替换的变量值）
  messageType: number;        // 消息类型
  receiverType: number;       // 接收人类型
  receiverIds?: number[];     // 接收用户ID列表
  receiverRoleIds?: number[]; // 接收角色ID列表
  variables?: Record<string, string>;  // 变量值（可选）
}
```

## 示例场景

### 场景1：密码重置通知

1. 选择模板："密码重置通知"
2. 变量面板显示：
   - 新密码 (必填)
   - 重置链接 (必填)
   - 过期时间 (必填)
3. 填充值：
   - 新密码：`Abc@1234`
   - 重置链接：`https://system.com/reset?token=xxx`
   - 过期时间：`2小时`
4. 点击"应用变量"，消息内容从：
   ```
   您的密码已重置，新密码为：${newPassword}
   重置链接：${resetLink}
   链接有效期：${expiryTime}
   ```
   变为：
   ```
   您的密码已重置，新密码为：Abc@1234
   重置链接：https://system.com/reset?token=xxx
   链接有效期：2小时
   ```

### 场景2：订单通知

1. 选择模板："订单通知"
2. 变量面板显示：
   - 订单号
   - 订单金额
   - 下单时间
   - 预计送达
3. 填充值：
   - 订单号：`ORD202501180001`
   - 订单金额：`¥199.99`
   - 下单时间：`2025-01-18 14:30`
   - 预计送达：`2025-01-20`
4. 应用变量后发送给相关用户

## 后端集成建议

### 1. 模板管理接口

确保模板表包含以下字段：
- `templateCode`: 模板编码（用于匹配预定义变量）
- `templateName`: 模板名称
- `title`: 标题模板
- `content`: 内容模板（包含变量占位符）
- `variables`: JSON 格式的变量定义（可选，优先级低于预定义）
- `status`: 状态（1=启用，0=禁用）

### 2. 消息发送接口

接收消息时可以：
- 存储原始 variables 信息用于审计
- 在存储消息时保存已替换后的 content
- 在显示消息时，如果包含变量则自动替换

### 3. 数据库设计

```sql
-- 消息模板表
CREATE TABLE message_template (
  id BIGINT PRIMARY KEY,
  template_code VARCHAR(100) UNIQUE,  -- 模板编码
  template_name VARCHAR(255),
  title VARCHAR(255),
  content LONGTEXT,                   -- 包含变量占位符
  message_type INT,
  variables JSON,                     -- 变量定义
  version INT DEFAULT 1,
  status INT DEFAULT 1,
  remark TEXT,
  create_time TIMESTAMP,
  update_time TIMESTAMP
);
```

## 扩展建议

### 1. 模板预览功能
- 在模板管理页面添加预览按钮
- 显示模板变量列表和示例

### 2. 变量验证
- 添加变量格式验证（邮箱、URL、日期等）
- 标记必填变量

### 3. 模板版本管理
- 支持模板历史版本查看
- 支持版本回滚

### 4. 变量库管理
- 创建变量库功能
- 支持变量复用

### 5. 模板测试
- 支持发送测试消息
- 自动填充示例值

### 6. 批量发送优化
- 支持批量变量导入（CSV/Excel）
- 自动生成多条消息

## 常见问题

**Q: 如何添加新的模板类型？**  
A: 在 `message-template.ts` 中的 `TEMPLATE_VARIABLES_MAP` 对象中添加新的模板编码和变量定义。

**Q: 变量支持哪些格式？**  
A: 支持两种格式：`${variableName}` 和 `{variableName}`

**Q: 如果不想替换变量怎么办？**  
A: 点击"重置内容"按钮恢复原始模板内容，或者直接修改消息内容。

**Q: 变量值可以为空吗？**  
A: 可以，系统不强制要求填充所有变量。

**Q: 支持变量嵌套吗？**  
A: 暂不支持嵌套变量，但可以通过预处理实现。

## 文件清单

- `src/api/sys/message-template.ts` - API 层，包含变量管理函数
- `src/views/system/message/components/MessageSendModal.vue` - 发送模态框组件
- `src/views/system/message/index.vue` - 消息列表页面
- `src/api/sys/message.ts` - 消息 API

## 相关技术

- Vue 3 Composition API
- TypeScript
- Ant Design Vue
- Vben 表单框架

---

**最后更新**: 2025-01-18  
**维护者**: 开发团队
