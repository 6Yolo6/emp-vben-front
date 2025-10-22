import type { Dept, DeptTreeNode } from '../model/deptModel';

import { requestClient } from '#/api/request';

enum Api {
  DeptCreate = '/system/dept',
  DeptDelete = '/system/dept',
  DeptDetail = '/system/dept',
  DeptList = '/system/dept/list',
  DeptMove = '/system/dept',
  DeptTree = '/system/dept/tree',
  DeptUpdate = '/system/dept',
}

// 查询部门树
export async function getDeptTreeApi() {
  return requestClient.get<DeptTreeNode[]>(Api.DeptTree);
}

// 查询部门列表
export async function getDeptListApi() {
  return requestClient.get<Dept[]>(Api.DeptList);
}

// 查询部门详情
export async function getDeptDetailApi(id: number) {
  return requestClient.get<Dept>(`${Api.DeptDetail}/${id}`);
}

// 创建部门
export async function createDeptApi(data: Dept) {
  return requestClient.post(Api.DeptCreate, data);
}

// 更新部门
export async function updateDeptApi(data: Dept) {
  return requestClient.put(`${Api.DeptUpdate}/${data.id}`, data);
}

// 删除部门
export async function deleteDeptApi(id: number) {
  return requestClient.delete(`${Api.DeptDelete}/${id}`);
}

// 移动部门
export async function moveDeptApi(id: number, newParentId: number) {
  return requestClient.put(`${Api.DeptMove}/${id}/move`, { newParentId });
}
