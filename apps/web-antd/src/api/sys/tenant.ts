/**
 * 租户管理API
 */
import { requestClient } from '#/api/request';

export namespace TenantApi {
  /** 租户信息 */
  export interface Tenant {
    id: number;
    tenantCode: string;
    tenantName: string;
    tenantType?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    domain?: string;
    logo?: string;
    expireTime?: string;
    accountLimit?: number;
    storageLimit?: number;
    status: number;
    remark?: string;
    createTime?: string;
    updateTime?: string;
  }

  /** 租户查询参数 */
  export interface TenantQuery {
    tenantCode?: string;
    tenantName?: string;
    tenantType?: string;
    status?: number;
    pageNum?: number;
    pageSize?: number;
  }

  /** 租户创建参数 */
  export interface TenantCreate {
    tenantCode: string;
    tenantName: string;
    tenantType?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    domain?: string;
    logo?: string;
    expireTime?: string;
    accountLimit?: number;
    storageLimit?: number;
    status?: number;
    remark?: string;
  }

  /** 租户更新参数 */
  export interface TenantUpdate extends TenantCreate {
    id: number;
  }
}

/**
 * 获取租户列表
 */
export async function getTenantListApi() {
  return requestClient.get<TenantApi.Tenant[]>('/system/tenant/list');
}

/**
 * 分页查询租户
 */
export async function getTenantPageApi(params: TenantApi.TenantQuery) {
  return requestClient.get('/system/tenant/page', { params });
}

/**
 * 获取租户详情
 */
export async function getTenantDetailApi(id: number) {
  return requestClient.get<TenantApi.Tenant>(`/system/tenant/${id}`);
}

/**
 * 创建租户
 */
export async function createTenantApi(data: TenantApi.TenantCreate) {
  return requestClient.post('/system/tenant', data);
}

/**
 * 更新租户
 */
export async function updateTenantApi(id: number, data: TenantApi.TenantUpdate) {
  return requestClient.put(`/system/tenant/${id}`, data);
}

/**
 * 删除租户
 */
export async function deleteTenantApi(id: number) {
  return requestClient.delete(`/system/tenant/${id}`);
}

/**
 * 修改租户状态
 */
export async function updateTenantStatusApi(id: number, status: number) {
  return requestClient.put(`/system/tenant/${id}/status`, null, {
    params: { status },
  });
}

/**
 * 获取当前用户的租户列表
 */
export async function getMyTenantsApi() {
  return requestClient.get<TenantApi.Tenant[]>('/system/user-tenant/my-tenants');
}

/**
 * 设置主租户
 */
export async function setPrimaryTenantApi(tenantId: number) {
  return requestClient.put('/system/user-tenant/set-primary', null, {
    params: { tenantId },
  });
}
