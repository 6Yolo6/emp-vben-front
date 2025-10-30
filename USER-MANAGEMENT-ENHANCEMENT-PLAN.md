# 用户管理功能增强计划

## 需求概述

### 1. 用户编辑框显示权限信息
- 在用户编辑/查看时，显示该用户的所有权限
- 包括通过角色、岗位继承的权限
- 包括直接分配给用户的权限

### 2. 双击列表查看详情
- 支持双击用户列表行，打开只读详情弹窗
- 详情弹窗显示完整的用户信息和权限信息

### 3. 直接对用户分配权限
- 新增"分配权限"功能
- 可以直接给用户分配菜单权限，不通过角色/岗位
- 需要新建 `sys_user_menu` 关联表

### 4. 租户数据隔离问题
- 当前问题：添加新单位时，角色、岗位、部门下拉框没有做租户隔离
- 解决方案：根据选择的租户ID，动态加载对应租户的数据

## 实施步骤

### 阶段一：数据库设计（后端）

#### 1.1 创建用户权限关联表
```sql
-- sys_user_menu: 用户直接分配的菜单权限
CREATE TABLE sys_user_menu (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    menu_id BIGINT NOT NULL COMMENT '菜单ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    create_by VARCHAR(64) COMMENT '创建者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_menu_tenant (user_id, menu_id, tenant_id)
) COMMENT='用户菜单权限关联表';
```

### 阶段二：后端API开发

#### 2.1 用户权限查询API
- `GET /system/user/{id}/permissions` - 获取用户的所有权限
  - 返回：角色权限、岗位权限、直接分配的权限（分类显示）

#### 2.2 用户权限分配API
- `POST /system/user/{id}/assign-permissions` - 直接给用户分配权限
- `GET /system/user/{id}/direct-permissions` - 获取用户直接分配的权限

#### 2.3 租户数据隔离API
- `GET /system/role/list-by-tenant?tenantId={tenantId}` - 根据租户获取角色列表
- `GET /system/post/list-by-tenant?tenantId={tenantId}` - 根据租户获取岗位列表
- `GET /system/dept/list-by-tenant?tenantId={tenantId}` - 根据租户获取部门列表

### 阶段三：前端功能开发

#### 3.1 用户详情弹窗
- 创建 `UserDetailModal.vue` 组件
- 显示用户基本信息
- 显示用户所属单位列表
- 显示用户权限信息（分类显示）

#### 3.2 双击查看详情
- 在用户列表添加 `@row-dblclick` 事件
- 打开详情弹窗

#### 3.3 分配权限功能
- 创建 `AssignPermissionsModal.vue` 组件
- 使用树形选择器选择菜单权限
- 区分显示：已有权限（通过角色/岗位）、直接分配的权限

#### 3.4 租户数据隔离
- 修改 `UserFormModal.vue`
- 监听租户选择变化
- 动态加载对应租户的角色、岗位、部门数据

## 详细实现方案

### 方案1：用户权限查询

**后端VO设计：**
```java
public class UserPermissionVO {
    private List<PermissionItem> rolePermissions;    // 通过角色获得的权限
    private List<PermissionItem> postPermissions;    // 通过岗位获得的权限
    private List<PermissionItem> directPermissions;  // 直接分配的权限
    
    @Data
    public static class PermissionItem {
        private Long menuId;
        private String menuName;
        private String perms;
        private String source;  // 来源：角色名/岗位名
    }
}
```

### 方案2：租户数据隔离

**前端实现：**
```typescript
// 监听租户变化
watch(() => formData.tenants, (newTenants) => {
  if (newTenants && newTenants.length > 0) {
    const currentTenant = newTenants[newTenants.length - 1];
    loadTenantData(currentTenant.tenantId);
  }
}, { deep: true });

// 加载租户数据
async function loadTenantData(tenantId: number) {
  const [roles, posts, depts] = await Promise.all([
    getRolesByTenantApi(tenantId),
    getPostsByTenantApi(tenantId),
    getDeptsByTenantApi(tenantId)
  ]);
  
  roleOptions.value = roles;
  postOptions.value = posts;
  deptOptions.value = depts;
}
```

## 优先级

1. **高优先级**：租户数据隔离（影响数据安全）
2. **中优先级**：双击查看详情、显示权限信息
3. **低优先级**：直接分配权限（可以通过角色/岗位实现）

## 预计工作量

- 数据库设计：0.5小时
- 后端API开发：4小时
- 前端功能开发：6小时
- 测试和调试：2小时
- **总计：12.5小时**

## 下一步行动

建议按以下顺序实施：
1. 先解决租户数据隔离问题（最紧急）
2. 实现双击查看详情和权限显示
3. 最后实现直接分配权限功能
