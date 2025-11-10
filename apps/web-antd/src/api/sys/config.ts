import { requestClient } from '#/api/request';

export namespace ConfigApi {
  // 系统参数查询DTO
  export interface ConfigQueryDTO {
    configName?: string;
    configKey?: string;
    configType?: number;
    pageNum?: number;
    pageSize?: number;
  }

  // 系统参数创建DTO
  export interface ConfigCreateDTO {
    configName: string;
    configKey: string;
    configValue?: string;
    configType: number;
    remark?: string;
  }

  // 系统参数更新DTO
  export interface ConfigUpdateDTO {
    id: number;
    configName: string;
    configKey: string;
    configValue?: string;
    configType: number;
    remark?: string;
  }

  // 系统参数VO
  export interface ConfigVO {
    id: number;
    configName: string;
    configKey: string;
    configValue?: string;
    configType: number;
    remark?: string;
    createTime?: string;
    updateTime?: string;
  }
}

/**
 * 分页查询系统参数
 */
export async function getConfigPageApi(params: ConfigApi.ConfigQueryDTO) {
  return requestClient.get<PageResult<ConfigApi.ConfigVO>>('/system/config/page', {
    params,
  });
}

/**
 * 根据ID查询系统参数
 */
export async function getConfigByIdApi(id: number) {
  return requestClient.get<ConfigApi.ConfigVO>(`/system/config/${id}`);
}

/**
 * 根据参数键名查询参数值
 */
export async function getConfigByKeyApi(configKey: string) {
  return requestClient.get<string>(`/system/config/key/${configKey}`);
}

/**
 * 创建系统参数
 */
export async function createConfigApi(data: ConfigApi.ConfigCreateDTO) {
  return requestClient.post<number>('/system/config', data);
}

/**
 * 更新系统参数
 */
export async function updateConfigApi(data: ConfigApi.ConfigUpdateDTO) {
  return requestClient.put<void>('/system/config', data);
}

/**
 * 删除系统参数
 */
export async function deleteConfigApi(id: number) {
  return requestClient.delete<void>(`/system/config/${id}`);
}

/**
 * 批量删除系统参数
 */
export async function deleteConfigBatchApi(ids: number[]) {
  return requestClient.delete<void>('/system/config/batch', { data: ids });
}

/**
 * 刷新参数缓存
 */
export async function refreshConfigCacheApi() {
  return requestClient.post<void>('/system/config/refresh');
}

/**
 * 清空参数缓存
 */
export async function clearConfigCacheApi() {
  return requestClient.delete<void>('/system/config/cache');
}
