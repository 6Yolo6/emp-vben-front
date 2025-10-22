import { requestClient } from '#/api/request';

enum Api {
  RoleCreate = '/system/role',
  RoleDelete = '/system/role',
  RoleDetail = '/system/role',
  RoleList = '/system/role/list',
  RoleMenus = '/system/role',
  RolePage = '/system/role/page',
  RoleUpdate = '/system/role',
}

// 查询角色列表
export async function getRoleListApi() {
  return requestClient.get<any[]>(Api.RoleList);
}

// 分页查询角色
export async function getRolePageApi(params: any) {
  return requestClient.get<any>(Api.RolePage, { params });
}

// 获取角色详情
export async function getRoleDetailApi(id: number) {
  return requestClient.get<any>(`${Api.RoleDetail}/${id}`);
}

// 创建角色
export async function createRoleApi(data: any) {
  return requestClient.post<any>(Api.RoleCreate, data);
}

// 更新角色
export async function updateRoleApi(data: any) {
  return requestClient.put<any>(`${Api.RoleUpdate}/${data.id}`, data);
}

// 删除角色
export async function deleteRoleApi(id: number) {
  return requestClient.delete<any>(`${Api.RoleDelete}/${id}`);
}

// 获取角色菜单权限
export async function getRoleMenusApi(roleId: number) {
  return requestClient.get<number[]>(`${Api.RoleMenus}/${roleId}/menus`);
}

// 分配角色菜单权限
export async function assignRoleMenusApi(roleId: number, menuIds: number[]) {
  return requestClient.post<any>(`${Api.RoleMenus}/${roleId}/menus`, menuIds);
}

// 获取角色自定义部门
export async function getRoleDeptsApi(roleId: number) {
  return requestClient.get<number[]>(`${Api.RoleMenus}/${roleId}/depts`);
}

// 分配角色自定义部门
export async function assignRoleDeptsApi(roleId: number, deptIds: number[]) {
  return requestClient.post<any>(`${Api.RoleMenus}/${roleId}/depts`, deptIds);
}
