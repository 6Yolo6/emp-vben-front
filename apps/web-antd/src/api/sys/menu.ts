import type { Menu, MenuTreeNode } from '../model/menuModel';

import { requestClient } from '#/api/request';

enum Api {
  MenuCreate = '/system/menu',
  MenuDelete = '/system/menu',
  MenuDetail = '/system/menu',
  MenuList = '/system/menu/list',
  MenuTree = '/system/menu/tree',
  MenuUpdate = '/system/menu',
  UserMenuTree = '/system/menu/user-tree',
}

// 查询菜单树
export async function getMenuTreeApi() {
  return requestClient.get<MenuTreeNode[]>(Api.MenuTree);
}

// 查询菜单列表
export async function getMenuListApi() {
  return requestClient.get<Menu[]>(Api.MenuList);
}

// 查询菜单详情
export async function getMenuDetailApi(id: number) {
  return requestClient.get<Menu>(`${Api.MenuDetail}/${id}`);
}

// 创建菜单
export async function createMenuApi(data: Menu) {
  return requestClient.post(Api.MenuCreate, data);
}

// 更新菜单
export async function updateMenuApi(data: Menu) {
  return requestClient.put(`${Api.MenuUpdate}/${data.id}`, data);
}

// 删除菜单
export async function deleteMenuApi(id: number) {
  return requestClient.delete(`${Api.MenuDelete}/${id}`);
}

// 查询用户菜单树（用于动态路由）
export async function getUserMenuTreeApi() {
  return requestClient.get<MenuTreeNode[]>(Api.UserMenuTree);
}
