# Vben Admin 快速开始指南

## 项目信息

- **项目名称**：emp-vben-admin
- **技术栈**：Vue 3 + Vben Admin + Ant Design Vue + TypeScript
- **后端地址**：http://localhost:8080
- **当前状态**：✅ 基础配置完成

## 快速启动

### 1. 确保后端服务运行

```bash
# 在 rear-emp-platform 目录启动后端
cd rear-emp-platform
# 启动后端服务（确保在 8080 端口）
```

### 2. 启动前端项目

```bash
# 在项目根目录
cd emp-vben-admin

# 如果是首次启动，先安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

项目将在 `http://localhost:3000` 启动。

### 3. 登录测试

- 用户名：`admin`
- 密码：`admin123`

## 已完成工作

### ✅ 基础配置

- [x] 环境变量配置（端口 3000，关闭 Mock）
- [x] 代理配置（指向 localhost:8080）
- [x] 响应拦截器适配（successCode: 200）

### ✅ 数据模型（5 个）

- [x] 用户模型（User, UserPageParams, UserPageResult, LoginParams, LoginResult）
- [x] 角色模型（Role, RolePageParams, RolePageResult）
- [x] 岗位模型（Post, PostPageParams, PostPageResult）
- [x] 部门模型（Dept, DeptTreeNode）
- [x] 菜单模型（Menu, MenuTreeNode）

### ✅ API 接口（5 个模块）

- [x] 用户管理 API - 11 个接口（登录、登出、CRUD、状态、密码、角色、岗位）
- [x] 角色管理 API - 8 个接口（CRUD、菜单分配）
- [x] 岗位管理 API - 6 个接口（CRUD）
- [x] 部门管理 API - 7 个接口（CRUD、树查询、移动）
- [x] 菜单管理 API - 7 个接口（CRUD、树查询、用户菜单）

## 项目结构

```
emp-vben-admin/
└── apps/
    └── web-antd/
        ├── src/
        │   ├── api/
        │   │   ├── model/          ✅ 5个数据模型
        │   │   │   ├── userModel.ts
        │   │   │   ├── roleModel.ts
        │   │   │   ├── postModel.ts
        │   │   │   ├── deptModel.ts
        │   │   │   └── menuModel.ts
        │   │   ├── sys/            ✅ 5个API模块
        │   │   │   ├── user.ts
        │   │   │   ├── role.ts
        │   │   │   ├── post.ts
        │   │   │   ├── dept.ts
        │   │   │   └── menu.ts
        │   │   └── request.ts      ✅ 已配置
        │   ├── views/              ⏳ 待开发
        │   ├── router/             ⏳ 待配置
        │   └── store/              ⏳ 待配置
        ├── .env.development        ✅ 已配置
        ├── .env.production         ✅ 已配置
        └── vite.config.mts         ✅ 已配置
```

## 常用命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 配置说明

### 环境变量

```bash
# .env.development
VITE_APP_TITLE=EMP企业管理系统
VITE_PORT=3000
VITE_GLOB_API_URL=/api
VITE_NITRO_MOCK=false
VITE_DEVTOOLS=true
```

### 代理配置

```typescript
// vite.config.mts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

## 下一步工作

### ⏳ 第 2 天：登录适配

- [ ] 修改登录页面
- [ ] 适配认证流程
- [ ] 测试登录功能

### ⏳ 第 3-7 天：页面开发

- [ ] 用户管理页面
- [ ] 角色管理页面
- [ ] 岗位管理页面
- [ ] 部门管理页面
- [ ] 菜单管理页面

## 相关文档

- [迁移进度](./VBEN-MIGRATION-PROGRESS.md)
- [迁移计划](./VBEN-MIGRATION-PLAN.md)
- [Vben Admin 官方文档](https://doc.vben.pro/)

---

**更新时间**：2025-10-17  
**当前状态**：✅ 基础配置完成（第 1 天工作完成）  
**下一步**：登录适配
