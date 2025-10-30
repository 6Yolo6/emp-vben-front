import type { User, UserPageParams, UserPageResult } from '../model/userModel';

import { requestClient } from '#/api/request';

enum Api {
  UserCreate = '/system/user',
  UserDelete = '/system/user',
  UserDetail = '/system/user',
  UserList = '/system/user/list',
  UserPage = '/system/user/page',
  UserPassword = '/system/user',
  UserPosts = '/system/user',
  UserRoles = '/system/user',
  UserStatus = '/system/user',
  UserUpdate = '/system/user',
}

// 分页查询用户
export async function getUserPageApi(params: UserPageParams) {
  return requestClient.get<UserPageResult>(Api.UserPage, { params });
}

// 查询用户列表
export async function getUserListApi() {
  return requestClient.get<User[]>(Api.UserList);
}

// 查询用户详情
export async function getUserDetailApi(id: number) {
  return requestClient.get<User>(`${Api.UserDetail}/${id}`);
}

// 创建用户
export async function createUserApi(data: User) {
  return requestClient.post(Api.UserCreate, data);
}

// 更新用户
export async function updateUserApi(id: number, data: User) {
  return requestClient.put(`${Api.UserUpdate}/${id}`, data);
}

// 删除用户
export async function deleteUserApi(id: number) {
  return requestClient.delete(`${Api.UserDelete}/${id}`);
}

// 修改用户状态
export async function updateUserStatusApi(id: number, status: number) {
  return requestClient.put(`${Api.UserStatus}/${id}/status`, null, {
    params: { status },
  });
}

// 重置密码
export async function resetUserPasswordApi(id: number, password: string) {
  return requestClient.put<string>(`${Api.UserPassword}/${id}/password`, null, {
    params: { newPassword: password },
  });
}

// 查询用户角色
export async function getUserRolesApi(id: number) {
  return requestClient.get<number[]>(`${Api.UserRoles}/${id}/roles`);
}

// 分配用户角色
export async function assignUserRolesApi(id: number, roleIds: number[]) {
  return requestClient.post(`${Api.UserRoles}/${id}/roles`, roleIds);
}

// 查询用户岗位
export async function getUserPostsApi(id: number) {
  return requestClient.get<number[]>(`${Api.UserPosts}/${id}/posts`);
}

// 分配用户岗位
export async function assignUserPostsApi(id: number, postIds: number[]) {
  return requestClient.post(`${Api.UserPosts}/${id}/posts`, postIds);
}

// 获取用户权限信息
export async function getUserPermissionsApi(id: number) {
  return requestClient.get<any>(`/system/user/${id}/permissions`);
}

// 获取用户直接分配的菜单ID
export async function getUserDirectMenusApi(id: number) {
  return requestClient.get<number[]>(`/system/user/${id}/direct-menus`);
}

// 分配用户权限
export async function assignUserPermissionsApi(id: number, menuIds: number[]) {
  return requestClient.post(`/system/user/${id}/permissions`, menuIds);
}
