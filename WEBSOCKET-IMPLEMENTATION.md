# WebSocket 实时消息推送实现文档

## 📋 概述

本文档记录了站内消息模块的 WebSocket 实时推送功能实现，包括前端客户端、消息通知管理和模板选择功能。

**实现日期**: 2025-01-15  
**状态**: 前端已完成，等待后端 WebSocket 服务实现

---

## ✅ 已完成功能

### 1. 消息模板选择功能

#### 1.1 增强消息发送组件

**文件**: `apps/web-antd/src/views/system/message/components/MessageSendModal.vue`

**新增功能**:
- 添加消息模板下拉选择框
- 选择模板后自动填充标题和内容
- 支持手动修改模板内容

**实现细节**:
```typescript
// 加载消息模板列表
async function loadTemplates() {
  const templates = await getMessageTemplateListApi();
  templateOptions.value = templates.map((template: any) => ({
    label: template.templateName,
    value: template.id,
    content: template.templateContent,
  }));
}

// 监听模板选择变化
formApi.form.watch('templateId', async (templateId) => {
  if (templateId) {
    const template = templateOptions.value.find((t) => t.value === templateId);
    if (template) {
      await formApi.setFieldValue('title', template.label);
      await formApi.setFieldValue('content', template.content);
    }
  }
});
```

#### 1.2 新增模板 API

**文件**: `apps/web-antd/src/api/sys/message-template.ts`

**新增接口**:
```typescript
/**
 * 获取所有启用的消息模板列表（用于下拉选择）
 */
export async function getMessageTemplateListApi() {
  return requestClient.get<MessageTemplateApi.MessageTemplateVO[]>(
    '/system/message/template/list',
    { params: { status: 1 } },
  );
}
```

---

### 2. WebSocket 客户端实现

#### 2.1 WebSocket 管理类

**文件**: `apps/web-antd/src/utils/websocket.ts`

**核心功能**:
- ✅ 自动连接和断开
- ✅ 心跳检测（默认30秒）
- ✅ 自动重连（指数退避策略）
- ✅ 消息订阅和分发
- ✅ 连接状态管理
- ✅ 调试日志输出

**使用示例**:
```typescript
import { initWebSocket, getWebSocketClient } from '#/utils/websocket';

// 初始化连接
const wsClient = initWebSocket(token);

// 订阅消息
const unsubscribe = wsClient.onMessage((message) => {
  console.log('收到消息:', message);
});

// 发送消息
wsClient.send({
  type: 'heartbeat',
  data: null,
  timestamp: Date.now(),
});

// 关闭连接
wsClient.close();
```

**配置选项**:
```typescript
interface WebSocketConfig {
  url: string;                    // WebSocket 服务地址
  heartbeatInterval?: number;     // 心跳间隔（默认30秒）
  reconnectInterval?: number;     // 重连间隔（默认3秒）
  maxReconnectAttempts?: number;  // 最大重连次数（默认10次）
  debug?: boolean;                // 是否开启调试日志
}
```

#### 2.2 消息通知 Composable

**文件**: `apps/web-antd/src/composables/useMessageNotification.ts`

**核心功能**:
- ✅ 自动初始化 WebSocket 连接
- ✅ 处理新消息推送通知
- ✅ 实时更新未读消息数量
- ✅ 桌面通知提醒
- ✅ 提示音播放（可选）
- ✅ 点击通知跳转到消息页面

**使用示例**:
```typescript
import { useMessageNotification, unreadCount } from '#/composables/useMessageNotification';

// 在组件中使用
const { refreshUnreadCount } = useMessageNotification();

// 获取未读数量
console.log('未读消息:', unreadCount.value);

// 手动刷新未读数量
refreshUnreadCount();
```

**消息类型处理**:
```typescript
switch (msg.type) {
  case 'message':
    // 新消息推送 - 显示通知
    handleNewMessage(msg.data);
    break;
  case 'unread_count':
    // 未读数量更新
    unreadCount.value = msg.data;
    break;
  case 'error':
    // 错误消息
    antMessage.error(msg.data.message);
    break;
}
```

#### 2.3 集成到布局组件

**文件**: `apps/web-antd/src/layouts/basic.vue`

**修改内容**:
1. 导入 WebSocket 相关功能
2. 使用实时未读数量显示红点
3. 标记已读后刷新未读数量

**代码示例**:
```typescript
import { useMessageNotification, unreadCount } from '#/composables/useMessageNotification';

// 使用消息通知
const { refreshUnreadCount } = useMessageNotification();

// 使用 WebSocket 实时未读数量
const showDot = computed(() => unreadCount.value > 0);

// 标记已读后刷新
async function handleNotificationClick(item: NotificationItem) {
  await markAsReadApi(Number(item.id));
  refreshUnreadCount(); // 刷新未读数量
}
```

---

## 🔧 配置说明

### 环境变量配置

在 `.env.development` 和 `.env.production` 中添加：

```bash
# WebSocket 服务地址（可选，默认使用当前域名）
VITE_WEBSOCKET_URL=localhost:8080
```

### WebSocket URL 规则

```typescript
// 自动根据协议选择 ws 或 wss
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = import.meta.env.VITE_WEBSOCKET_URL || window.location.host;
const url = `${protocol}//${host}/ws/message`;
```

**示例**:
- 开发环境: `ws://localhost:8080/ws/message`
- 生产环境: `wss://your-domain.com/ws/message`

---

## 📡 WebSocket 消息协议

### 客户端 → 服务端

#### 1. 心跳消息
```json
{
  "type": "heartbeat",
  "data": null,
  "timestamp": 1705305600000
}
```

#### 2. 已读确认（可选）
```json
{
  "type": "read_confirm",
  "data": {
    "messageId": 123
  },
  "timestamp": 1705305600000
}
```

### 服务端 → 客户端

#### 1. 新消息推送
```json
{
  "type": "message",
  "data": {
    "id": 123,
    "title": "系统通知",
    "content": "您有一条新消息",
    "messageType": 1,
    "senderId": 1,
    "senderName": "管理员",
    "createTime": "2025-01-15T10:30:00"
  },
  "timestamp": 1705305600000
}
```

#### 2. 未读数量更新
```json
{
  "type": "unread_count",
  "data": 5,
  "timestamp": 1705305600000
}
```

#### 3. 心跳响应
```json
{
  "type": "heartbeat",
  "data": "pong",
  "timestamp": 1705305600000
}
```

#### 4. 错误消息
```json
{
  "type": "error",
  "data": {
    "code": "AUTH_FAILED",
    "message": "认证失败"
  },
  "timestamp": 1705305600000
}
```

---

## 🚀 后端实现要求

### 1. WebSocket 端点

**路径**: `/ws/message`

**认证方式**: 通过 URL 参数传递 token
```
ws://localhost:8080/ws/message?token=xxx
```

### 2. 连接管理

#### 2.1 连接池结构
```java
// 按租户和用户ID管理连接
Map<Long, Map<Long, Set<WebSocketSession>>> connectionPool;
// tenantId -> userId -> sessions
```

#### 2.2 连接建立流程
1. 验证 token 有效性
2. 提取用户ID和租户ID
3. 将连接存入连接池
4. 发送连接成功消息

#### 2.3 连接断开流程
1. 从连接池中移除
2. 清理相关资源
3. 记录日志

### 3. 消息推送

#### 3.1 推送逻辑
```java
public void pushMessage(Long tenantId, Long userId, Message message) {
    // 1. 获取用户的所有活跃连接
    Set<WebSocketSession> sessions = getActiveSessions(tenantId, userId);
    
    // 2. 构建推送消息
    WebSocketMessage wsMessage = WebSocketMessage.builder()
        .type("message")
        .data(message)
        .timestamp(System.currentTimeMillis())
        .build();
    
    // 3. 向所有连接推送
    for (WebSocketSession session : sessions) {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(JSON.toJSONString(wsMessage)));
        }
    }
}
```

#### 3.2 未读数量推送
```java
public void pushUnreadCount(Long tenantId, Long userId) {
    // 1. 查询未读数量
    int count = messageService.getUnreadCount(tenantId, userId);
    
    // 2. 推送给用户
    WebSocketMessage wsMessage = WebSocketMessage.builder()
        .type("unread_count")
        .data(count)
        .timestamp(System.currentTimeMillis())
        .build();
    
    pushToUser(tenantId, userId, wsMessage);
}
```

### 4. 心跳检测

#### 4.1 服务端心跳检测
```java
@Scheduled(fixedRate = 60000) // 每60秒检查一次
public void checkHeartbeat() {
    long now = System.currentTimeMillis();
    
    connectionPool.forEach((tenantId, userMap) -> {
        userMap.forEach((userId, sessions) -> {
            sessions.removeIf(session -> {
                long lastHeartbeat = getLastHeartbeat(session);
                // 90秒未收到心跳，关闭连接
                if (now - lastHeartbeat > 90000) {
                    try {
                        session.close();
                    } catch (IOException e) {
                        log.error("关闭超时连接失败", e);
                    }
                    return true;
                }
                return false;
            });
        });
    });
}
```

#### 4.2 心跳响应
```java
@Override
public void handleTextMessage(WebSocketSession session, TextMessage message) {
    WebSocketMessage wsMessage = JSON.parseObject(message.getPayload(), WebSocketMessage.class);
    
    if ("heartbeat".equals(wsMessage.getType())) {
        // 更新最后心跳时间
        updateLastHeartbeat(session);
        
        // 响应心跳
        WebSocketMessage response = WebSocketMessage.builder()
            .type("heartbeat")
            .data("pong")
            .timestamp(System.currentTimeMillis())
            .build();
        
        session.sendMessage(new TextMessage(JSON.toJSONString(response)));
    }
}
```

### 5. 租户隔离

```java
public void pushMessage(Message message) {
    // 1. 获取消息的租户ID
    Long tenantId = message.getTenantId();
    
    // 2. 获取接收人列表
    List<Long> receiverIds = message.getReceiverIds();
    
    // 3. 只向同租户的用户推送
    for (Long userId : receiverIds) {
        // 验证用户属于该租户
        if (userBelongsToTenant(userId, tenantId)) {
            pushToUser(tenantId, userId, message);
        }
    }
}
```

### 6. 监控接口

#### 6.1 查询活跃连接数
```java
@GetMapping("/ws/connections/count")
public Result<Integer> getConnectionCount() {
    return Result.success(connectionPool.size());
}
```

#### 6.2 按租户查询连接
```java
@GetMapping("/ws/connections/tenant/{tenantId}")
public Result<Map<Long, Integer>> getTenantConnections(@PathVariable Long tenantId) {
    Map<Long, Integer> result = new HashMap<>();
    Map<Long, Set<WebSocketSession>> userMap = connectionPool.get(tenantId);
    
    if (userMap != null) {
        userMap.forEach((userId, sessions) -> {
            result.put(userId, sessions.size());
        });
    }
    
    return Result.success(result);
}
```

---

## 📝 使用说明

### 前端使用

#### 1. 自动初始化

WebSocket 连接会在用户登录后自动建立，无需手动初始化。

#### 2. 接收消息通知

新消息会自动显示桌面通知，点击通知可跳转到消息页面。

#### 3. 查看未读数量

未读数量会实时显示在顶部导航栏的通知图标上。

#### 4. 使用消息模板

在发送消息时，可以从下拉框选择已有的消息模板，系统会自动填充标题和内容。

### 后端集成

#### 1. 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

#### 2. 配置 WebSocket

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(messageWebSocketHandler(), "/ws/message")
                .setAllowedOrigins("*")
                .addInterceptors(new WebSocketHandshakeInterceptor());
    }
    
    @Bean
    public WebSocketHandler messageWebSocketHandler() {
        return new MessageWebSocketHandler();
    }
}
```

#### 3. 实现消息推送

```java
@Service
public class MessagePushService {
    
    @Autowired
    private WebSocketConnectionPool connectionPool;
    
    public void pushNewMessage(Message message) {
        // 获取接收人列表
        List<Long> receiverIds = getReceiverIds(message);
        
        // 推送给每个接收人
        for (Long userId : receiverIds) {
            pushToUser(message.getTenantId(), userId, message);
        }
    }
}
```

---

## 🐛 故障排查

### 1. WebSocket 连接失败

**问题**: 无法建立 WebSocket 连接

**排查步骤**:
1. 检查后端 WebSocket 服务是否启动
2. 检查 token 是否有效
3. 检查网络连接和防火墙设置
4. 查看浏览器控制台错误信息

**解决方案**:
- 确保后端 WebSocket 端点正确配置
- 验证 token 格式和有效期
- 检查 CORS 配置

### 2. 消息推送不及时

**问题**: 收到消息有延迟

**排查步骤**:
1. 检查心跳是否正常
2. 查看网络延迟
3. 检查服务器负载

**解决方案**:
- 调整心跳间隔
- 优化服务器性能
- 使用负载均衡

### 3. 自动重连失败

**问题**: 断线后无法自动重连

**排查步骤**:
1. 检查重连次数是否达到上限
2. 查看 token 是否过期
3. 检查网络状态

**解决方案**:
- 增加最大重连次数
- 刷新 token
- 检查网络连接

---

## 📊 性能优化建议

### 1. 连接池管理

- 定期清理无效连接
- 限制单用户最大连接数
- 使用连接池监控

### 2. 消息推送优化

- 批量推送消息
- 使用消息队列缓冲
- 异步推送处理

### 3. 心跳优化

- 根据网络状况动态调整心跳间隔
- 使用二进制心跳消息减少流量
- 服务端主动推送心跳

---

## 🔐 安全建议

### 1. 认证和授权

- 使用 JWT token 进行身份验证
- 验证 token 有效期
- 实现租户隔离

### 2. 消息加密

- 使用 WSS (WebSocket Secure)
- 敏感消息内容加密
- 防止消息篡改

### 3. 防护措施

- 限制连接频率
- 防止 DDoS 攻击
- 监控异常连接

---

## 📅 后续计划

### 短期计划

- [ ] 后端 WebSocket 服务实现
- [ ] 消息推送测试
- [ ] 性能压力测试

### 中期计划

- [ ] 添加消息撤回功能
- [ ] 支持富文本消息
- [ ] 消息已读回执

### 长期计划

- [ ] 支持文件传输
- [ ] 群组消息推送
- [ ] 消息搜索功能

---

## 📚 参考资料

- [WebSocket API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
- [Spring WebSocket 文档](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [Vben Admin 官方文档](https://doc.vben.pro/)

---

**文档维护**: 开发团队  
**最后更新**: 2025-01-15
