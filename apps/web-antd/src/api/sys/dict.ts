/**
 * 字典管理API
 */
import { requestClient } from '#/api/request';

export namespace DictApi {
  // 字典类型
  export interface DictType {
    id?: number;
    dictName: string;
    dictType: string;
    status?: number;
    remark?: string;
    createTime?: string;
    updateTime?: string;
  }

  // 字典数据
  export interface DictData {
    id?: number;
    dictSort?: number;
    dictLabel: string;
    dictValue: string;
    dictType: string;
    cssClass?: string;
    listClass?: string;
    isDefault?: number;
    status?: number;
    remark?: string;
    createTime?: string;
    updateTime?: string;
  }

  // 分页参数
  export interface PageParams {
    pageNum?: number;
    pageSize?: number;
  }

  // 字典类型查询参数
  export interface DictTypeQuery extends PageParams {
    dictName?: string;
    dictType?: string;
    status?: number;
  }

  // 字典数据查询参数
  export interface DictDataQuery extends PageParams {
    dictType?: string;
    dictLabel?: string;
    status?: number;
  }
}

// ========== 字典类型管理 ==========

/**
 * 分页查询字典类型
 */
export async function getDictTypePage(params: DictApi.DictTypeQuery) {
  return requestClient.get('/system/dict/type/page', { params });
}

/**
 * 根据ID查询字典类型
 */
export async function getDictTypeById(id: number) {
  return requestClient.get(`/system/dict/type/${id}`);
}

/**
 * 创建字典类型
 */
export async function createDictType(data: DictApi.DictType) {
  return requestClient.post('/system/dict/type', data);
}

/**
 * 更新字典类型
 */
export async function updateDictType(data: DictApi.DictType) {
  return requestClient.put('/system/dict/type', data);
}

/**
 * 删除字典类型
 */
export async function deleteDictType(id: number) {
  return requestClient.delete(`/system/dict/type/${id}`);
}

/**
 * 刷新字典缓存
 */
export async function refreshDictCache() {
  return requestClient.post('/system/dict/type/refresh');
}

// ========== 字典数据管理 ==========

/**
 * 根据字典类型查询字典数据
 */
export async function getDictDataByType(dictType: string) {
  return requestClient.get(`/system/dict/data/type/${dictType}`);
}

/**
 * 分页查询字典数据
 */
export async function getDictDataPage(params: DictApi.DictDataQuery) {
  return requestClient.get('/system/dict/data/page', { params });
}

/**
 * 创建字典数据
 */
export async function createDictData(data: DictApi.DictData) {
  return requestClient.post('/system/dict/data', data);
}

/**
 * 更新字典数据
 */
export async function updateDictData(data: DictApi.DictData) {
  return requestClient.put('/system/dict/data', data);
}

/**
 * 删除字典数据
 */
export async function deleteDictData(id: number) {
  return requestClient.delete(`/system/dict/data/${id}`);
}

/**
 * 根据字典类型和值获取标签
 */
export async function getDictLabel(dictType: string, dictValue: string) {
  return requestClient.get('/system/dict/data/label', {
    params: { dictType, dictValue },
  });
}
