# 登录过期弹窗配置

## 问题描述

当 token 过期时（后端返回 401），前端直接显示 "token已被冻结" 的错误消息，然后跳转到登录页面。

期望行为：弹出登录弹窗，而不是跳转到登录页面。

## 解决方案

### 1. 配置登录过期模式 ✅

**文件**: `emp-vben-admin/apps/web-antd/src/preferences.ts`

```typescript
export const overridesPreferences = defineOverridesPreferences({
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    // 登录过期模式：'modal' 弹窗模式 | 'page' 页面跳转模式
    loginExpiredMode: 'modal',
  },
});
```

### 2. 修改错误消息处理 ✅

**文件**: `emp-vben-admin/apps/web-antd/src/api/request.ts`

在错误消息拦截器中，跳过 401 错误的消息显示：

```typescript
client.addResponseInterceptor(
  errorMessageResponseInterceptor((msg: string, error) => {
    // 401 错误不显示消息，由登录弹窗处理
    if (error?.response?.status === 401) {
      return;
    }

    const responseData = error?.response?.data ?? {};
    const errorMessage = responseData?.error ?? responseData?.message ?? '';
    message.error(errorMessage || msg);
  }),
);
```

## 工作流程

### 当 token 过期时（401 错误）：

1. **请求拦截** - `authenticateResponseInterceptor` 捕获 401 错误
2. **判断模式** - 检查 `loginExpiredMode` 配置
3. **弹窗模式** - 如果是 'modal'：
   - 调用 `accessStore.setLoginExpired(true)` 触发登录弹窗
   - 不跳转页面
   - 不显示错误消息
4. **页面模式** - 如果是 'page'：
   - 调用 `authStore.logout()` 清除登录状态
   - 跳转到登录页面

## 相关配置

### Vben Admin 内置功能

Vben Admin 框架内置了登录过期处理机制：

- 当接口返回 401 状态码时，框架会认为登录认证过期
- 可以通过 `preferences.ts` 配置处理方式

### 两种模式对比

| 模式 | 配置值 | 行为 | 适用场景 |
| --- | --- | --- | --- |
| 弹窗模式 | `'modal'` | 弹出登录弹窗，用户可以在当前页面重新登录 | 单页应用，用户体验更好 |
| 页面模式 | `'page'` | 跳转到登录页面，清除所有状态 | 传统应用，安全性要求高 |

## 注意事项

1. **清除缓存** - 修改配置后需要清空浏览器缓存
2. **刷新 Token** - 如果启用了 `enableRefreshToken`，框架会先尝试刷新 token
3. **错误消息** - 401 错误不会显示后端返回的错误消息，避免用户困惑

## 测试步骤

1. 登录系统
2. 等待 token 过期或手动清除 token
3. 执行任意需要认证的操作
4. 应该弹出登录弹窗，而不是跳转到登录页面
5. 在弹窗中重新登录后，可以继续操作

## 相关文件

- `emp-vben-admin/apps/web-antd/src/preferences.ts` - 应用配置
- `emp-vben-admin/apps/web-antd/src/api/request.ts` - 请求拦截器
- `emp-vben-admin/packages/effects/request/src/request-client/preset-interceptors.ts` - 预设拦截器

## 参考文档

- [Vben Admin - 登录过期处理](https://doc.vben.pro/guide/in-depth/features.html)
