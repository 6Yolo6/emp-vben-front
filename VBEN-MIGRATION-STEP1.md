# Vben Admin 迁移 - 第一步：项目初始化

## 当前任务

下载并初始化 Vben Admin 项目

## 执行步骤

### 步骤1：下载 Vben Admin（精简版）

在项目根目录打开终端，执行以下命令：

```bash
# 克隆精简版 Vben Admin
git clone https://github.com/vbenjs/vue-vben-admin.git emp-vben-admin

# 进入项目目录
cd emp-vben-admin

# 切换到精简版分支（如果有的话）
# git checkout lite
```

**注意**：精简版相比完整版：

- 更少的示例代码
- 更小的项目体积
- 更快的安装速度
- 保留核心功能

### 步骤2：安装依赖

Vben Admin 使用 pnpm 作为包管理器。

#### 如果没有安装 pnpm：

```bash
# 安装 pnpm
npm install -g pnpm

# 或者使用 npm 的 npx
npx pnpm install
```

#### 如果已安装 pnpm：

```bash
pnpm install
```

**注意**：首次安装可能需要5-10分钟，请耐心等待。

### 步骤3：启动项目

```bash
pnpm dev
```

项目将在 `http://localhost:5173` 启动（端口可能不同）。

### 步骤4：验证项目

1. 打开浏览器访问 `http://localhost:5173`
2. 使用默认账号登录：
   - 用户名：`vben`
   - 密码：`123456`
3. 查看示例页面，熟悉项目结构

## 预期结果

✅ 项目成功下载 ✅ 依赖安装完成 ✅ 项目成功启动 ✅ 可以正常访问和登录

## 常见问题

### 问题1：pnpm 安装失败

**解决方案**：

```bash
# 清除 npm 缓存
npm cache clean --force

# 重新安装 pnpm
npm install -g pnpm --force
```

### 问题2：依赖安装超时

**解决方案**：

```bash
# 使用国内镜像
pnpm config set registry https://registry.npmmirror.com

# 重新安装
pnpm install
```

### 问题3：端口被占用

**解决方案**：

```bash
# 修改端口
pnpm dev --port 3000
```

### 问题4：Node 版本不兼容

**要求**：Node.js >= 18.0.0

**解决方案**：

```bash
# 检查 Node 版本
node -v

# 如果版本过低，升级 Node.js
# 下载地址：https://nodejs.org/
```

## 下一步

完成项目初始化后，进入第二步：

- 清理示例代码
- 配置环境变量
- 配置后端代理

## 检查清单

- [ ] Vben Admin 项目已下载
- [ ] pnpm 已安装
- [ ] 项目依赖已安装
- [ ] 项目可以正常启动
- [ ] 可以访问登录页面
- [ ] 可以使用默认账号登录
- [ ] 可以查看示例页面

---

**当前进度**：0/15天  
**下一步**：清理示例代码和配置环境
