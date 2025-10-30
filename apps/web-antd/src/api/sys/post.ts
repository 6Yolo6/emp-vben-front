import { requestClient } from '#/api/request';

enum Api {
  PostCreate = '/system/post',
  PostDelete = '/system/post',
  PostDetail = '/system/post',
  PostList = '/system/post/list',
  PostPage = '/system/post/page',
  PostUpdate = '/system/post',
}

// 查询岗位列表
export async function getPostListApi() {
  return requestClient.get<any[]>(Api.PostList);
}

// 分页查询岗位
export async function getPostPageApi(params: any) {
  return requestClient.get<any>(Api.PostPage, { params });
}

// 获取岗位详情
export async function getPostDetailApi(id: number) {
  return requestClient.get<any>(`${Api.PostDetail}/${id}`);
}

// 创建岗位
export async function createPostApi(data: any) {
  return requestClient.post<any>(Api.PostCreate, data);
}

// 更新岗位
export async function updatePostApi(data: any) {
  return requestClient.put<any>(`${Api.PostUpdate}/${data.id}`, data);
}

// 删除岗位
export async function deletePostApi(id: number) {
  return requestClient.delete<any>(`${Api.PostDelete}/${id}`);
}

// 查询岗位角色
export async function getPostRolesApi(id: number) {
  return requestClient.get<number[]>(`/system/post/${id}/roles`);
}

// 分配岗位角色
export async function assignPostRolesApi(id: number, roleIds: number[]) {
  return requestClient.post(`/system/post/${id}/roles`, roleIds);
}

// 根据租户ID查询岗位列表
export async function getPostListByTenantApi(tenantId: number) {
  return requestClient.get<any[]>('/system/post/list/by-tenant', {
    params: { tenantId },
  });
}
